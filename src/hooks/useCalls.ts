import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createPeerConnection,
  getLocalStream,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addIceCandidate,
  addStreamToPeerConnection,
  stopStream,
} from '@/lib/webrtc';
import { toast } from 'sonner';
import i18n from '@/i18n';

export interface Call {
  id: string;
  caller_id: string;
  callee_id: string;
  call_type: 'voice' | 'video';
  status: 'calling' | 'accepted' | 'rejected' | 'missed' | 'ended';
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  created_at: string;
  caller?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  callee?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Fetch incoming calls
export const useIncomingCalls = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['incoming-calls', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          caller:profiles!calls_caller_id_fkey(id, full_name, avatar_url)
        `)
        .eq('callee_id', user.id)
        .eq('status', 'calling')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Call | null;
    },
    enabled: !!user,
    refetchInterval: 2000, // Poll every 2 seconds for incoming calls
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('calls-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls',
          filter: `callee_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['incoming-calls'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
};

// Start a call
export const useStartCall = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      calleeId,
      callType,
    }: {
      calleeId: string;
      callType: 'voice' | 'video';
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('calls')
        .insert({
          caller_id: user.id,
          callee_id: calleeId,
          call_type: callType,
          status: 'calling',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Call;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    },
    onError: () => {
      toast.error(i18n.t('toast.error'));
    },
  });
};

// Answer a call
export const useAnswerCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (callId: string) => {
      const { data, error } = await supabase
        .from('calls')
        .update({
          status: 'accepted',
          started_at: new Date().toISOString(),
        })
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;
      return data as Call;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incoming-calls'] });
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    },
  });
};

// Reject a call
export const useRejectCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (callId: string) => {
      const { data, error } = await supabase
        .from('calls')
        .update({ status: 'rejected' })
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;
      return data as Call;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incoming-calls'] });
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    },
  });
};

// End a call
export const useEndCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      callId,
      duration,
    }: {
      callId: string;
      duration: number;
    }) => {
      const { data, error } = await supabase
        .from('calls')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
          duration_seconds: duration,
        })
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;
      return data as Call;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incoming-calls'] });
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    },
  });
};

// Mark call as missed
export const useMissCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (callId: string) => {
      const { data, error } = await supabase
        .from('calls')
        .update({ status: 'missed' })
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;
      return data as Call;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incoming-calls'] });
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    },
  });
};

// WebRTC call signaling hook
export const useCallSignaling = (callId: string | null) => {
  const { user } = useAuth();
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const iceCandidateBuffer = useRef<{ candidate: RTCIceCandidateInit; senderId: string }[]>([]);
  const isChannelReady = useRef(false);
  const pendingOffer = useRef<{ sdp: RTCSessionDescriptionInit; senderId: string } | null>(null);

  // Process buffered ICE candidates after remote description is set
  const processBufferedCandidates = useCallback(async (pc: RTCPeerConnection, currentUserId: string) => {
    while (iceCandidateBuffer.current.length > 0) {
      const item = iceCandidateBuffer.current.shift();
      if (item && item.senderId !== currentUserId) {
        try {
          await addIceCandidate(pc, item.candidate);
        } catch (err) {
          console.warn('Failed to add buffered ICE candidate:', err);
        }
      }
    }
  }, []);

  const initializeCall = async (callType: 'voice' | 'video', isInitiator: boolean) => {
    if (!callId || !user) return;

    try {
      // Reset buffers
      iceCandidateBuffer.current = [];
      isChannelReady.current = false;
      pendingOffer.current = null;

      // Get local stream
      const stream = await getLocalStream(callType);
      setLocalStream(stream);

      // Create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Add local stream to peer connection
      addStreamToPeerConnection(pc, stream);

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        setRemoteStream(event.streams[0]);
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        setConnectionState(pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
      };

      // Set up signaling channel
      const channel = supabase.channel(`call:${callId}`);
      channelRef.current = channel;

      // Handle ICE candidates - only send when channel is ready
      pc.onicecandidate = (event) => {
        if (event.candidate && isChannelReady.current) {
          channel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: { candidate: event.candidate.toJSON(), senderId: user.id },
          });
        }
      };

      // Listen for signaling events
      channel
        .on('broadcast', { event: 'offer' }, async ({ payload }) => {
          if (payload.senderId !== user.id && peerConnectionRef.current) {
            try {
              await setRemoteDescription(peerConnectionRef.current, payload.sdp);
              await processBufferedCandidates(peerConnectionRef.current, user.id);
              const answer = await createAnswer(peerConnectionRef.current);
              if (isChannelReady.current) {
                channel.send({
                  type: 'broadcast',
                  event: 'answer',
                  payload: { sdp: answer, senderId: user.id },
                });
              }
            } catch (err) {
              console.error('Error handling offer:', err);
            }
          }
        })
        .on('broadcast', { event: 'answer' }, async ({ payload }) => {
          if (payload.senderId !== user.id && peerConnectionRef.current) {
            try {
              await setRemoteDescription(peerConnectionRef.current, payload.sdp);
              await processBufferedCandidates(peerConnectionRef.current, user.id);
            } catch (err) {
              console.error('Error handling answer:', err);
            }
          }
        })
        .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
          if (payload.senderId !== user.id && peerConnectionRef.current) {
            // Buffer ICE candidates if remote description not set yet
            if (!peerConnectionRef.current.remoteDescription) {
              iceCandidateBuffer.current.push(payload);
            } else {
              try {
                await addIceCandidate(peerConnectionRef.current, payload.candidate);
              } catch (err) {
                console.warn('Failed to add ICE candidate:', err);
              }
            }
          }
        })
        .on('broadcast', { event: 'end-call' }, () => {
          cleanup();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Signaling channel ready');
            isChannelReady.current = true;
            
            // If initiator, create and send offer now that channel is ready
            if (isInitiator && peerConnectionRef.current) {
              createOffer(peerConnectionRef.current).then((offer) => {
                channel.send({
                  type: 'broadcast',
                  event: 'offer',
                  payload: { sdp: offer, senderId: user.id },
                });
              });
            }
          }
        });
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error(i18n.t('toast.error'));
    }
  };

  const cleanup = useCallback(() => {
    if (localStream) {
      stopStream(localStream);
    }
    if (remoteStream) {
      stopStream(remoteStream);
    }
    setLocalStream(null);
    setRemoteStream(null);
    iceCandidateBuffer.current = [];
    isChannelReady.current = false;

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [localStream, remoteStream]);

  // Cleanup on unmount - use refs to avoid stale closure
  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return {
    localStream,
    remoteStream,
    connectionState,
    initializeCall,
    cleanup,
    peerConnection: peerConnectionRef.current,
  };
};
