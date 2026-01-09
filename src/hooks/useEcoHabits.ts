import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useConfetti } from './useConfetti';
import { toast } from 'sonner';
import { CAMLY_REWARDS, ACTION_TYPES } from '@/lib/camlyCoin';

interface DailyHabit {
  id: string;
  title: string;
  title_vi: string;
  description: string | null;
  description_vi: string | null;
  icon_emoji: string;
  camly_reward: number;
  category: string;
  order_index: number;
}

interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_date: string;
  camly_earned: number;
}

interface HabitStats {
  completedToday: number;
  totalToday: number;
  habitStreak: number;
  lastHabitDate: string | null;
}

// Get random habits for today (seeded by date for consistency)
function getTodayHabits(allHabits: DailyHabit[], count: number = 7): DailyHabit[] {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  
  // Shuffle with seed
  const shuffled = [...allHabits].sort((a, b) => {
    const hashA = (a.order_index * seed) % 100;
    const hashB = (b.order_index * seed) % 100;
    return hashA - hashB;
  });
  
  return shuffled.slice(0, count);
}

export function useAllHabits() {
  return useQuery({
    queryKey: ['all-habits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_habits')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      return data as DailyHabit[];
    },
  });
}

export function useTodayHabits() {
  const { data: allHabits } = useAllHabits();
  
  return useQuery({
    queryKey: ['today-habits', allHabits?.length],
    queryFn: () => {
      if (!allHabits) return [];
      return getTodayHabits(allHabits, 7);
    },
    enabled: !!allHabits && allHabits.length > 0,
  });
}

export function useTodayCompletions() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['habit-completions', user?.id, today],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_date', today);

      if (error) throw error;
      return data as HabitCompletion[];
    },
    enabled: !!user,
  });
}

export function useHabitStats() {
  const { user } = useAuth();
  const { data: todayHabits } = useTodayHabits();
  const { data: todayCompletions } = useTodayCompletions();
  
  return useQuery({
    queryKey: ['habit-stats', user?.id, todayHabits?.length, todayCompletions?.length],
    queryFn: async (): Promise<HabitStats> => {
      if (!user) {
        return { completedToday: 0, totalToday: 0, habitStreak: 0, lastHabitDate: null };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('habit_streak, last_habit_date')
        .eq('id', user.id)
        .single();

      return {
        completedToday: todayCompletions?.length || 0,
        totalToday: todayHabits?.length || 7,
        habitStreak: profile?.habit_streak || 0,
        lastHabitDate: profile?.last_habit_date || null,
      };
    },
    enabled: !!user,
  });
}

export function useHabitCalendar() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['habit-calendar', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const startDate = startOfMonth.toISOString().split('T')[0];

      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      const endDate = endOfMonth.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('user_habit_completions')
        .select('completed_date')
        .eq('user_id', user.id)
        .gte('completed_date', startDate)
        .lte('completed_date', endDate);

      if (error) throw error;

      // Group by date and count completions
      const dateMap: Record<string, number> = {};
      data?.forEach(item => {
        dateMap[item.completed_date] = (dateMap[item.completed_date] || 0) + 1;
      });

      return Object.entries(dateMap).map(([date, count]) => ({
        date,
        count,
        isComplete: count >= 7, // 7 habits = full day
      }));
    },
    enabled: !!user,
  });
}

