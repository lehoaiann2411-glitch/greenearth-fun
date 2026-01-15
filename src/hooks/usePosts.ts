import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CAMLY_REWARDS, ACTION_TYPES, DAILY_LIMITS } from '@/lib/camlyCoin';
import { useRewardNotification } from '@/hooks/useRewardNotification';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  campaign_id: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    green_points: number;
  };
  campaign?: {
    id: string;
    title: string;
  } | null;
  user_liked?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function usePosts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!posts) return [];

      const userIds = [...new Set(posts.map(p => p.user_id))];
      const campaignIds = [...new Set(posts.filter(p => p.campaign_id).map(p => p.campaign_id!))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, green_points')
        .in('id', userIds);

      const { data: campaigns } = campaignIds.length > 0
        ? await supabase.from('campaigns').select('id, title').in('id', campaignIds)
        : { data: [] };

      let likedPostIds = new Set<string>();
      if (user) {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);
        likedPostIds = new Set(likes?.map(l => l.post_id) || []);
      }

      return posts.map(post => ({
        ...post,
        profile: profiles?.find(p => p.id === post.user_id),
        campaign: campaigns?.find(c => c.id === post.campaign_id) || null,
        user_liked: likedPostIds.has(post.id),
      })) as Post[];
    },
  });
}

export function usePost(postId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, green_points')
        .eq('id', post.user_id)
        .single();

      let campaign = null;
      if (post.campaign_id) {
        const { data: campaignData } = await supabase
          .from('campaigns')
          .select('id, title')
          .eq('id', post.campaign_id)
          .single();
        campaign = campaignData;
      }

      let userLiked = false;
      if (user) {
        const { data: like } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();
        userLiked = !!like;
      }

      return {
        ...post,
        profile,
        campaign,
        user_liked: userLiked,
      } as Post;
    },
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showReward } = useRewardNotification();

  return useMutation({
    mutationFn: async ({ 
      content, 
      imageFiles, 
      campaignId 
    }: { 
      content: string; 
      imageFiles?: File[]; 
      campaignId?: string;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập');

      // Upload all images
      const uploadedUrls: string[] = [];

      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue; // Skip failed uploads but continue with others
          }

          const { data: urlData } = supabase.storage
            .from('post-images')
            .getPublicUrl(fileName);

          uploadedUrls.push(urlData.publicUrl);
        }
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          // For backward compatibility: use image_url for single image, media_urls for multiple
          image_url: uploadedUrls.length === 1 ? uploadedUrls[0] : null,
          media_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
          campaign_id: campaignId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Award Camly Coins for creating post
      const { data: profile } = await supabase
        .from('profiles')
        .select('camly_balance, total_posts')
        .eq('id', user.id)
        .single();

      await supabase
        .from('profiles')
        .update({
          camly_balance: (profile?.camly_balance || 0) + CAMLY_REWARDS.CREATE_POST,
          total_posts: (profile?.total_posts || 0) + 1,
        })
        .eq('id', user.id);

      // Log to points history
      await supabase.from('points_history').insert({
        user_id: user.id,
        action_type: ACTION_TYPES.CREATE_POST,
        points_earned: 0,
        camly_equivalent: CAMLY_REWARDS.CREATE_POST,
        camly_earned: CAMLY_REWARDS.CREATE_POST,
        reference_id: data.id,
        reference_type: 'post',
        description: 'Posted about environment',
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['points-history'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      showReward(CAMLY_REWARDS.CREATE_POST, ACTION_TYPES.CREATE_POST, { showConfetti: true });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể đăng bài');
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Đã xóa bài viết');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể xóa bài viết');
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showReward, showLimitReached } = useRewardNotification();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Bạn cần đăng nhập');

      if (isLiked) {
        // Unlike - no reward change
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { postId, isLiked: false, rewarded: false };
      } else {
        // Like - check daily limit first
        const today = new Date().toISOString().split('T')[0];
        
        const { data: limitData } = await supabase
          .from('daily_limits')
          .select('*')
          .eq('user_id', user.id)
          .eq('limit_date', today)
          .maybeSingle();

        const currentLikes = limitData?.likes_count || 0;
        const canReward = currentLikes < DAILY_LIMITS.LIKES;

        // Insert like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;

        // Award if under limit
        if (canReward) {
          // Update or create daily limit
          if (limitData) {
            await supabase
              .from('daily_limits')
              .update({ likes_count: currentLikes + 1 })
              .eq('id', limitData.id);
          } else {
            await supabase
              .from('daily_limits')
              .insert({
                user_id: user.id,
                limit_date: today,
                likes_count: 1,
                shares_count: 0,
              });
          }

          // Award Camly Coins
          const { data: profile } = await supabase
            .from('profiles')
            .select('camly_balance, total_likes_given')
            .eq('id', user.id)
            .single();

          await supabase
            .from('profiles')
            .update({
              camly_balance: (profile?.camly_balance || 0) + CAMLY_REWARDS.LIKE_POST,
              total_likes_given: (profile?.total_likes_given || 0) + 1,
            })
            .eq('id', user.id);

          // Log to history
          await supabase.from('points_history').insert({
            user_id: user.id,
            action_type: ACTION_TYPES.LIKE_POST,
            points_earned: 0,
            camly_equivalent: CAMLY_REWARDS.LIKE_POST,
            camly_earned: CAMLY_REWARDS.LIKE_POST,
            reference_id: postId,
            reference_type: 'post',
            description: 'Liked a green post',
          });
        }

        return { 
          postId, 
          isLiked: true, 
          rewarded: canReward,
          currentCount: currentLikes + 1,
          maxCount: DAILY_LIMITS.LIKES
        };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['daily-limits'] });
      
      if (data.isLiked && data.rewarded) {
        showReward(CAMLY_REWARDS.LIKE_POST, ACTION_TYPES.LIKE_POST);
      } else if (data.isLiked && !data.rewarded) {
        showLimitReached('likes', data.currentCount || DAILY_LIMITS.LIKES, DAILY_LIMITS.LIKES);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể thực hiện');
    },
  });
}

