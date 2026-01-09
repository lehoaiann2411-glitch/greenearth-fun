import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRewardNotification } from './useRewardNotification';
import { useConfetti } from './useConfetti';
import { CAMLY_REWARDS, ACTION_TYPES } from '@/lib/camlyCoin';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export interface EcoHabit {
  id: string;
  title: string;
  title_vi: string;
  description: string | null;
  description_vi: string | null;
  icon_emoji: string | null;
  camly_reward: number;
  category: string | null;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_date: string;
  camly_earned: number;
}

// Seeded random function for consistent daily habits
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Get today's date string for seed
function getTodaySeed(): number {
  const today = format(new Date(), 'yyyyMMdd');
  return parseInt(today, 10);
}

// Shuffle array with seed
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function useTodayHabits() {
  return useQuery({
    queryKey: ['eco-habits', 'today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_habits')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      // Shuffle and take 6-8 habits based on today's seed
      const seed = getTodaySeed();
      const shuffled = shuffleWithSeed(data || [], seed);
      const count = 6 + Math.floor(seededRandom(seed + 1000) * 3); // 6-8 habits
      
      return shuffled.slice(0, count) as EcoHabit[];
    },
  });
}

export function useTodayCompletions() {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['habit-completions', 'today', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_date', today);

      if (error) throw error;
      return (data || []) as HabitCompletion[];
    },
    enabled: !!user,
  });
}

export function useHabitStreak() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['habit-streak', user?.id],
    queryFn: async () => {
      if (!user) return { streak: 0, lastDate: null };

      const { data, error } = await supabase
        .from('profiles')
        .select('habit_streak, last_habit_date')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return {
        streak: data?.habit_streak || 0,
        lastDate: data?.last_habit_date,
      };
    },
    enabled: !!user,
  });
}

export function useMonthlyCalendar() {
  const { user } = useAuth();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  return useQuery({
    queryKey: ['habit-calendar', user?.id, format(now, 'yyyy-MM')],
    queryFn: async () => {
      if (!user) return {};

      // Get all completions for this month
      const { data: completions, error } = await supabase
        .from('user_habit_completions')
        .select('completed_date')
        .eq('user_id', user.id)
        .gte('completed_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('completed_date', format(monthEnd, 'yyyy-MM-dd'));

      if (error) throw error;

      // Count completions per day
      const dayCompletions: Record<string, number> = {};
      completions?.forEach((c) => {
        const day = c.completed_date;
        dayCompletions[day] = (dayCompletions[day] || 0) + 1;
      });

      // Generate calendar data
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const calendar: Record<string, 'full' | 'partial' | 'none'> = {};
      
      days.forEach((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const count = dayCompletions[key] || 0;
        if (count >= 6) {
          calendar[key] = 'full';
        } else if (count > 0) {
          calendar[key] = 'partial';
        } else {
          calendar[key] = 'none';
        }
      });

      return calendar;
    },
    enabled: !!user,
  });
}

export function useCompleteHabit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showReward } = useRewardNotification();
  const { triggerConfetti, triggerCoinRain } = useConfetti();

  return useMutation({
    mutationFn: async ({ 
      habitId, 
      totalHabits,
      completedCount 
    }: { 
      habitId: string; 
      totalHabits: number;
      completedCount: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const reward = CAMLY_REWARDS.COMPLETE_HABIT;
      const today = format(new Date(), 'yyyy-MM-dd');
      const isLastHabit = completedCount + 1 === totalHabits;

      // Insert completion
      const { error: insertError } = await supabase
        .from('user_habit_completions')
        .insert({
          user_id: user.id,
          habit_id: habitId,
          camly_earned: reward,
          completed_date: today,
        });

      if (insertError) throw insertError;

      // Get current balance and update
      const { data: profile } = await supabase
        .from('profiles')
        .select('camly_balance')
        .eq('id', user.id)
        .single();

      const currentBalance = profile?.camly_balance || 0;
      
      await supabase
        .from('profiles')
        .update({ camly_balance: currentBalance + reward })
        .eq('id', user.id);

      // Log to points_history
      await supabase.from('points_history').insert({
        user_id: user.id,
        action_type: ACTION_TYPES.COMPLETE_HABIT,
        points_earned: 0,
        camly_earned: reward,
        camly_equivalent: reward,
        description: 'Completed eco habit',
        reference_id: habitId,
        reference_type: 'habit',
      });

      let bonusEarned = 0;
      let streakBonus = 0;

      // Check if all habits completed
      if (isLastHabit) {
        bonusEarned = CAMLY_REWARDS.COMPLETE_ALL_HABITS;

        // Get updated balance and add bonus
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('camly_balance, habit_streak, last_habit_date')
          .eq('id', user.id)
          .single();

        const newBalance = (updatedProfile?.camly_balance || 0) + bonusEarned;
        
        // Calculate streak
        let newStreak = 1;
        if (updatedProfile?.last_habit_date) {
          const lastDate = new Date(updatedProfile.last_habit_date);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (format(lastDate, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
            newStreak = (updatedProfile.habit_streak || 0) + 1;
          } else if (format(lastDate, 'yyyy-MM-dd') === today) {
            newStreak = updatedProfile.habit_streak || 1;
          }
        }

        // Check streak milestones
        if (newStreak === 7) {
          streakBonus = CAMLY_REWARDS.HABIT_STREAK_7_DAY;
        } else if (newStreak === 30) {
          streakBonus = CAMLY_REWARDS.HABIT_STREAK_30_DAY;
        }

        // Update profile with bonus and streak
        await supabase
          .from('profiles')
          .update({
            camly_balance: newBalance + streakBonus,
            habit_streak: newStreak,
            last_habit_date: today,
          })
          .eq('id', user.id);

        // Log bonus
        await supabase.from('points_history').insert({
          user_id: user.id,
          action_type: ACTION_TYPES.COMPLETE_ALL_HABITS,
          points_earned: 0,
          camly_earned: bonusEarned,
          camly_equivalent: bonusEarned,
          description: 'Completed all daily habits',
        });

        if (streakBonus > 0) {
          await supabase.from('points_history').insert({
            user_id: user.id,
            action_type: ACTION_TYPES.HABIT_STREAK_BONUS,
            points_earned: 0,
            camly_earned: streakBonus,
            camly_equivalent: streakBonus,
            description: `${newStreak}-day habit streak bonus`,
          });
        }
      }

      return { 
        reward, 
        bonusEarned, 
        streakBonus,
        isComplete: isLastHabit,
      };
    },
    onSuccess: (data) => {
      // Show reward notification
      showReward(data.reward, ACTION_TYPES.COMPLETE_HABIT, { showConfetti: true });
      triggerConfetti('small');

      // If all completed
      if (data.isComplete) {
        setTimeout(() => {
          showReward(data.bonusEarned, ACTION_TYPES.COMPLETE_ALL_HABITS, { 
            showConfetti: true, 
            showCoinRain: true 
          });
          triggerConfetti('large');
          triggerCoinRain();
        }, 500);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['habit-completions'] });
      queryClient.invalidateQueries({ queryKey: ['habit-streak'] });
      queryClient.invalidateQueries({ queryKey: ['habit-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
