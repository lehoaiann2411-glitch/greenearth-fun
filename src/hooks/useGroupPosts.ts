import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CAMLY_REWARDS, ACTION_TYPES } from '@/lib/camlyCoin';

export interface GroupPost {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  feeling: string | null;
  is_pinned: boolean;
  is_announcement: boolean;
  likes_count: number;
  comments_count: number;
  camly_earned: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  is_liked?: boolean;
}

export interface GroupPostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  likes_count: number;
  created_at: string;
  author?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const PAGE_SIZE = 10;

// Fetch group posts with infinite scroll
export function useGroupPosts(groupId: string) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['group-posts', groupId],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: posts, error } = await supabase
        .from('group_posts')
        .select(`
          *,
          author:profiles!group_posts_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Check if user liked each post
      if (user && posts.length > 0) {
        const postIds = posts.map(p => p.id);
        const { data: likes } = await supabase
          .from('group_post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
        return posts.map(p => ({ ...p, is_liked: likedPostIds.has(p.id) })) as GroupPost[];
      }

      return posts as GroupPost[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!groupId,
  });
}

// Create group post
export function useCreateGroupPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postData: {
      group_id: string;
      content: string;
      media_urls?: string[];
      feeling?: string;
      is_announcement?: boolean;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const hasImage = postData.media_urls && postData.media_urls.length > 0;
      const reward = hasImage ? CAMLY_REWARDS.GROUP_POST_WITH_IMAGE : CAMLY_REWARDS.GROUP_POST;

      const { data, error } = await supabase
        .from('group_posts')
        .insert({
          ...postData,
          user_id: user.id,
          camly_earned: reward,
        })
        .select(`
          *,
          author:profiles!group_posts_user_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Award Camly Coin
      await supabase.from('points_history').insert({
        user_id: user.id,
        action_type: hasImage ? ACTION_TYPES.GROUP_POST_WITH_IMAGE : ACTION_TYPES.GROUP_POST,
        points_earned: reward,
        camly_equivalent: reward,
        camly_earned: reward,
        description: 'Posted in group',
        reference_type: 'group_post',
        reference_id: data.id,
      });

      return { post: data, reward };
    },
    onSuccess: ({ reward }, { group_id }) => {
      queryClient.invalidateQueries({ queryKey: ['group-posts', group_id] });
      queryClient.invalidateQueries({ queryKey: ['group', group_id] });
      toast.success(`+${reward.toLocaleString()} Camly - Đã đăng bài trong nhóm!`);
    },
    onError: (error) => {
      toast.error('Failed to create post');
      console.error(error);
    },
  });
}

// Like group post
export function useLikeGroupPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, groupId }: { postId: string; groupId: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('group_post_likes')
        .insert({
          post_id: postId,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
    },
  });
}

// Unlike group post
export function useUnlikeGroupPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, groupId }: { postId: string; groupId: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('group_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
    },
  });
}

// Pin/unpin post (admin only)
export function usePinGroupPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, groupId, isPinned }: { postId: string; groupId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from('group_posts')
        .update({ is_pinned: isPinned })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: (_, { groupId, isPinned }) => {
      queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
      toast.success(isPinned ? 'Đã ghim bài viết' : 'Đã bỏ ghim bài viết');
    },
  });
}

// Delete group post
export function useDeleteGroupPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, groupId }: { postId: string; groupId: string }) => {
      const { error } = await supabase
        .from('group_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      toast.success('Đã xóa bài viết');
    },
  });
}

// Fetch post comments
export function useGroupPostComments(postId: string) {
  return useQuery({
    queryKey: ['group-post-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_post_comments')
        .select(`
          *,
          author:profiles!group_post_comments_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as GroupPostComment[];
    },
    enabled: !!postId,
  });
}

// Create comment
export function useCreateGroupComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('group_post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_id: parentId,
        })
        .select(`
          *,
          author:profiles!group_post_comments_user_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['group-post-comments', postId] });
    },
  });
}
