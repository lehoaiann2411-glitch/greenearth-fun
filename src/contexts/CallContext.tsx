import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useIncomingCalls,
  useStartCall,
  useAnswerCall,
  useRejectCall,
  useEndCall,
  useMissCall,
  useCallSignaling,
  type Call,
} from '@/hooks/useCalls';
import { IncomingCallModal } from '@/components/calls/IncomingCallModal';
import { CallScreen } from '@/components/calls/CallScreen';
import { CallEndedModal } from '@/components/calls/CallEndedModal';
import { supabase } from '@/integrations/supabase/client';
import { useCallSounds } from '@/hooks/useCallSounds';

interface EndedCallInfo {
  callType: 'voice' | 'video';
  callStatus: 'ended' | 'missed' | 'rejected' | 'no_answer';
  duration: number;
  remoteName?: string;
  remoteAvatar?: string;
  remoteUserId?: string;
}

interface CallContextType {
  activeCall: Call | null;
  startCall: (userId: string, callType: 'voice' | 'video', userName?: string, userAvatar?: string) => Promise<void>;
  endCurrentCall: () => void;
  isInCall: boolean;
}

const CallContext = createContext<CallContextType | null>(null);

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    // Return a safe default instead of throwing - allows usage outside provider during initial render
    return {
      activeCall: null,
      startCall: async () => {},
      endCurrentCall: () => {},
      isInCall: false,
    };
  }
  return context;
}

interface CallProviderProps {
  children: ReactNode;
}

