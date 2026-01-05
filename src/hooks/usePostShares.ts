import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CAMLY_REWARDS } from '@/lib/camlyCoin';

export interface PostShare {
  id: string;
  original_post_id: string;
  shared_by: string;
  share_caption: string | null;
  visibility: string;
  camly_earned: number;
  created_at: string;
  sharer?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  original_post?: {
    id: string;
    content: string;
    image_url: string | null;
    media_urls: string[] | null;
    user_id: string;
    created_at: string;
    user?: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  };
}

export function useSharePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      caption,
      visibility = 'public',
    }: {
      postId: string;
      caption?: string;
      visibility?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Get original post to find author
      const { data: originalPost, error: postError } = await supabase
        .from('posts')
        .select('user_id, content')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      // Create share
      const { data: share, error: shareError } = await supabase
        .from('post_shares')
        .insert({
          original_post_id: postId,
          shared_by: user.id,
          share_caption: caption,
          visibility,
          camly_earned: CAMLY_REWARDS.SHARE_POST,
        })
        .select()
        .single();

      if (shareError) throw shareError;

      // Award Camly to sharer (+2,000)
      await supabase.from('points_history').insert({
        user_id: user.id,
        action_type: 'share_post',
        points_earned: 20,
        camly_equivalent: CAMLY_REWARDS.SHARE_POST,
        camly_earned: CAMLY_REWARDS.SHARE_POST,
        description: 'Shared a post',
        reference_id: share.id,
        reference_type: 'post_share',
      });

      // Award bonus to original author (+500) if not self-share
      if (originalPost.user_id !== user.id) {
        const authorBonus = 500;

        await supabase.from('points_history').insert({
          user_id: originalPost.user_id,
          action_type: 'post_shared_bonus',
          points_earned: 5,
          camly_equivalent: authorBonus,
          camly_earned: authorBonus,
          description: 'Your post was shared',
          reference_id: share.id,
          reference_type: 'post_share',
        });

        // Notify original author
        await supabase.from('notifications').insert({
          user_id: originalPost.user_id,
          actor_id: user.id,
          type: 'post_shared',
          title: 'Post Shared',
          message: 'shared your post',
          camly_amount: authorBonus,
          reference_id: postId,
          reference_type: 'post',
        });
      }

      return share;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-shares'] });
    },
  });
}

export function useUserShares(userId: string) {
  return useQuery({
    queryKey: ['user-shares', userId],
    queryFn: async () => {
      const { data: shares, error } = await supabase
        .from('post_shares')
        .select('*')
        .eq('shared_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!shares || shares.length === 0) return [];

      // Get original posts
      const postIds = [...new Set(shares.map(s => s.original_post_id))];
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, image_url, media_urls, user_id, created_at')
        .in('id', postIds);

      // Get all user profiles
      const userIds = [...new Set([
        userId,
        ...(posts?.map(p => p.user_id) || []),
      ])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      return shares.map(share => ({
        ...share,
        sharer: profiles?.find(p => p.id === share.shared_by),
        original_post: posts?.find(p => p.id === share.original_post_id)
          ? {
              ...posts.find(p => p.id === share.original_post_id)!,
              user: profiles?.find(pr => pr.id === posts.find(p => p.id === share.original_post_id)?.user_id),
            }
          : undefined,
      })) as PostShare[];
    },
    enabled: !!userId,
  });
}

export function useDeleteShare() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('post_shares')
        .delete()
        .eq('id', shareId)
        .eq('shared_by', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-shares'] });
    },
  });
}