export function useSharePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showReward, showLimitReached } = useRewardNotification();

  return useMutation({
    mutationFn: async ({ postId, shareType = 'copy' }: { postId: string; shareType?: 'copy' | 'twitter' | 'facebook' }) => {
      if (!user) throw new Error('Bạn cần đăng nhập');

      const today = new Date().toISOString().split('T')[0];
      
      // Check daily limit
      const { data: limitData } = await supabase
        .from('daily_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('limit_date', today)
        .maybeSingle();

      const currentShares = limitData?.shares_count || 0;
      const canReward = currentShares < DAILY_LIMITS.SHARES;

      if (canReward) {
        // Update or create daily limit
        if (limitData) {
          await supabase
            .from('daily_limits')
            .update({ shares_count: currentShares + 1 })
            .eq('id', limitData.id);
        } else {
          await supabase
            .from('daily_limits')
            .insert({
              user_id: user.id,
              limit_date: today,
              shares_count: 1,
              likes_count: 0,
            });
        }

        // Award Camly Coins
        const { data: profile } = await supabase
          .from('profiles')
          .select('camly_balance, total_shares')
          .eq('id', user.id)
          .single();

        await supabase
          .from('profiles')
          .update({
            camly_balance: (profile?.camly_balance || 0) + CAMLY_REWARDS.SHARE_POST,
            total_shares: (profile?.total_shares || 0) + 1,
          })
          .eq('id', user.id);

        // Log to history
        await supabase.from('points_history').insert({
          user_id: user.id,
          action_type: ACTION_TYPES.SHARE_POST,
          points_earned: 0,
          camly_equivalent: CAMLY_REWARDS.SHARE_POST,
          camly_earned: CAMLY_REWARDS.SHARE_POST,
          reference_id: postId,
          reference_type: 'post',
          description: `Shared a post (${shareType})`,
        });
      }

      return { 
        postId, 
        shareType,
        rewarded: canReward,
        currentCount: currentShares + 1,
        maxCount: DAILY_LIMITS.SHARES
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['daily-limits'] });
      queryClient.invalidateQueries({ queryKey: ['points-history'] });
      
      if (data.rewarded) {
        showReward(CAMLY_REWARDS.SHARE_POST, ACTION_TYPES.SHARE_POST, { showConfetti: true });
      } else {
        showLimitReached('shares', data.currentCount, DAILY_LIMITS.SHARES);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể chia sẻ');
    },
  });
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!comments) return [];

      const userIds = [...new Set(comments.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      return comments.map(comment => ({
        ...comment,
        profile: profiles?.find(p => p.id === comment.user_id),
      })) as PostComment[];
    },
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user) throw new Error('Bạn cần đăng nhập');

      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể bình luận');
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return { postId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Đã xóa bình luận');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể xóa bình luận');
    },
  });
}