export function CallProvider({ children }: CallProviderProps) {
  const { user } = useAuth();
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [remoteUserInfo, setRemoteUserInfo] = useState<{ name?: string; avatar?: string }>({});
  const [isInitiator, setIsInitiator] = useState(false);
  const [endedCallInfo, setEndedCallInfo] = useState<EndedCallInfo | null>(null);
  
  // Track if WebRTC has been initialized for current call
  const webrtcStartedRef = useRef(false);
  const currentCallIdRef = useRef<string | null>(null);
  const callStartTimeRef = useRef<number | null>(null);

  const { playDialTone, stopAllSounds } = useCallSounds();

  const { data: incomingCall } = useIncomingCalls();
  const startCallMutation = useStartCall();
  const answerCallMutation = useAnswerCall();
  const rejectCallMutation = useRejectCall();
  const endCallMutation = useEndCall();
  const missCallMutation = useMissCall();

  const {
    localStream,
    remoteStream,
    connectionState,
    initializeCall,
    cleanup,
    peerConnection,
  } = useCallSignaling(activeCall?.id || null);

  // Play dial tone when making outgoing call
  useEffect(() => {
    if (activeCall?.status === 'calling' && isInitiator) {
      playDialTone();
    } else {
      stopAllSounds();
    }
    
    return () => stopAllSounds();
  }, [activeCall?.status, isInitiator, playDialTone, stopAllSounds]);

  // Reset WebRTC tracking when call changes or ends
  useEffect(() => {
    if (!activeCall) {
      webrtcStartedRef.current = false;
      currentCallIdRef.current = null;
    } else if (activeCall.id !== currentCallIdRef.current) {
      webrtcStartedRef.current = false;
      currentCallIdRef.current = activeCall.id;
    }
  }, [activeCall?.id]);

  // Track call start time when call is accepted
  useEffect(() => {
    if (activeCall?.status === 'accepted' && !callStartTimeRef.current) {
      callStartTimeRef.current = Date.now();
    }
    if (!activeCall) {
      callStartTimeRef.current = null;
    }
  }, [activeCall?.status]);

  // Initialize WebRTC when call is accepted
  useEffect(() => {
    if (
      activeCall?.status === 'accepted' &&
      !webrtcStartedRef.current &&
      activeCall.id === currentCallIdRef.current
    ) {
      console.log('CallContext: Initializing WebRTC', { isInitiator, callType: activeCall.call_type });
      webrtcStartedRef.current = true;
      initializeCall(activeCall.call_type, isInitiator);
    }
  }, [activeCall?.status, activeCall?.id, activeCall?.call_type, isInitiator, initializeCall]);

  // Handle incoming call timeout (30 seconds)
  useEffect(() => {
    if (!incomingCall) return;

    const timeout = setTimeout(() => {
      missCallMutation.mutate({
        callId: incomingCall.id,
        callerId: incomingCall.caller_id,
        calleeId: incomingCall.callee_id,
        callType: incomingCall.call_type,
      });
    }, 30000);

    return () => clearTimeout(timeout);
  }, [incomingCall]);

  // Subscribe to call status changes
  useEffect(() => {
    if (!activeCall) return;

    const channel = supabase
      .channel(`call-status:${activeCall.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
          filter: `id=eq.${activeCall.id}`,
        },
        (payload) => {
          const updatedCall = payload.new as Call;
          console.log('CallContext: Call status changed', updatedCall.status);
          
          if (updatedCall.status === 'rejected' || updatedCall.status === 'ended' || updatedCall.status === 'missed') {
            // Calculate duration
            const duration = callStartTimeRef.current 
              ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
              : 0;

            // Determine call status for the modal
            let modalStatus: EndedCallInfo['callStatus'] = 'ended';
            if (updatedCall.status === 'missed') {
              modalStatus = isInitiator ? 'no_answer' : 'missed';
            } else if (updatedCall.status === 'rejected') {
              modalStatus = 'rejected';
            }

            // Show ended call modal
            setEndedCallInfo({
              callType: activeCall.call_type as 'voice' | 'video',
              callStatus: modalStatus,
              duration,
              remoteName: remoteUserInfo.name,
              remoteAvatar: remoteUserInfo.avatar,
              remoteUserId: isInitiator ? activeCall.callee_id : activeCall.caller_id,
            });

            cleanup();
            setActiveCall(null);
            setIsInitiator(false);
          } else {
            // Update active call state - WebRTC init will be triggered by the effect above
            setActiveCall(updatedCall);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCall?.id, cleanup, isInitiator, remoteUserInfo]);

  const startCall = useCallback(
    async (userId: string, callType: 'voice' | 'video', userName?: string, userAvatar?: string) => {
      if (!user) return;

      setRemoteUserInfo({ name: userName, avatar: userAvatar });
      setIsInitiator(true);

      const call = await startCallMutation.mutateAsync({
        calleeId: userId,
        callType,
      });

      setActiveCall(call);
    },
    [user, startCallMutation]
  );

  const handleAcceptCall = useCallback(async () => {
    if (!incomingCall) return;

    // Use the returned value from mutation to ensure we have the updated call
    const updatedCall = await answerCallMutation.mutateAsync(incomingCall.id);
    
    setRemoteUserInfo({
      name: incomingCall.caller?.full_name || undefined,
      avatar: incomingCall.caller?.avatar_url || undefined,
    });
    setIsInitiator(false);
    
    // Set active call with the accepted status - this triggers WebRTC init via useEffect
    setActiveCall(updatedCall);
  }, [incomingCall, answerCallMutation]);

  const handleRejectCall = useCallback(async () => {
    if (!incomingCall) return;
    await rejectCallMutation.mutateAsync({
      callId: incomingCall.id,
      callerId: incomingCall.caller_id,
      calleeId: incomingCall.callee_id,
      callType: incomingCall.call_type,
    });
  }, [incomingCall, rejectCallMutation]);

  const endCurrentCall = useCallback(async () => {
    if (!activeCall) return;

    const duration = callStartTimeRef.current 
      ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
      : 0;

    // Show ended call modal
    setEndedCallInfo({
      callType: activeCall.call_type as 'voice' | 'video',
      callStatus: 'ended',
      duration,
      remoteName: remoteUserInfo.name,
      remoteAvatar: remoteUserInfo.avatar,
      remoteUserId: isInitiator ? activeCall.callee_id : activeCall.caller_id,
    });

    await endCallMutation.mutateAsync({
      callId: activeCall.id,
      duration,
      callerId: activeCall.caller_id,
      calleeId: activeCall.callee_id,
      callType: activeCall.call_type,
    });

    cleanup();
    setActiveCall(null);
    setIsInitiator(false);
  }, [activeCall, endCallMutation, cleanup, remoteUserInfo, isInitiator]);

  const handleCallback = useCallback(() => {
    if (endedCallInfo?.remoteUserId) {
      startCall(
        endedCallInfo.remoteUserId,
        endedCallInfo.callType,
        endedCallInfo.remoteName,
        endedCallInfo.remoteAvatar
      );
    }
  }, [endedCallInfo, startCall]);

  const handleCloseEndedModal = useCallback(() => {
    setEndedCallInfo(null);
  }, []);

  return (
    <CallContext.Provider
      value={{
        activeCall,
        startCall,
        endCurrentCall,
        isInCall: !!activeCall && activeCall.status === 'accepted',
      }}
    >
      {children}

      {/* Incoming call modal - only show if not already in a call */}
      {!activeCall && incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Active call screen */}
      {activeCall && (
        <CallScreen
          call={activeCall}
          localStream={localStream}
          remoteStream={remoteStream}
          connectionState={connectionState}
          onEndCall={endCurrentCall}
          remoteName={remoteUserInfo.name}
          remoteAvatar={remoteUserInfo.avatar}
          peerConnection={peerConnection}
        />
      )}

      {/* Call ended modal */}
      {endedCallInfo && (
        <CallEndedModal
          isOpen={!!endedCallInfo}
          onClose={handleCloseEndedModal}
          callType={endedCallInfo.callType}
          callStatus={endedCallInfo.callStatus}
          duration={endedCallInfo.duration}
          remoteName={endedCallInfo.remoteName}
          remoteAvatar={endedCallInfo.remoteAvatar}
          onCallback={handleCallback}
        />
      )}
    </CallContext.Provider>
  );
}
