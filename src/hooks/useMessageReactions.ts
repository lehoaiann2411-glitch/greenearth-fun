import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface GroupedReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
  users: { id: string; full_name: string | null }[];
}

export function useMessageReactions(messageIds: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to reactions changes
  useEffect(() => {
    if (!messageIds.length || !user) return;

    const channel = supabase
      .channel(`reactions:${messageIds.join(',')}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['message-reactions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageIds, user, queryClient]);

  return useQuery({
    queryKey: ['message-reactions', messageIds],
    queryFn: async () => {
      if (!messageIds.length) return {};

      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messageIds);

      if (error) throw error;

      // Get user profiles for reactions
      const userIds = [...new Set(data?.map(r => r.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      // Group reactions by message
      const grouped: Record<string, GroupedReaction[]> = {};
      
      for (const messageId of messageIds) {
        const messageReactions = data?.filter(r => r.message_id === messageId) || [];
        const emojiGroups: Record<string, { users: { id: string; full_name: string | null }[] }> = {};
        
        for (const reaction of messageReactions) {
          if (!emojiGroups[reaction.emoji]) {
            emojiGroups[reaction.emoji] = { users: [] };
          }
          const profile = profiles?.find(p => p.id === reaction.user_id);
          emojiGroups[reaction.emoji].users.push({
            id: reaction.user_id,
            full_name: profile?.full_name || null,
          });
        }
        
        grouped[messageId] = Object.entries(emojiGroups).map(([emoji, data]) => ({
          emoji,
          count: data.users.length,
          hasReacted: data.users.some(u => u.id === user?.id),
          users: data.users,
        }));
      }
      
      return grouped;
    },
    enabled: !!messageIds.length && !!user,
  });
}

export function useAddReaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });

      if (error) {
        // If already exists, ignore (upsert behavior)
        if (error.code === '23505') return;
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions'] });
    },
  });
}

export function useRemoveReaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions'] });
    },
  });
}

export function useToggleReaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, emoji, hasReacted }: { messageId: string; emoji: string; hasReacted: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id)
          .eq('emoji', emoji);
        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji,
          });
        if (error && error.code !== '23505') throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions'] });
    },
  });
}
