import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Quest {
  id: string;
  title: string;
  title_vi: string | null;
  description: string | null;
  description_vi: string | null;
  quest_type: string;
  points_reward: number;
  is_active: boolean;
}

interface QuestProgress {
  id: string;
  user_id: string;
  quest_id: string;
  completed_at: string;
  quest_date: string;
}

export function useQuests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data as Quest[];
    },
  });
}

export function useQuestProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['quest-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_quest_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('quest_date', today);

      if (error) throw error;
      return data as QuestProgress[];
    },
    enabled: !!user,
  });
}

export function useCompleteQuest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questId, pointsReward }: { questId: string; pointsReward: number }) => {
      if (!user) throw new Error('User not authenticated');

      // Insert quest progress
      const { error: progressError } = await supabase
        .from('user_quest_progress')
        .insert({
          user_id: user.id,
          quest_id: questId,
        });

      if (progressError) throw progressError;

      // Fetch current points and add
      const { data: profile } = await supabase
        .from('profiles')
        .select('green_points')
        .eq('id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ green_points: (profile.green_points || 0) + pointsReward })
          .eq('id', user.id);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-progress'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
