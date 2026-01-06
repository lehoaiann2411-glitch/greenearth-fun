import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import i18n from '@/i18n';

interface BlockedUser {
  id: string;
  blocked_id: string;
  created_at: string;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

// Check if a user is blocked
export function useIsBlocked(targetUserId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-blocked', user?.id, targetUserId],
    queryFn: async () => {
      if (!user || !targetUserId) return false;

      const { data, error } = await supabase
        .from('user_blocks')
        .select('id')
        .or(`blocker_id.eq.${user.id},blocker_id.eq.${targetUserId}`)
        .or(`blocked_id.eq.${user.id},blocked_id.eq.${targetUserId}`)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!user && !!targetUserId,
  });
}

// Check if current user blocked the target user
export function useHasBlocked(targetUserId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['has-blocked', user?.id, targetUserId],
    queryFn: async () => {
      if (!user || !targetUserId) return false;

      const { data, error } = await supabase
        .from('user_blocks')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', targetUserId)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!user && !!targetUserId,
  });
}

// Get list of blocked users
export function useBlockedUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['blocked-users', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_blocks')
        .select('id, blocked_id, created_at')
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profiles for blocked users
      const blockedIds = data.map(d => d.blocked_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', blockedIds);

      return data.map(block => ({
        ...block,
        profile: profiles?.find(p => p.id === block.blocked_id) || null,
      })) as BlockedUser[];
    },
    enabled: !!user,
  });
}

// Block a user
export function useBlockUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: targetUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, targetUserId) => {
      toast.success(i18n.t('blocking.userBlocked'));
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      queryClient.invalidateQueries({ queryKey: ['is-blocked'] });
      queryClient.invalidateQueries({ queryKey: ['has-blocked'] });
      queryClient.invalidateQueries({ queryKey: ['friendship-status', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast.error(i18n.t('toast.error'));
    },
  });
}

// Unblock a user
export function useUnblockUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', targetUserId);

      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      toast.success(i18n.t('blocking.userUnblocked'));
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      queryClient.invalidateQueries({ queryKey: ['is-blocked'] });
      queryClient.invalidateQueries({ queryKey: ['has-blocked'] });
      queryClient.invalidateQueries({ queryKey: ['friendship-status', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast.error(i18n.t('toast.error'));
    },
  });
}
