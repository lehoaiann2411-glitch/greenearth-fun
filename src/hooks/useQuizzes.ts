import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface QuizOption {
  text: string;
  text_vi?: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  question_vi?: string;
  options: QuizOption[];
  explanation?: string;
  explanation_vi?: string;
  order_index: number;
}

export interface Quiz {
  id: string;
  title: string;
  title_vi?: string;
  description?: string;
  description_vi?: string;
  category: string;
  difficulty: string;
  points_reward: number;
  image_url?: string;
  duration_minutes: number;
  questions_count: number;
  attempts_count: number;
  is_published: boolean;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_taken_seconds?: number;
  answers: any[];
  points_earned: number;
  completed_at: string;
}

export function useQuizzes(category?: string) {
  return useQuery({
    queryKey: ['quizzes', category],
    queryFn: async () => {
      let query = supabase
        .from('quizzes')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Quiz[];
    },
  });
}

export function useQuiz(quizId: string | undefined) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      if (!quizId) return null;
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (error) throw error;
      return data as Quiz;
    },
    enabled: !!quizId,
  });
}

export function useQuizQuestions(quizId: string | undefined) {
  return useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: async () => {
      if (!quizId) return [];
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      // Parse options from JSONB
      return (data || []).map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      })) as QuizQuestion[];
    },
    enabled: !!quizId,
  });
}

export function useUserQuizAttempts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['quiz-attempts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data as QuizAttempt[];
    },
    enabled: !!user?.id,
  });
}

export function useSubmitQuizAttempt() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      score,
      totalQuestions,
      timeTakenSeconds,
      answers,
      pointsEarned
    }: {
      quizId: string;
      score: number;
      totalQuestions: number;
      timeTakenSeconds?: number;
      answers: any[];
      pointsEarned: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score,
          total_questions: totalQuestions,
          time_taken_seconds: timeTakenSeconds,
          answers,
          points_earned: pointsEarned
        })
        .select()
        .single();

      if (error) throw error;

      // Award points to user profile
      if (pointsEarned > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('green_points')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ green_points: (profile.green_points || 0) + pointsEarned })
            .eq('id', user.id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Quiz completed! Points earned!');
    },
    onError: (error) => {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    },
  });
}

export function useQuizBestAttempt(quizId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['quiz-best-attempt', quizId, user?.id],
    queryFn: async () => {
      if (!user?.id || !quizId) return null;
      
      const { data, error } = await supabase
        .from('user_quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as QuizAttempt | null;
    },
    enabled: !!user?.id && !!quizId,
  });
}
