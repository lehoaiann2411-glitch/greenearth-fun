import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DAILY_LIMITS } from '@/lib/camlyCoin';

interface DailyLimit {
  id: string;
  user_id: string;
  limit_date: string;
  shares_count: number;
  likes_count: number;
}

export function useDailyLimits() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['daily-limits', user?.id, today],
    queryFn: async (): Promise<DailyLimit | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('daily_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('limit_date', today)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useIncrementLimit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  return useMutation({
    mutationFn: async ({ type }: { type: 'shares' | 'likes' }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check if record exists for today
      const { data: existing } = await supabase
        .from('daily_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('limit_date', today)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const column = type === 'shares' ? 'shares_count' : 'likes_count';
        const currentCount = type === 'shares' ? existing.shares_count : existing.likes_count;
        
        const { error } = await supabase
          .from('daily_limits')
          .update({ [column]: currentCount + 1 })
          .eq('id', existing.id);

        if (error) throw error;
        return { newCount: currentCount + 1 };
      } else {
        // Create new record for today
        const { error } = await supabase
          .from('daily_limits')
          .insert({
            user_id: user.id,
            limit_date: today,
            shares_count: type === 'shares' ? 1 : 0,
            likes_count: type === 'likes' ? 1 : 0,
          });

        if (error) throw error;
        return { newCount: 1 };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-limits'] });
    },
  });
}

export function canPerformAction(
  limits: DailyLimit | null | undefined,
  type: 'shares' | 'likes'
): boolean {
  if (!limits) return true; // No limits set yet, can perform
  
  const maxLimit = type === 'shares' ? DAILY_LIMITS.SHARES : DAILY_LIMITS.LIKES;
  const currentCount = type === 'shares' ? limits.shares_count : limits.likes_count;
  
  return currentCount < maxLimit;
}

export function getRemainingActions(
  limits: DailyLimit | null | undefined,
  type: 'shares' | 'likes'
): number {
  const maxLimit = type === 'shares' ? DAILY_LIMITS.SHARES : DAILY_LIMITS.LIKES;
  
  if (!limits) return maxLimit;
  
  const currentCount = type === 'shares' ? limits.shares_count : limits.likes_count;
  return Math.max(0, maxLimit - currentCount);
}
