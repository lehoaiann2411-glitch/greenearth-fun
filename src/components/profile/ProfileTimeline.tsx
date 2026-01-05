import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PostCardEnhanced } from '@/components/social/PostCardEnhanced';
import { SharedPostCard } from '@/components/social/SharedPostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

interface ProfileTimelineProps {
  userId: string;
}

export function ProfileTimeline({ userId }: ProfileTimelineProps) {
  // Fetch user's posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user's shares
  const { data: shares, isLoading: sharesLoading } = useQuery({
    queryKey: ['user-shares', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_shares')
        .select('*')
        .eq('shared_by', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Get original posts
      const postIds = data.map(s => s.original_post_id);
      const { data: originalPosts } = await supabase
        .from('posts')
        .select('*')
        .in('id', postIds);

      // Get profiles
      const userIds = [...new Set(originalPosts?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      return data.map(share => ({
        ...share,
        type: 'share' as const,
        original_post: originalPosts?.find(p => p.id === share.original_post_id),
        original_author: profiles?.find(p => p.id === originalPosts?.find(op => op.id === share.original_post_id)?.user_id),
      }));
    },
  });

  // Fetch user profile for context
  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const isLoading = postsLoading || sharesLoading;

  // Combine and sort by date
  const timelineItems = [
    ...(posts?.map(p => ({ ...p, type: 'post' as const })) || []),
    ...(shares || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (timelineItems.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
        <p className="text-muted-foreground">When posts are created, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timelineItems.map((item) => {
        if (item.type === 'share') {
          return (
            <SharedPostCard
              key={`share-${item.id}`}
              share={item}
              sharer={profile}
            />
          );
        }

        return (
          <PostCardEnhanced
            key={`post-${item.id}`}
            post={{
              id: item.id,
              content: item.content,
              image_url: item.image_url,
              media_urls: item.media_urls,
              post_type: item.post_type || 'text',
              location_name: item.location_name,
              likes_count: item.likes_count,
              comments_count: item.comments_count,
              shares_count: item.shares_count || 0,
              created_at: item.created_at,
              campaign_id: item.campaign_id,
              user_id: item.user_id,
              user: profile || { id: userId, full_name: null, avatar_url: null },
              has_liked: false,
            }}
          />
        );
      })}
    </div>
  );
}
