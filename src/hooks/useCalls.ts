import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
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

  const initializeCall = async (callType: 'voice' | 'video', isInitiator: boolean) => {
    if (!callId || !user) return;

    try {
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
        setRemoteStream(event.streams[0]);
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState);
      };

      // Set up signaling channel
      const channel = supabase.channel(`call:${callId}`);
      channelRef.current = channel;

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
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
          if (payload.senderId !== user.id) {
            await setRemoteDescription(pc, payload.sdp);
            const answer = await createAnswer(pc);
            channel.send({
              type: 'broadcast',
              event: 'answer',
              payload: { sdp: answer, senderId: user.id },
            });
          }
        })
        .on('broadcast', { event: 'answer' }, async ({ payload }) => {
          if (payload.senderId !== user.id) {
            await setRemoteDescription(pc, payload.sdp);
          }
        })
        .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
          if (payload.senderId !== user.id && payload.candidate) {
            await addIceCandidate(pc, payload.candidate);
          }
        })
        .on('broadcast', { event: 'end-call' }, () => {
          cleanup();
        })
        .subscribe();

      // If initiator, create and send offer
      if (isInitiator) {
        const offer = await createOffer(pc);
        channel.send({
          type: 'broadcast',
          event: 'offer',
          payload: { sdp: offer, senderId: user.id },
        });
      }
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error(i18n.t('toast.error'));
    }
  };

  const cleanup = () => {
    stopStream(localStream);
    stopStream(remoteStream);
    setLocalStream(null);
    setRemoteStream(null);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'end-call',
        payload: {},
      });
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    connectionState,
    initializeCall,
    cleanup,
  };
};
