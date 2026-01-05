import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CAMLY_REWARDS, ACTION_TYPES } from '@/lib/camlyCoin';
import { toast } from 'sonner';

interface CheckInStatus {
  hasCheckedInToday: boolean;
  currentStreak: number;
  lastCheckIn: string | null;
}

export function useCheckInStatus() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['check-in-status', user?.id],
    queryFn: async (): Promise<CheckInStatus> => {
      if (!user?.id) {
        return { hasCheckedInToday: false, currentStreak: 0, lastCheckIn: null };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('current_streak, last_check_in')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const lastCheckIn = profile?.last_check_in;
      const hasCheckedInToday = lastCheckIn === today;
      const currentStreak = profile?.current_streak || 0;

      return { hasCheckedInToday, currentStreak, lastCheckIn };
    },
    enabled: !!user?.id,
  });
}

export function useDailyCheckIn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get current profile data
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('camly_balance, current_streak, last_check_in')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Check if already checked in today
      if (profile?.last_check_in === today) {
        throw new Error('Already checked in today');
      }

      // Calculate streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      if (profile?.last_check_in === yesterdayStr) {
        newStreak = (profile?.current_streak || 0) + 1;
      }

      // Calculate rewards
      let totalReward = CAMLY_REWARDS.DAILY_CHECK_IN;
      const is7DayStreak = newStreak > 0 && newStreak % 7 === 0;
      
      if (is7DayStreak) {
        totalReward += CAMLY_REWARDS.STREAK_7_DAY_BONUS;
      }

      // Update profile
      const newBalance = (profile?.camly_balance || 0) + totalReward;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          camly_balance: newBalance,
          current_streak: newStreak,
          last_check_in: today,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log check-in reward
      await supabase.from('points_history').insert({
        user_id: user.id,
        action_type: ACTION_TYPES.DAILY_CHECK_IN,
        points_earned: 0,
        camly_equivalent: CAMLY_REWARDS.DAILY_CHECK_IN,
        camly_earned: CAMLY_REWARDS.DAILY_CHECK_IN,
        description: `Daily check-in day ${newStreak}`,
      });

      // Log streak bonus if applicable
      if (is7DayStreak) {
        await supabase.from('points_history').insert({
          user_id: user.id,
          action_type: ACTION_TYPES.STREAK_BONUS,
          points_earned: 0,
          camly_equivalent: CAMLY_REWARDS.STREAK_7_DAY_BONUS,
          camly_earned: CAMLY_REWARDS.STREAK_7_DAY_BONUS,
          description: `7-day streak bonus!`,
        });
      }

      return { 
        reward: totalReward, 
        newStreak, 
        is7DayStreak,
        baseReward: CAMLY_REWARDS.DAILY_CHECK_IN,
        bonusReward: is7DayStreak ? CAMLY_REWARDS.STREAK_7_DAY_BONUS : 0
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['check-in-status'] });
      queryClient.invalidateQueries({ queryKey: ['points-history'] });
      
      if (data.is7DayStreak) {
        toast.success(`🔥 7-Day Streak! +${data.reward.toLocaleString()} Camly Coin!`, {
          description: `Base: +${data.baseReward.toLocaleString()} | Bonus: +${data.bonusReward.toLocaleString()}`,
        });
      } else {
        toast.success(`✅ Daily Check-in! +${data.reward.toLocaleString()} Camly Coin!`, {
          description: `Current streak: ${data.newStreak} days`,
        });
      }
    },
    onError: (error: Error) => {
      if (error.message === 'Already checked in today') {
        toast.info('You already checked in today! Come back tomorrow 🌱');
      } else {
        toast.error('Check-in failed: ' + error.message);
      }
    },
  });
}
