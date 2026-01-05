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
      // For now, we'll fetch all users sorted by green_points
      // In a real app, you'd have period-based tracking
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('green_points', { ascending: false })
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

      // Get user's points
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('green_points')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Count users with more points
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('green_points', userProfile.green_points);

      if (countError) throw countError;

      return (count || 0) + 1;
    },
    enabled: !!userId,
  });
}
