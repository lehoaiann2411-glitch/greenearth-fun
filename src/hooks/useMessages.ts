import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  message_type: string;
  media_url: string | null;
  camly_amount: number | null;
  is_read: boolean;
  created_at: string;
  reply_to_id?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  payload?: {
    call_id?: string;
    call_type?: 'voice' | 'video';
    call_status?: 'ended' | 'missed' | 'rejected';
    duration_seconds?: number;
    caller_id?: string;
    callee_id?: string;
  } | null;
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  reply_to?: Message | null;
}

export interface Conversation {
  id: string;
  type: string;
  name: string | null;
  avatar_url?: string | null;
  description?: string | null;
  created_by?: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  participants?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role?: string;
  }[];
  unread_count?: number;
}

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user's conversation participations
      const { data: participations, error: partError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', user.id);

      if (partError) throw partError;
      if (!participations || participations.length === 0) return [];

      const conversationIds = participations.map(p => p.conversation_id);

      // Get conversations
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (convError) throw convError;

      // Get all participants for these conversations
      const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id, role')
        .in('conversation_id', conversationIds);

      // Get participant profiles
      const participantUserIds = [...new Set(allParticipants?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', participantUserIds);

      // Get unread counts
      const unreadCounts: Record<string, number> = {};
      for (const part of participations) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', part.conversation_id)
          .neq('sender_id', user.id)
          .eq('is_read', false);
        unreadCounts[part.conversation_id] = count || 0;
      }

      // Build conversation objects
      return (conversations || []).map(conv => {
        const convParticipants = allParticipants
          ?.filter(p => p.conversation_id === conv.id && p.user_id !== user.id)
          .map(p => {
            const profile = profiles?.find(pr => pr.id === p.user_id);
            const participant = allParticipants?.find(ap => ap.conversation_id === conv.id && ap.user_id === p.user_id);
            return profile ? { ...profile, role: participant?.role } : null;
          })
          .filter(Boolean);

        return {
          ...conv,
          participants: convParticipants || [],
          unread_count: unreadCounts[conv.id] || 0,
        } as Conversation;
      });
    },
    enabled: !!user,
  });
}

export function useConversation(conversationId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!user || !conversationId) return null;

      // Get conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      // Get participants with roles
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id, role')
        .eq('conversation_id', conversationId);

      const participantIds = participants?.map(p => p.user_id) || [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', participantIds);

      const participantsWithRoles = profiles?.filter(p => p.id !== user.id).map(profile => ({
        ...profile,
        role: participants?.find(part => part.user_id === profile.id)?.role,
      })) || [];

      return {
        ...conversation,
        participants: participantsWithRoles,
      } as Conversation;
    },
    enabled: !!user && !!conversationId,
  });
}

export function useMessages(conversationId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient]);

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender profiles
      const senderIds = [...new Set(messages?.map(m => m.sender_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', senderIds);

      // Get reply_to messages
      const replyToIds = messages?.filter(m => m.reply_to_id).map(m => m.reply_to_id) || [];
      const { data: replyMessages } = replyToIds.length > 0 
        ? await supabase
            .from('messages')
            .select('*')
            .in('id', replyToIds)
        : { data: [] };

      return (messages || []).map(msg => {
        const replyTo = msg.reply_to_id 
          ? replyMessages?.find(rm => rm.id === msg.reply_to_id)
          : null;
        return {
          ...msg,
          sender: profiles?.find(p => p.id === msg.sender_id),
          reply_to: replyTo ? {
            ...replyTo,
            sender: profiles?.find(p => p.id === replyTo.sender_id),
          } : null,
        };
      }) as Message[];
    },
    enabled: !!conversationId,
  });
}

export function useUnreadMessagesCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unread-messages-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      // Get user's conversations
      const { data: participations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (!participations || participations.length === 0) return 0;

      const conversationIds = participations.map(p => p.conversation_id);

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

export function useCreateConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Must be logged in');

      // Use RPC function to create conversation securely
      // This handles: friend check, block check, existing conversation check
      const { data: conversationId, error } = await supabase
        .rpc('create_direct_conversation', { target_user_id: targetUserId });

      if (error) {
        console.error('Create conversation error:', error);
        throw new Error(error.message || 'Failed to create conversation');
      }

      // Fetch the conversation details
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (fetchError) throw fetchError;
      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      messageType = 'text',
      mediaUrl,
      camlyAmount,
    }: {
      conversationId: string;
      content?: string;
      messageType?: string;
      mediaUrl?: string;
      camlyAmount?: number;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // If sending Camly gift, use secure RPC to transfer coins
      if (messageType === 'camly_gift' && camlyAmount) {
        // 1. Get recipient ID
        const { data: participants, error: partError } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversationId)
          .neq('user_id', user.id);

        if (partError) throw partError;
        if (!participants || participants.length === 0) {
          throw new Error('Recipient not found');
        }

        const recipientId = participants[0].user_id;

        // 2. Transfer coins using secure RPC function (handles both deduct & add atomically)
        const { error: transferError } = await supabase
          .rpc('transfer_camly_coins', {
            p_sender_id: user.id,
            p_receiver_id: recipientId,
            p_amount: camlyAmount
          });

        if (transferError) {
          if (transferError.message.includes('INSUFFICIENT_BALANCE')) {
            throw new Error('INSUFFICIENT_BALANCE');
          }
          throw transferError;
        }

        // 3. Create notification for recipient
        await supabase.from('notifications').insert({
          user_id: recipientId,
          actor_id: user.id,
          type: 'camly_gift',
          title: 'Camly Gift Received',
          message: `sent you ${camlyAmount} Camly Coins`,
          camly_amount: camlyAmount,
          reference_id: conversationId,
          reference_type: 'conversation',
        });

        // 4. Record transaction in camly_transactions table
        await supabase.from('camly_transactions').insert({
          sender_id: user.id,
          receiver_id: recipientId,
          amount: camlyAmount,
          transaction_type: 'gift',
          description: `Gift via chat`,
        });
      }

      // Create the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          media_url: mediaUrl,
          camly_amount: camlyAmount,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useMarkMessagesAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Update last_read_at
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
    },
  });
}

// Group conversation hooks
export function useCreateGroupConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      memberIds,
      avatarUrl,
      description,
    }: {
      name: string;
      memberIds: string[];
      avatarUrl?: string;
      description?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data: conversationId, error } = await supabase
        .rpc('create_group_conversation', {
          p_name: name,
          p_member_ids: memberIds,
          p_avatar_url: avatarUrl || null,
          p_description: description || null,
        });

      if (error) throw error;
      return conversationId as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useAddGroupMember() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .rpc('add_group_member', {
          p_conversation_id: conversationId,
          p_user_id: userId,
        });

      if (error) throw error;
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useRemoveGroupMember() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .rpc('remove_group_member', {
          p_conversation_id: conversationId,
          p_user_id: userId,
        });

      if (error) throw error;
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useLeaveGroup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .rpc('remove_group_member', {
          p_conversation_id: conversationId,
          p_user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
