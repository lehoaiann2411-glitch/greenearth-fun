import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

export type LeaderboardPeriod = 'week' | 'month' | 'all';

export interface LeaderboardEntry extends Profile {
  rank: number;
}

export function useLeaderboard(period: LeaderboardPeriod = 'all', limit: number = 50) {
  return useQuery({
    queryKey: ['leaderboard', period, limit],
    queryFn: async () => {
      // Sort by camly_balance (Camly Coin) instead of green_points
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('camly_balance', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Add rank to each entry
      const rankedData: LeaderboardEntry[] = (data || []).map((profile, index) => ({
        ...profile,
        rank: index + 1,
      }));

      return rankedData;
    },
  });
}

export function useUserRank(userId?: string) {
  return useQuery({
    queryKey: ['userRank', userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get user's camly_balance
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('camly_balance')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Count users with more Camly Coin
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('camly_balance', userProfile.camly_balance || 0);

      if (countError) throw countError;

      return (count || 0) + 1;
    },
    enabled: !!userId,
  });
}
