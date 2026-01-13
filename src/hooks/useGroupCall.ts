import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
import { useTranslation } from 'react-i18next';

export interface GroupCallParticipant {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  stream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  isMuted: boolean;
  isVideoOff: boolean;
}

export interface GroupCall {
  id: string;
  initiator_id: string;
  call_type: 'voice' | 'video';
  status: 'active' | 'ended';
  title?: string;
  max_participants: number;
  started_at: string;
  created_at: string;
}

interface UseGroupCallReturn {
  groupCall: GroupCall | null;
  participants: GroupCallParticipant[];
  localStream: MediaStream | null;
  isInGroupCall: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  createGroupCall: (userIds: string[], callType: 'voice' | 'video') => Promise<string | null>;
  joinGroupCall: (groupCallId: string) => Promise<void>;
  leaveGroupCall: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
}

export function useGroupCall(): UseGroupCallReturn {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [groupCall, setGroupCall] = useState<GroupCall | null>(null);
  const [participants, setParticipants] = useState<GroupCallParticipant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const channelsRef = useRef<Map<string, ReturnType<typeof supabase.channel>>>(new Map());
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const participantChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const cleanup = useCallback(async () => {
    // Close all peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    
    // Remove all channels
    channelsRef.current.forEach(channel => supabase.removeChannel(channel));
    channelsRef.current.clear();
    
    if (participantChannelRef.current) {
      supabase.removeChannel(participantChannelRef.current);
      participantChannelRef.current = null;
    }
    
    // Stop local stream
    if (localStream) {
      stopStream(localStream);
    }
    
    setGroupCall(null);
    setParticipants([]);
    setLocalStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
  }, [localStream]);

  const createPeerConnectionForUser = useCallback(async (
    targetUserId: string,
    stream: MediaStream,
    groupCallId: string,
    isInitiator: boolean
  ): Promise<RTCPeerConnection> => {
    if (!user) throw new Error('Not authenticated');

    const pc = createPeerConnection();
    peerConnectionsRef.current.set(targetUserId, pc);
    
    // Add local stream
    addStreamToPeerConnection(pc, stream);
    
    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Group call: Received track from', targetUserId);
      setParticipants(prev => prev.map(p => {
        if (p.userId === targetUserId) {
          return { ...p, stream: event.streams[0] || new MediaStream([event.track]) };
        }
        return p;
      }));
    };
    
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${targetUserId}:`, pc.connectionState);
    };
    
    // Set up signaling channel for this peer pair
    const pairId = [user.id, targetUserId].sort().join('-');
    const channelName = `group-call:${groupCallId}:${pairId}`;
    
    const channel = supabase.channel(channelName);
    channelsRef.current.set(targetUserId, channel);
    
    const iceCandidateBuffer: RTCIceCandidateInit[] = [];
    let remoteDescSet = false;
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channel.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: event.candidate.toJSON(), senderId: user.id },
        });
      }
    };
    
    channel
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (payload.senderId !== user.id) {
          try {
            await setRemoteDescription(pc, payload.sdp);
            remoteDescSet = true;
            
            // Process buffered candidates
            for (const candidate of iceCandidateBuffer) {
              await addIceCandidate(pc, candidate);
            }
            iceCandidateBuffer.length = 0;
            
            const answer = await createAnswer(pc);
            channel.send({
              type: 'broadcast',
              event: 'answer',
              payload: { sdp: answer, senderId: user.id },
            });
          } catch (err) {
            console.error('Error handling offer:', err);
          }
        }
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (payload.senderId !== user.id) {
          try {
            await setRemoteDescription(pc, payload.sdp);
            remoteDescSet = true;
            
            // Process buffered candidates
            for (const candidate of iceCandidateBuffer) {
              await addIceCandidate(pc, candidate);
            }
            iceCandidateBuffer.length = 0;
          } catch (err) {
            console.error('Error handling answer:', err);
          }
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.senderId !== user.id) {
          if (remoteDescSet) {
            await addIceCandidate(pc, payload.candidate);
          } else {
            iceCandidateBuffer.push(payload.candidate);
          }
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && isInitiator) {
          // Small delay to ensure other peer is subscribed
          setTimeout(async () => {
            try {
              const offer = await createOffer(pc);
              channel.send({
                type: 'broadcast',
                event: 'offer',
                payload: { sdp: offer, senderId: user.id },
              });
            } catch (err) {
              console.error('Error sending offer:', err);
            }
          }, 500);
        }
      });
    
    return pc;
  }, [user]);

  const createGroupCall = useCallback(async (
    userIds: string[],
    callType: 'voice' | 'video'
  ): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Get local stream
      const stream = await getLocalStream(callType);
      setLocalStream(stream);
      
      // Create group call
      const { data: callData, error: callError } = await supabase
        .from('group_calls')
        .insert({
          initiator_id: user.id,
          call_type: callType,
          title: `Group Call - ${new Date().toLocaleTimeString()}`,
        })
        .select()
        .single();
      
      if (callError) throw callError;
      
      setGroupCall(callData as GroupCall);
      
      // Add self as participant
      await supabase.from('group_call_participants').insert({
        group_call_id: callData.id,
        user_id: user.id,
      });
      
      // Fetch user profiles and add as participants
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      
      // Add other users as participants
      for (const userId of userIds) {
        await supabase.from('group_call_participants').insert({
          group_call_id: callData.id,
          user_id: userId,
        });
        
        const profile = profiles?.find(p => p.id === userId);
        
        setParticipants(prev => [...prev, {
          id: userId,
          userId,
          userName: profile?.full_name || 'Unknown',
          userAvatar: profile?.avatar_url || undefined,
          stream: null,
          peerConnection: null,
          isMuted: false,
          isVideoOff: false,
        }]);
        
        // Create peer connection for each user
        const pc = await createPeerConnectionForUser(userId, stream, callData.id, true);
        setParticipants(prev => prev.map(p => 
          p.userId === userId ? { ...p, peerConnection: pc } : p
        ));
      }
      
      // Notify users via realtime
      const inviteChannel = supabase.channel('group-call-invites');
      await inviteChannel.subscribe();
      
      inviteChannel.send({
        type: 'broadcast',
        event: 'invite',
        payload: {
          groupCallId: callData.id,
          inviterId: user.id,
          callType,
          inviteeIds: userIds,
        },
      });
      
      return callData.id;
    } catch (error) {
      console.error('Failed to create group call:', error);
      toast.error(t('calls.groupCallError'));
      cleanup();
      return null;
    }
  }, [user, createPeerConnectionForUser, cleanup, t]);

  const joinGroupCall = useCallback(async (groupCallId: string) => {
    if (!user) return;
    
    try {
      // Get call info
      const { data: callData, error: callError } = await supabase
        .from('group_calls')
        .select('*')
        .eq('id', groupCallId)
        .single();
      
      if (callError) throw callError;
      
      setGroupCall(callData as GroupCall);
      
      // Get local stream
      const stream = await getLocalStream(callData.call_type as 'voice' | 'video');
      setLocalStream(stream);
      
      // Get existing participants
      const { data: existingParticipants } = await supabase
        .from('group_call_participants')
        .select('user_id')
        .eq('group_call_id', groupCallId)
        .neq('user_id', user.id)
        .is('left_at', null);
      
      // Fetch profiles
      const userIds = existingParticipants?.map(p => p.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      
      // Create peer connections for existing participants
      for (const participant of existingParticipants || []) {
        const profile = profiles?.find(p => p.id === participant.user_id);
        
        setParticipants(prev => [...prev, {
          id: participant.user_id,
          userId: participant.user_id,
          userName: profile?.full_name || 'Unknown',
          userAvatar: profile?.avatar_url || undefined,
          stream: null,
          peerConnection: null,
          isMuted: false,
          isVideoOff: false,
        }]);
        
        const pc = await createPeerConnectionForUser(
          participant.user_id, 
          stream, 
          groupCallId, 
          false
        );
        
        setParticipants(prev => prev.map(p => 
          p.userId === participant.user_id ? { ...p, peerConnection: pc } : p
        ));
      }
      
      // Update own participant record
      await supabase
        .from('group_call_participants')
        .update({ joined_at: new Date().toISOString() })
        .eq('group_call_id', groupCallId)
        .eq('user_id', user.id);
      
      // Listen for new participants
      participantChannelRef.current = supabase
        .channel(`group-call-participants:${groupCallId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'group_call_participants',
          filter: `group_call_id=eq.${groupCallId}`,
        }, async (payload) => {
          const newUserId = payload.new.user_id;
          if (newUserId !== user.id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', newUserId)
              .single();
            
            setParticipants(prev => [...prev, {
              id: newUserId,
              userId: newUserId,
              userName: profile?.full_name || 'Unknown',
              userAvatar: profile?.avatar_url || undefined,
              stream: null,
              peerConnection: null,
              isMuted: false,
              isVideoOff: false,
            }]);
            
            const pc = await createPeerConnectionForUser(newUserId, stream, groupCallId, true);
            setParticipants(prev => prev.map(p => 
              p.userId === newUserId ? { ...p, peerConnection: pc } : p
            ));
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'group_call_participants',
          filter: `group_call_id=eq.${groupCallId}`,
        }, (payload) => {
          if (payload.new.left_at) {
            const leftUserId = payload.new.user_id;
            setParticipants(prev => prev.filter(p => p.userId !== leftUserId));
            
            const pc = peerConnectionsRef.current.get(leftUserId);
            if (pc) {
              pc.close();
              peerConnectionsRef.current.delete(leftUserId);
            }
            
            const channel = channelsRef.current.get(leftUserId);
            if (channel) {
              supabase.removeChannel(channel);
              channelsRef.current.delete(leftUserId);
            }
          }
        })
        .subscribe();
      
    } catch (error) {
      console.error('Failed to join group call:', error);
      toast.error(t('calls.groupCallError'));
      cleanup();
    }
  }, [user, createPeerConnectionForUser, cleanup, t]);

  const leaveGroupCall = useCallback(async () => {
    if (!groupCall || !user) return;
    
    try {
      // Update participant record
      await supabase
        .from('group_call_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('group_call_id', groupCall.id)
        .eq('user_id', user.id);
      
      // Check if all participants have left
      const { data: remainingParticipants } = await supabase
        .from('group_call_participants')
        .select('id')
        .eq('group_call_id', groupCall.id)
        .is('left_at', null);
      
      // If no one is left, end the call
      if (!remainingParticipants || remainingParticipants.length === 0) {
        await supabase
          .from('group_calls')
          .update({ 
            status: 'ended', 
            ended_at: new Date().toISOString() 
          })
          .eq('id', groupCall.id);
      }
    } catch (error) {
      console.error('Error leaving group call:', error);
    }
    
    cleanup();
  }, [groupCall, user, cleanup]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      const newMuted = !isMuted;
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !newMuted;
      });
      setIsMuted(newMuted);
    }
  }, [localStream, isMuted]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const newVideoOff = !isVideoOff;
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !newVideoOff;
      });
      setIsVideoOff(newVideoOff);
    }
  }, [localStream, isVideoOff]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    groupCall,
    participants,
    localStream,
    isInGroupCall: !!groupCall,
    isMuted,
    isVideoOff,
    createGroupCall,
    joinGroupCall,
    leaveGroupCall,
    toggleMute,
    toggleVideo,
  };
}
