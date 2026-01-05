import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Badge {
  id: string;
  name: string;
  name_vi: string | null;
  description: string | null;
  description_vi: string | null;
  icon: string | null;
  requirement_type: string;
  requirement_value: number;
}

interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*');

      if (error) throw error;
      return data as Badge[];
    },
  });
}

export function useUserBadges(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['user-badges', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', targetUserId);

      if (error) throw error;
      return data as (UserBadge & { badge: Badge })[];
    },
    enabled: !!targetUserId,
  });
}
