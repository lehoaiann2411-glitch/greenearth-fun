import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MutualFollower {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function useMutualFollowers(targetUserId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['mutual-followers', user?.id, targetUserId],
    queryFn: async () => {
      if (!user || user.id === targetUserId) return [];

      // 1. Get list of users I'm following
      const { data: myFollowing } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const myFollowingIds = myFollowing?.map(f => f.following_id) || [];

      if (myFollowingIds.length === 0) return [];

      // 2. Get list of users who follow the target user
      const { data: targetFollowers } = await supabase
        .from('user_follows')
        .select(`
          follower_id,
          follower:profiles!user_follows_follower_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('following_id', targetUserId);

      if (!targetFollowers) return [];

      // 3. Find intersection - users I follow who also follow target
      const mutuals = targetFollowers.filter(f => 
        myFollowingIds.includes(f.follower_id)
      );

      return mutuals.map(m => m.follower as MutualFollower).filter(Boolean);
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });
}
