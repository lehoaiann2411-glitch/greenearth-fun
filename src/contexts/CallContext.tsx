import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
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
    throw new Error('useCall must be used within a CallProvider');
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
  } = useCallSignaling(activeCall?.id || null);

  // Handle incoming call timeout (30 seconds)
  useEffect(() => {
    if (!incomingCall) return;

    const timeout = setTimeout(() => {
      missCallMutation.mutate(incomingCall.id);
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
          
          if (updatedCall.status === 'rejected' || updatedCall.status === 'ended' || updatedCall.status === 'missed') {
            cleanup();
            setActiveCall(null);
            setIsInitiator(false);
          } else if (updatedCall.status === 'accepted' && isInitiator) {
            // Call was accepted, initialize WebRTC
            initializeCall(updatedCall.call_type, true);
          }
          
          setActiveCall(updatedCall);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCall?.id, isInitiator]);

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

    await answerCallMutation.mutateAsync(incomingCall.id);
    setActiveCall(incomingCall);
    setRemoteUserInfo({
      name: incomingCall.caller?.full_name || undefined,
      avatar: incomingCall.caller?.avatar_url || undefined,
    });
    setIsInitiator(false);

    // Initialize WebRTC as receiver
    await initializeCall(incomingCall.call_type, false);
  }, [incomingCall, answerCallMutation, initializeCall]);

  const handleRejectCall = useCallback(async () => {
    if (!incomingCall) return;
    await rejectCallMutation.mutateAsync(incomingCall.id);
  }, [incomingCall, rejectCallMutation]);

  const endCurrentCall = useCallback(async () => {
    if (!activeCall) return;

    const startTime = activeCall.started_at ? new Date(activeCall.started_at).getTime() : Date.now();
    const duration = Math.floor((Date.now() - startTime) / 1000);

    await endCallMutation.mutateAsync({
      callId: activeCall.id,
      duration,
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
        />
      )}
    </CallContext.Provider>
  );
}
