import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { shouldSendNotification } from '@/hooks/useNotificationPreferences';

export function useFollowUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

      if (error) throw error;

      // Check if mutual follow exists (target already follows current user)
      const { data: mutualFollow } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', targetUserId)
        .eq('following_id', user.id)
        .maybeSingle();

      // If mutual follow → auto create friendship
      if (mutualFollow) {
        // Check if friendship already exists
        const { data: existingFriendship } = await supabase
          .from('friendships')
          .select('id')
          .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`)
          .maybeSingle();

        if (!existingFriendship) {
          // Create auto-accepted friendship
          await supabase
            .from('friendships')
            .insert({
              requester_id: user.id,
              addressee_id: targetUserId,
              status: 'accepted',
              accepted_at: new Date().toISOString(),
            });

          // Update friends_count for both users using RPC
          await supabase.rpc('increment_friends_count', { p_user_id: user.id });
          await supabase.rpc('increment_friends_count', { p_user_id: targetUserId });

          // Send notifications about becoming friends
          await supabase.from('notifications').insert([
            {
              user_id: targetUserId,
              actor_id: user.id,
              type: 'new_friend',
              title: 'Bạn bè mới',
              message: 'Các bạn đã theo dõi lẫn nhau và trở thành bạn bè!',
            },
            {
              user_id: user.id,
              actor_id: targetUserId,
              type: 'new_friend',
              title: 'Bạn bè mới',
              message: 'Các bạn đã theo dõi lẫn nhau và trở thành bạn bè!',
            }
          ]);
        }
      }

      // Check if user wants follow notifications before creating
      const wantsNotification = await shouldSendNotification(targetUserId, 'follows');
      
      if (wantsNotification) {
        // Create notification for the followed user
        await supabase.from('notifications').insert({
          user_id: targetUserId,
          actor_id: user.id,
          type: 'follow',
          title: 'New Follower',
          message: 'started following you',
          reference_id: user.id,
          reference_type: 'user',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendship-status'] });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useIsFollowing(targetUserId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['following', user?.id, targetUserId],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });
}

export function useFollowers(userId: string) {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          id,
          created_at,
          follower:profiles!user_follows_follower_id_fkey(
            id,
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId: string) {
  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          id,
          created_at,
          following:profiles!user_follows_following_id_fkey(
            id,
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useSuggestedUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['suggested-users', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get users that the current user is not following
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map(f => f.following_id) || [];
      followingIds.push(user.id); // Exclude self

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, trees_planted, followers_count')
        .not('id', 'in', `(${followingIds.join(',')})`)
        .order('followers_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
