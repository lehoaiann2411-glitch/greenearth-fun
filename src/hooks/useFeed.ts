import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FeedPost {
  id: string;
  content: string;
  image_url: string | null;
  media_urls: string[] | null;
  post_type: string;
  location_name: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  campaign_id: string | null;
  user_id: string;
  visibility: string;
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  campaign?: {
    id: string;
    title: string;
    category: string;
  } | null;
  has_liked?: boolean;
}

const POSTS_PER_PAGE = 10;

export function useFeed(filter: 'all' | 'following' | 'popular' | 'campaigns' = 'all') {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['feed', filter, user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      // Fetch posts
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1);

      if (error) throw error;
      if (!posts || posts.length === 0) {
        return { posts: [] as FeedPost[], nextPage: undefined };
      }

      // Fetch related data
      const userIds = [...new Set(posts.map(p => p.user_id))];
      const campaignIds = [...new Set(posts.filter(p => p.campaign_id).map(p => p.campaign_id!))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const { data: campaigns } = campaignIds.length > 0
        ? await supabase.from('campaigns').select('id, title, category').in('id', campaignIds)
        : { data: [] };

      // Check which posts user has liked
      let likedPostIds = new Set<string>();
      if (user) {
        const postIds = posts.map(p => p.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        likedPostIds = new Set(likes?.map(l => l.post_id) || []);
      }

      // Build feed posts with related data
      let feedPosts: FeedPost[] = posts.map(post => ({
        id: post.id,
        content: post.content,
        image_url: post.image_url,
        media_urls: (post as any).media_urls || null,
        post_type: (post as any).post_type || 'text',
        location_name: (post as any).location_name || null,
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        shares_count: (post as any).shares_count || 0,
        created_at: post.created_at,
        campaign_id: post.campaign_id,
        user_id: post.user_id,
        visibility: (post as any).visibility || 'public',
        user: profiles?.find(p => p.id === post.user_id) || { id: post.user_id, full_name: null, avatar_url: null },
        campaign: campaigns?.find(c => c.id === post.campaign_id) || null,
        has_liked: likedPostIds.has(post.id),
      }));

      // Filter by following if needed
      if (filter === 'following' && user) {
        const { data: following } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const followingIds = new Set(following?.map(f => f.following_id) || []);
        followingIds.add(user.id); // Include own posts
        
        feedPosts = feedPosts.filter(post => followingIds.has(post.user_id));
      }

      // Filter by campaigns if needed
      if (filter === 'campaigns') {
        feedPosts = feedPosts.filter(post => post.campaign_id);
      }

      return {
        posts: feedPosts,
        nextPage: posts.length === POSTS_PER_PAGE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

export function useTrendingPosts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trending-posts', user?.id],
    queryFn: async () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          likes_count,
          comments_count,
          shares_count,
          created_at,
          user:profiles!posts_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('visibility', 'public')
        .gte('created_at', oneDayAgo.toISOString())
        .order('likes_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });
}