export function useCompleteHabit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { triggerConfetti, triggerCoinRain } = useConfetti();
  
  return useMutation({
    mutationFn: async ({ habitId, camlyReward }: { habitId: string; camlyReward: number }) => {
      if (!user) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];

      // Check if already completed today
      const { data: existing } = await supabase
        .from('user_habit_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('habit_id', habitId)
        .eq('completed_date', today)
        .single();

      if (existing) {
        throw new Error('Already completed this habit today');
      }

      // Insert completion
      const { error: insertError } = await supabase
        .from('user_habit_completions')
        .insert({
          user_id: user.id,
          habit_id: habitId,
          completed_date: today,
          camly_earned: camlyReward,
        });

      if (insertError) throw insertError;

      // Update camly balance - direct update
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('camly_balance')
        .eq('id', user.id)
        .single();

      const currentBalance = currentProfile?.camly_balance || 0;
      await supabase
        .from('profiles')
        .update({ camly_balance: currentBalance + camlyReward })
        .eq('id', user.id);

      // Log to points_history
      await supabase.from('points_history').insert({
        user_id: user.id,
        action_type: ACTION_TYPES.COMPLETE_QUEST,
        points_earned: 0,
        camly_equivalent: camlyReward,
        camly_earned: camlyReward,
        description: 'Completed daily eco habit',
        reference_type: 'habit',
        reference_id: habitId,
      });

      // Check if all habits completed today
      const { data: completions } = await supabase
        .from('user_habit_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed_date', today);

      const isAllComplete = (completions?.length || 0) >= 7;

      // Update streak if all complete
      if (isAllComplete) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('habit_streak, last_habit_date, camly_balance')
          .eq('id', user.id)
          .single();

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newStreak = 1;
        if (profile?.last_habit_date === yesterdayStr) {
          newStreak = (profile?.habit_streak || 0) + 1;
        }

        // All complete bonus: 100 Camly
        const bonus = 100;
        const currentBalance = profile?.camly_balance || 0;

        await supabase
          .from('profiles')
          .update({
            habit_streak: newStreak,
            last_habit_date: today,
            camly_balance: currentBalance + bonus,
          })
          .eq('id', user.id);

        // Log bonus
        await supabase.from('points_history').insert({
          user_id: user.id,
          action_type: 'complete_all_habits',
          points_earned: 0,
          camly_equivalent: bonus,
          camly_earned: bonus,
          description: 'Completed all daily eco habits',
        });

        // Check streak bonuses
        if (newStreak === 7) {
          const streakBonus = 200;
          await supabase
            .from('profiles')
            .update({ camly_balance: currentBalance + bonus + streakBonus })
            .eq('id', user.id);

          await supabase.from('points_history').insert({
            user_id: user.id,
            action_type: 'habit_streak_bonus',
            points_earned: 0,
            camly_equivalent: streakBonus,
            camly_earned: streakBonus,
            description: '7-day habit streak bonus',
          });
        }

        return { isAllComplete: true, newStreak };
      }

      return { isAllComplete: false, newStreak: 0 };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['habit-completions'] });
      queryClient.invalidateQueries({ queryKey: ['habit-stats'] });
      queryClient.invalidateQueries({ queryKey: ['habit-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['points-history'] });

      toast.success(`+${variables.camlyReward} Camly Coin! 🌱`);
      triggerConfetti('small');

      if (result.isAllComplete) {
        setTimeout(() => {
          triggerCoinRain();
          toast.success('🎉 Tuyệt vời! Bạn đã hoàn thành tất cả thói quen hôm nay! +100 Bonus', {
            duration: 5000,
          });
        }, 500);
      }
    },
    onError: (error: Error) => {
      if (error.message === 'Already completed this habit today') {
        toast.info('Bạn đã hoàn thành thói quen này hôm nay rồi!');
      } else {
        toast.error('Có lỗi xảy ra');
      }
    },
  });
}

export function useEcoHabits() {
  const { data: todayHabits, isLoading: habitsLoading } = useTodayHabits();
  const { data: completions, isLoading: completionsLoading } = useTodayCompletions();
  const { data: stats, isLoading: statsLoading } = useHabitStats();
  const { data: calendar, isLoading: calendarLoading } = useHabitCalendar();
  const completeHabit = useCompleteHabit();

  const habitsWithStatus = todayHabits?.map(habit => ({
    ...habit,
    isCompleted: completions?.some(c => c.habit_id === habit.id) || false,
  })) || [];

  return {
    habits: habitsWithStatus,
    stats: stats || { completedToday: 0, totalToday: 7, habitStreak: 0, lastHabitDate: null },
    calendar: calendar || [],
    isLoading: habitsLoading || completionsLoading || statsLoading,
    calendarLoading,
    completeHabit,
  };
}
