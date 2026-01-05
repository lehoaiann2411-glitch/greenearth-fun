import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CAMLY_REWARDS, ACTION_TYPES } from '@/lib/camlyCoin';

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
}

export interface FriendProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  trees_planted: number;
  green_points: number;
  friends_count: number;
}

export function useFriendshipStatus(targetUserId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friendship-status', user?.id, targetUserId],
    queryFn: async (): Promise<FriendshipStatus> => {
      if (!user || user.id === targetUserId) return 'none';

      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`)
        .maybeSingle();

      if (error) throw error;
      if (!data) return 'none';

      if (data.status === 'accepted') return 'accepted';
      if (data.status === 'blocked') return 'blocked';
      if (data.requester_id === user.id) return 'pending_sent';
      return 'pending_received';
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });
}

export function useFriends(userId: string) {
  return useQuery({
    queryKey: ['friends', userId],
    queryFn: async () => {
      // Get friendships where user is either requester or addressee and status is accepted
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

      if (error) throw error;
      if (!friendships || friendships.length === 0) return [];

      // Get friend IDs
      const friendIds = friendships.map(f => 
        f.requester_id === userId ? f.addressee_id : f.requester_id
      );

      // Get friend profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, location, trees_planted, green_points, friends_count')
        .in('id', friendIds);

      if (profilesError) throw profilesError;
      return (profiles || []) as FriendProfile[];
    },
    enabled: !!userId,
  });
}

export function useFriendRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: requests, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('addressee_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!requests || requests.length === 0) return [];

      // Get requester profiles
      const requesterIds = requests.map(r => r.requester_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio')
        .in('id', requesterIds);

      return requests.map(req => ({
        ...req,
        requester: profiles?.find(p => p.id === req.requester_id),
      }));
    },
    enabled: !!user,
  });
}

export function useFriendRequestsCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friend-requests-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

export function useMutualFriends(targetUserId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['mutual-friends', user?.id, targetUserId],
    queryFn: async () => {
      if (!user || user.id === targetUserId) return [];

      // Get my friends
      const { data: myFriendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      const myFriendIds = new Set(
        myFriendships?.map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id) || []
      );

      // Get target's friends
      const { data: theirFriendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${targetUserId},addressee_id.eq.${targetUserId}`);

      const theirFriendIds = new Set(
        theirFriendships?.map(f => f.requester_id === targetUserId ? f.addressee_id : f.requester_id) || []
      );

      // Find mutual
      const mutualIds = [...myFriendIds].filter(id => theirFriendIds.has(id));
      
      if (mutualIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', mutualIds)
        .limit(5);

      return { profiles: profiles || [], total: mutualIds.length };
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });
}

export function useSendFriendRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: targetUserId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        actor_id: user.id,
        type: 'friend_request',
        title: 'Friend Request',
        message: 'sent you a friend request',
        reference_id: data.id,
        reference_type: 'friendship',
      });

      return data;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ['friendship-status', user?.id, targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });
}

export function useAcceptFriendRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendshipId: string) => {
      if (!user) throw new Error('Must be logged in');

      // Get the friendship to find requester
      const { data: friendship, error: fetchError } = await supabase
        .from('friendships')
        .select('*')
        .eq('id', friendshipId)
        .single();

      if (fetchError) throw fetchError;

      // Update friendship status
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', friendshipId);

      if (error) throw error;

      // Award Camly Coins to both users (+2,000 each)
      const camlyReward = CAMLY_REWARDS.INVITE_FRIEND; // 5000, we'll use 2000

      // Award to current user (acceptor)
      await supabase.from('points_history').insert({
        user_id: user.id,
        action_type: 'friend_accept',
        points_earned: 20,
        camly_equivalent: 2000,
        camly_earned: 2000,
        description: 'Friend request accepted',
        reference_id: friendshipId,
        reference_type: 'friendship',
      });

      // Award to requester
      await supabase.from('points_history').insert({
        user_id: friendship.requester_id,
        action_type: 'friend_accept',
        points_earned: 20,
        camly_equivalent: 2000,
        camly_earned: 2000,
        description: 'Friend request accepted',
        reference_id: friendshipId,
        reference_type: 'friendship',
      });

      // Create notification for requester
      await supabase.from('notifications').insert({
        user_id: friendship.requester_id,
        actor_id: user.id,
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        message: 'accepted your friend request',
        camly_amount: 2000,
        reference_id: user.id,
        reference_type: 'user',
      });

      return friendship;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friendship-status'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useRejectFriendRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendshipId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friendship-status'] });
    },
  });
}

export function useUnfriend() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`);

      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendship-status', user?.id, targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useCancelFriendRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('requester_id', user.id)
        .eq('addressee_id', targetUserId)
        .eq('status', 'pending');

      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ['friendship-status', user?.id, targetUserId] });
    },
  });
}

export function useFriendSuggestions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friend-suggestions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get current friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .in('status', ['pending', 'accepted']);

      const excludeIds = new Set<string>([user.id]);
      friendships?.forEach(f => {
        excludeIds.add(f.requester_id);
        excludeIds.add(f.addressee_id);
      });

      // Get suggested users (not friends, active users)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, trees_planted, friends_count')
        .not('id', 'in', `(${[...excludeIds].join(',')})`)
        .order('friends_count', { ascending: false })
        .limit(10);

      return profiles || [];
    },
    enabled: !!user,
  });
}
