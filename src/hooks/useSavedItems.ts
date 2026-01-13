import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// ===================== SAVED POSTS =====================

export function useSavedPosts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-posts', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          id,
          created_at,
          post_id,
          posts:post_id (
            id,
            content,
            image_url,
            media_urls,
            post_type,
            location_name,
            likes_count,
            comments_count,
            shares_count,
            created_at,
            campaign_id,
            user_id,
            visibility,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            ),
            campaigns:campaign_id (
              id,
              title,
              category
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useIsPostSaved(postId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-post-saved', postId, user?.id],
    queryFn: async () => {
      if (!user || !postId) return false;

      const { data, error } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!postId,
  });
}

export function useSavePost() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, save }: { postId: string; save: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (save) {
        const { error } = await supabase
          .from('saved_posts')
          .insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        if (error) throw error;
      }
    },
    onSuccess: (_, { postId, save }) => {
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
      queryClient.invalidateQueries({ queryKey: ['is-post-saved', postId] });
      toast.success(save ? t('saved.saved') : t('saved.unsaved'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });
}

// ===================== SAVED STORIES =====================

export function useSavedStories() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-stories', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_stories')
        .select(`
          id,
          created_at,
          story_id,
          stories:story_id (
            id,
            media_url,
            media_type,
            caption,
            created_at,
            expires_at,
            views_count,
            user_id,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useIsSavedStory(storyId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-story-saved', storyId, user?.id],
    queryFn: async () => {
      if (!user || !storyId) return false;

      const { data, error } = await supabase
        .from('saved_stories')
        .select('id')
        .eq('user_id', user.id)
        .eq('story_id', storyId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!storyId,
  });
}

export function useSaveStory() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storyId, save }: { storyId: string; save: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (save) {
        const { error } = await supabase
          .from('saved_stories')
          .insert({ user_id: user.id, story_id: storyId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_stories')
          .delete()
          .eq('user_id', user.id)
          .eq('story_id', storyId);
        if (error) throw error;
      }
    },
    onSuccess: (_, { storyId, save }) => {
      queryClient.invalidateQueries({ queryKey: ['saved-stories'] });
      queryClient.invalidateQueries({ queryKey: ['is-story-saved', storyId] });
      toast.success(save ? t('saved.saved') : t('saved.unsaved'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });
}

// ===================== SAVED REELS =====================

export function useSavedReels() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-reels', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_reels')
        .select(`
          id,
          created_at,
          reel_id,
          reels:reel_id (
            id,
            video_url,
            thumbnail_url,
            caption,
            hashtags,
            music_title,
            likes_count,
            comments_count,
            shares_count,
            views_count,
            created_at,
            user_id,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useIsReelSaved(reelId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-reel-saved', reelId, user?.id],
    queryFn: async () => {
      if (!user || !reelId) return false;

      const { data, error } = await supabase
        .from('saved_reels')
        .select('id')
        .eq('user_id', user.id)
        .eq('reel_id', reelId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!reelId,
  });
}

export function useSaveReel() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reelId, save }: { reelId: string; save: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (save) {
        const { error } = await supabase
          .from('saved_reels')
          .insert({ user_id: user.id, reel_id: reelId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_reels')
          .delete()
          .eq('user_id', user.id)
          .eq('reel_id', reelId);
        if (error) throw error;
      }
    },
    onSuccess: (_, { reelId, save }) => {
      queryClient.invalidateQueries({ queryKey: ['saved-reels'] });
      queryClient.invalidateQueries({ queryKey: ['is-reel-saved', reelId] });
      toast.success(save ? t('saved.saved') : t('saved.unsaved'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });
}
