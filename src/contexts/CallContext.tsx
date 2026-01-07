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
import { supabase } from '@/integrations/supabase/client';

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
  
  // Track if WebRTC has been initialized for current call
  const webrtcStartedRef = useRef(false);
  const currentCallIdRef = useRef<string | null>(null);

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
  }, [activeCall?.id, cleanup]);

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

    const startTime = activeCall.started_at ? new Date(activeCall.started_at).getTime() : Date.now();
    const duration = Math.floor((Date.now() - startTime) / 1000);

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
  }, [activeCall, endCallMutation, cleanup]);

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
    </CallContext.Provider>
  );
}
