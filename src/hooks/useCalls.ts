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
    mutationFn: async ({
      callId,
      callerId,
      calleeId,
      callType,
    }: {
      callId: string;
      callerId: string;
      calleeId: string;
      callType: 'voice' | 'video';
    }) => {
      const { data, error } = await supabase
        .from('calls')
        .update({ status: 'rejected' })
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;

      // Insert call log message into conversation
      await supabase.rpc('insert_call_log_message', {
        p_caller_id: callerId,
        p_callee_id: calleeId,
        p_call_type: callType,
        p_call_status: 'rejected',
        p_duration_seconds: 0,
        p_call_id: callId,
      });

      return data as Call;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incoming-calls'] });
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
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
      callerId,
      calleeId,
      callType,
    }: {
      callId: string;
      duration: number;
      callerId: string;
      calleeId: string;
      callType: 'voice' | 'video';
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

      // Insert call log message into conversation
      await supabase.rpc('insert_call_log_message', {
        p_caller_id: callerId,
        p_callee_id: calleeId,
        p_call_type: callType,
        p_call_status: 'ended',
        p_duration_seconds: duration,
        p_call_id: callId,
      });

      return data as Call;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incoming-calls'] });
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

// Mark call as missed
export const useMissCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      callId,
      callerId,
      calleeId,
      callType,
    }: {
      callId: string;
      callerId: string;
      calleeId: string;
      callType: 'voice' | 'video';
    }) => {
      const { data, error } = await supabase
        .from('calls')
        .update({ status: 'missed' })
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;

      // Insert call log message into conversation
      await supabase.rpc('insert_call_log_message', {
        p_caller_id: callerId,
        p_callee_id: calleeId,
        p_call_type: callType,
        p_call_status: 'missed',
        p_duration_seconds: 0,
        p_call_id: callId,
      });

      return data as Call;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incoming-calls'] });
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
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
  const remoteMediaStreamRef = useRef<MediaStream>(new MediaStream());
  const peerReadyRef = useRef(false);
  const isInitiatorRef = useRef(false);
  const offerSentRef = useRef(false);

  // Process buffered ICE candidates after remote description is set
  const processBufferedCandidates = useCallback(async (pc: RTCPeerConnection, currentUserId: string) => {
    console.log('Processing buffered ICE candidates:', iceCandidateBuffer.current.length);
    while (iceCandidateBuffer.current.length > 0) {
      const item = iceCandidateBuffer.current.shift();
      if (item && item.senderId !== currentUserId) {
        try {
          await addIceCandidate(pc, item.candidate);
          console.log('Added buffered ICE candidate');
        } catch (err) {
          console.warn('Failed to add buffered ICE candidate:', err);
        }
      }
    }
  }, []);

  const initializeCall = useCallback(async (callType: 'voice' | 'video', isInitiator: boolean) => {
    if (!callId || !user) {
      console.log('initializeCall: Missing callId or user', { callId, userId: user?.id });
      return;
    }

    console.log('initializeCall: Starting', { callId, callType, isInitiator });

    try {
      // Reset buffers and state
      iceCandidateBuffer.current = [];
      isChannelReady.current = false;
      peerReadyRef.current = false;
      isInitiatorRef.current = isInitiator;
      offerSentRef.current = false;
      remoteMediaStreamRef.current = new MediaStream();

      // Get local stream
      console.log('initializeCall: Getting local stream');
      const stream = await getLocalStream(callType);
      setLocalStream(stream);
      console.log('initializeCall: Got local stream with tracks:', stream.getTracks().map(t => t.kind));

      // Create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;
      console.log('initializeCall: Created peer connection');

      // Add local stream to peer connection
      addStreamToPeerConnection(pc, stream);

      // Handle remote stream - Safari/iOS compatible
      pc.ontrack = (event) => {
        console.log('ontrack: Received remote track:', event.track.kind, 'id:', event.track.id);
        console.log('ontrack: event.streams length:', event.streams?.length);
        
        // Use event.streams[0] if available, otherwise build from tracks
        if (event.streams && event.streams[0]) {
          console.log('ontrack: Using event.streams[0]');
          setRemoteStream(event.streams[0]);
        } else {
          // Safari/iOS fallback - add track to our manual stream
          console.log('ontrack: Fallback - adding track to manual stream');
          remoteMediaStreamRef.current.addTrack(event.track);
          setRemoteStream(remoteMediaStreamRef.current);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        setConnectionState(pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
      };

      pc.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', pc.iceGatheringState);
      };

      // Set up signaling channel
      const channel = supabase.channel(`call:${callId}`);
      channelRef.current = channel;

      // Handle ICE candidates - only send when channel is ready
      pc.onicecandidate = (event) => {
        if (event.candidate && isChannelReady.current) {
          console.log('Sending ICE candidate');
          channel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: { candidate: event.candidate.toJSON(), senderId: user.id },
          });
        }
      };

      // Function to send offer
      const sendOffer = async () => {
        if (offerSentRef.current || !peerConnectionRef.current) return;
        
        console.log('Sending offer');
        offerSentRef.current = true;
        
        try {
          const offer = await createOffer(peerConnectionRef.current);
          channel.send({
            type: 'broadcast',
            event: 'offer',
            payload: { sdp: offer, senderId: user.id },
          });
        } catch (err) {
          console.error('Failed to create/send offer:', err);
          offerSentRef.current = false;
        }
      };

      // Listen for signaling events
      channel
        .on('broadcast', { event: 'peer-ready' }, async ({ payload }) => {
          if (payload.senderId !== user.id) {
            console.log('Received peer-ready from other peer');
            peerReadyRef.current = true;
            
            // If we're the initiator and haven't sent offer yet, send it now
            if (isInitiatorRef.current && !offerSentRef.current && isChannelReady.current) {
              await sendOffer();
            }
          }
        })
        .on('broadcast', { event: 'offer' }, async ({ payload }) => {
          if (payload.senderId !== user.id && peerConnectionRef.current) {
            console.log('Received offer');
            try {
              await setRemoteDescription(peerConnectionRef.current, payload.sdp);
              console.log('Set remote description (offer)');
              await processBufferedCandidates(peerConnectionRef.current, user.id);
              const answer = await createAnswer(peerConnectionRef.current);
              console.log('Created answer');
              if (isChannelReady.current) {
                channel.send({
                  type: 'broadcast',
                  event: 'answer',
                  payload: { sdp: answer, senderId: user.id },
                });
                console.log('Sent answer');
              }
            } catch (err) {
              console.error('Error handling offer:', err);
            }
          }
        })
        .on('broadcast', { event: 'answer' }, async ({ payload }) => {
          if (payload.senderId !== user.id && peerConnectionRef.current) {
            console.log('Received answer');
            try {
              await setRemoteDescription(peerConnectionRef.current, payload.sdp);
              console.log('Set remote description (answer)');
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
              console.log('Buffering ICE candidate (no remote desc yet)');
              iceCandidateBuffer.current.push(payload);
            } else {
              try {
                await addIceCandidate(peerConnectionRef.current, payload.candidate);
                console.log('Added ICE candidate');
              } catch (err) {
                console.warn('Failed to add ICE candidate:', err);
              }
            }
          }
        })
        .on('broadcast', { event: 'end-call' }, () => {
          console.log('Received end-call signal');
          cleanup();
        })
        .subscribe((status) => {
          console.log('Signaling channel status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('Signaling channel ready');
            isChannelReady.current = true;
            
            // Send peer-ready signal
            channel.send({
              type: 'broadcast',
              event: 'peer-ready',
              payload: { senderId: user.id },
            });
            
            // If initiator and peer is already ready, send offer
            if (isInitiatorRef.current && peerReadyRef.current && !offerSentRef.current) {
              sendOffer();
            }
            
            // For initiator, also set a delayed offer send in case peer-ready was missed
            if (isInitiatorRef.current) {
              setTimeout(() => {
                if (!offerSentRef.current && isChannelReady.current && peerConnectionRef.current) {
                  console.log('Sending offer after timeout (peer-ready may have been missed)');
                  sendOffer();
                }
              }, 1500);
            }
          }
        });
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error(i18n.t('toast.error'));
    }
  }, [callId, user, processBufferedCandidates]);

  const cleanup = useCallback(() => {
    console.log('cleanup: Starting cleanup');
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
    peerReadyRef.current = false;
    offerSentRef.current = false;

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    console.log('cleanup: Done');
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
