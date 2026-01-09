import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EducationalContent {
  id: string;
  title: string;
  title_vi?: string;
  description?: string;
  description_vi?: string;
  content_type: 'video' | 'infographic' | 'article';
  category: string;
  media_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  points_reward: number;
  view_count: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

export interface ContentView {
  id: string;
  user_id: string;
  content_id: string;
  points_earned: number;
  viewed_at: string;
}

export function useEducationalContent(contentType?: string, category?: string) {
  return useQuery({
    queryKey: ['educational-content', contentType, category],
    queryFn: async () => {
      let query = supabase
        .from('educational_content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (contentType && contentType !== 'all') {
        query = query.eq('content_type', contentType);
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EducationalContent[];
    },
  });
}

export function useFeaturedContent() {
  return useQuery({
    queryKey: ['featured-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('educational_content')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as EducationalContent[];
    },
  });
}

export function useContentViews() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['content-views', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('content_views')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as ContentView[];
    },
    enabled: !!user?.id,
  });
}

export function useRecordContentView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      pointsReward
    }: {
      contentId: string;
      pointsReward: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check if already viewed
      const { data: existing } = await supabase
        .from('content_views')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .maybeSingle();

      if (existing) {
        // Already viewed, no points
        return { alreadyViewed: true, points: 0 };
      }

      // Record new view
      const { error } = await supabase
        .from('content_views')
        .insert({
          user_id: user.id,
          content_id: contentId,
          points_earned: pointsReward
        });

      if (error) throw error;

      // Award points to user
      if (pointsReward > 0) {
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
      }

      return { alreadyViewed: false, points: pointsReward };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['content-views'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (!result.alreadyViewed && result.points > 0) {
        toast.success(`+${result.points} Green Points!`);
      }
    },
  });
}

export function useInfluencers() {
  return useQuery({
    queryKey: ['influencers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useFeaturedInfluencers() {
  return useQuery({
    queryKey: ['featured-influencers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('is_featured', true)
        .order('order_index', { ascending: true })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });
}
