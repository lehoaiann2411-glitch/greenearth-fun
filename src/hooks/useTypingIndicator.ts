import { useEffect, useRef, useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TypingUser {
  userId: string;
  fullName: string | null;
  isTyping: boolean;
}

// Hook to listen for typing indicators in a conversation
export function useTypingIndicator(conversationId: string | null) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!conversationId || !user) return;

    // Initial fetch
    const fetchTyping = async () => {
      const { data } = await supabase
        .from('typing_indicators')
        .select('user_id, is_typing')
        .eq('conversation_id', conversationId)
        .eq('is_typing', true)
        .neq('user_id', user.id);

      if (data && data.length > 0) {
        const userIds = data.map(d => d.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        setTypingUsers(
          data.map(d => ({
            userId: d.user_id,
            fullName: profiles?.find(p => p.id === d.user_id)?.full_name || null,
            isTyping: d.is_typing,
          }))
        );
      } else {
        setTypingUsers([]);
      }
    };

    fetchTyping();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const record = payload.new as { user_id: string; is_typing: boolean } | null;
          const oldRecord = payload.old as { user_id: string } | null;

          if (payload.eventType === 'DELETE' && oldRecord) {
            setTypingUsers(prev => prev.filter(u => u.userId !== oldRecord.user_id));
          } else if (record && record.user_id !== user.id) {
            if (record.is_typing) {
              // Fetch user name if not already have
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', record.user_id)
                .single();

              setTypingUsers(prev => {
                const existing = prev.find(u => u.userId === record.user_id);
                if (existing) {
                  return prev.map(u =>
                    u.userId === record.user_id ? { ...u, isTyping: true } : u
                  );
                }
                return [...prev, {
                  userId: record.user_id,
                  fullName: profile?.full_name || null,
                  isTyping: true,
                }];
              });
            } else {
              setTypingUsers(prev => prev.filter(u => u.userId !== record.user_id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  return typingUsers;
}

// Hook to send typing status with debounce
export function useSendTypingStatus(conversationId: string | null) {
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!conversationId || !user) return;

    try {
      await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'conversation_id,user_id',
        });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }, [conversationId, user]);

  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      setTyping(true);
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      setTyping(false);
    }, 3000);
  }, [setTyping]);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      setTyping(false);
    }
  }, [setTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (isTypingRef.current && conversationId && user) {
        setTyping(false);
      }
    };
  }, [conversationId, user, setTyping]);

  return { startTyping, stopTyping };
}
