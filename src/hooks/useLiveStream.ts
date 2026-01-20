import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createPeerConnection, 
  getLocalStream, 
  stopStream,
  toggleAudio,
  toggleVideo,
  switchCamera
} from '@/lib/webrtc';

interface LiveStream {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: string;
  viewer_count: number;
  peak_viewers: number;
  total_gifts: number;
  camly_earned: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface LiveComment {
  id: string;
  stream_id: string;
  user_id: string;
  content: string;
  is_gift: boolean;
  gift_amount: number | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Fetch active live streams
export function useLiveStreams() {
  return useQuery({
    queryKey: ['live-streams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'live')
        .order('viewer_count', { ascending: false });

      if (error) throw error;
      return data as LiveStream[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

// Fetch single live stream
export function useLiveStream(streamId: string | undefined) {
  return useQuery({
    queryKey: ['live-stream', streamId],
    queryFn: async () => {
      if (!streamId) return null;
      
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', streamId)
        .single();

      if (error) throw error;
      return data as LiveStream;
    },
    enabled: !!streamId,
    refetchInterval: 3000,
  });
}

// Fetch stream comments
export function useLiveComments(streamId: string | undefined) {
  const [comments, setComments] = useState<LiveComment[]>([]);

  useEffect(() => {
    if (!streamId) return;

    // Fetch initial comments
    const fetchComments = async () => {
      const { data } = await supabase
        .from('live_stream_comments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('stream_id', streamId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setComments(data as LiveComment[]);
      }
    };

    fetchComments();

    // Subscribe to new comments
    const channel = supabase
      .channel(`live-comments-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_stream_comments',
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          // Fetch the comment with profile
          const { data } = await supabase
            .from('live_stream_comments')
            .select(`
              *,
              profiles:user_id (
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setComments((prev) => [data as LiveComment, ...prev].slice(0, 50));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  return comments;
}

// Create live stream
export function useCreateLiveStream() {
  const queryClient = useQueryClient();

  return useMutation<LiveStream, Error, { title: string; description?: string }>({
    mutationFn: async (data) => {
      const { data: stream, error } = await supabase
        .from('live_streams')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          title: data.title,
          description: data.description,
          status: 'preparing',
        })
        .select()
        .single();

      if (error) throw error;
      return stream as LiveStream;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
    },
  });
}

// Start live stream
export function useStartLiveStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { error } = await supabase
        .from('live_streams')
        .update({
          status: 'live',
          started_at: new Date().toISOString(),
        })
        .eq('id', streamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
    },
  });
}

// End live stream
export function useEndLiveStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { error } = await supabase
        .from('live_streams')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', streamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
    },
  });
}

// Send comment
export function useSendLiveComment() {
  return useMutation({
    mutationFn: async (data: { streamId: string; content: string; isGift?: boolean; giftAmount?: number }) => {
      const { error } = await supabase
        .from('live_stream_comments')
        .insert({
          stream_id: data.streamId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content: data.content,
          is_gift: data.isGift || false,
          gift_amount: data.giftAmount,
        });

      if (error) throw error;
    },
  });
}

// Join/Leave stream (viewer tracking)
export function useJoinStream() {
  return useMutation({
    mutationFn: async (streamId: string) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('live_stream_viewers')
        .upsert({
          stream_id: streamId,
          user_id: userId,
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update viewer count by counting current viewers
      const { count } = await supabase
        .from('live_stream_viewers')
        .select('*', { count: 'exact', head: true })
        .eq('stream_id', streamId)
        .is('left_at', null);

      await supabase
        .from('live_streams')
        .update({ viewer_count: count || 0 })
        .eq('id', streamId);
    },
  });
}

// Stream presence hook
export function useStreamPresence(streamId: string | undefined) {
  const { user } = useAuth();
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (!streamId || !user) return;

    const channel = supabase.channel(`stream-presence-${streamId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setViewerCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId, user]);

  return viewerCount;
}

// Streamer broadcast hook
export function useStreamerBroadcast(streamId: string | undefined) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAudio, setHasAudio] = useState(true);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const startBroadcast = useCallback(async () => {
    try {
      // Use the robust live stream getter with fallback
      const { getLocalStreamForLive } = await import('@/lib/webrtc');
      const stream = await getLocalStreamForLive('user');
      
      // Check if we got audio
      const audioTracks = stream.getAudioTracks();
      setHasAudio(audioTracks.length > 0);
      
      // Log stream info for debugging
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        console.log('[useStreamerBroadcast] Video track settings:', videoTrack.getSettings());
      }
      
      setLocalStream(stream);
      setError(null);
      return stream;
    } catch (err) {
      console.error('[useStreamerBroadcast] Failed to get stream:', err);
      setError('Không thể truy cập camera/mic');
      throw err;
    }
  }, []);

  const stopBroadcast = useCallback(() => {
    stopStream(localStream);
    setLocalStream(null);
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
  }, [localStream]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      const newMuted = !isMuted;
      // setAudioEnabled expects true for enabled, so pass !newMuted
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !newMuted;
      });
      setIsMuted(newMuted);
      console.log('[useStreamerBroadcast] Audio muted:', newMuted);
    }
  }, [localStream, isMuted]);

  const toggleCamera = useCallback(() => {
    if (localStream) {
      const newVideoOff = !isVideoOff;
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !newVideoOff;
      });
      setIsVideoOff(newVideoOff);
      console.log('[useStreamerBroadcast] Video off:', newVideoOff);
    }
  }, [localStream, isVideoOff]);

  const flipCamera = useCallback(async () => {
    if (localStream) {
      const newStream = await switchCamera(localStream, null);
      setLocalStream(newStream);
    }
  }, [localStream]);

  useEffect(() => {
    return () => {
      stopBroadcast();
    };
  }, [stopBroadcast]);

  return {
    localStream,
    isMuted,
    isVideoOff,
    error,
    hasAudio,
    startBroadcast,
    stopBroadcast,
    toggleMute,
    toggleCamera,
    flipCamera,
  };
}

// Gift streamer
export function useGiftStreamer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { streamId: string; streamerId: string; amount: number }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('Not authenticated');

      // Check balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('camly_balance')
        .eq('id', userId)
        .single();

      if (!profile || profile.camly_balance < data.amount) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // Transfer coins
      await supabase.rpc('transfer_camly_coins', {
        p_sender_id: userId,
        p_receiver_id: data.streamerId,
        p_amount: data.amount,
      });

      // Get current stream to update gifts
      const { data: currentStream } = await supabase
        .from('live_streams')
        .select('total_gifts, camly_earned')
        .eq('id', data.streamId)
        .single();

      // Update stream gifts
      await supabase
        .from('live_streams')
        .update({
          total_gifts: (currentStream?.total_gifts || 0) + data.amount,
          camly_earned: (currentStream?.camly_earned || 0) + data.amount,
        })
        .eq('id', data.streamId);

      // Add gift comment
      await supabase.from('live_stream_comments').insert({
        stream_id: data.streamId,
        user_id: userId,
        content: `🎁 Đã tặng ${data.amount} Camly!`,
        is_gift: true,
        gift_amount: data.amount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
