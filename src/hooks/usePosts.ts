import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
      // Get posts
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!posts) return [];

      // Get unique user_ids and campaign_ids
      const userIds = [...new Set(posts.map(p => p.user_id))];
      const campaignIds = [...new Set(posts.filter(p => p.campaign_id).map(p => p.campaign_id!))] ;

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, green_points')
        .in('id', userIds);

      // Fetch campaigns
      const { data: campaigns } = campaignIds.length > 0
        ? await supabase.from('campaigns').select('id, title').in('id', campaignIds)
        : { data: [] };

      // Check user likes
      let likedPostIds = new Set<string>();
      if (user) {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);
        likedPostIds = new Set(likes?.map(l => l.post_id) || []);
      }

      // Map posts with related data
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

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, green_points')
        .eq('id', post.user_id)
        .single();

      // Fetch campaign if exists
      let campaign = null;
      if (post.campaign_id) {
        const { data: campaignData } = await supabase
          .from('campaigns')
          .select('id, title')
          .eq('id', post.campaign_id)
          .single();
        campaign = campaignData;
      }

      // Check if current user liked this post
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

  return useMutation({
    mutationFn: async ({ 
      content, 
      imageFile, 
      campaignId 
    }: { 
      content: string; 
      imageFile?: File; 
      campaignId?: string;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập');

      let imageUrl: string | null = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          image_url: imageUrl,
          campaign_id: campaignId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Đăng bài thành công! +5 điểm xanh');
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

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Bạn cần đăng nhập');

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;
      }

      return { postId, isLiked: !isLiked };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể thực hiện');
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

      // Fetch profiles for comments
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
