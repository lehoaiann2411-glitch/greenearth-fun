import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  source: 'post' | 'story' | 'reel';
  thumbnail_url?: string;
  created_at: string;
  source_id: string;
}

export function useUserMedia(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-media', userId],
    queryFn: async (): Promise<UserMedia[]> => {
      if (!userId) return [];

      const allMedia: UserMedia[] = [];

      // Fetch from posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, image_url, media_urls, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (posts) {
        posts.forEach((post) => {
          // Add single image_url
          if (post.image_url) {
            allMedia.push({
              id: `post-${post.id}-main`,
              url: post.image_url,
              type: 'image',
              source: 'post',
              created_at: post.created_at,
              source_id: post.id,
            });
          }
          // Add media_urls array
          if (post.media_urls && Array.isArray(post.media_urls)) {
            post.media_urls.forEach((url: string, index: number) => {
              const isVideo = url.match(/\.(mp4|webm|mov|avi)$/i);
              allMedia.push({
                id: `post-${post.id}-${index}`,
                url: url,
                type: isVideo ? 'video' : 'image',
                source: 'post',
                created_at: post.created_at,
                source_id: post.id,
              });
            });
          }
        });
      }

      // Fetch from stories
      const { data: stories } = await supabase
        .from('stories')
        .select('id, media_url, media_type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (stories) {
        stories.forEach((story) => {
          if (story.media_url) {
            allMedia.push({
              id: `story-${story.id}`,
              url: story.media_url,
              type: story.media_type === 'video' ? 'video' : 'image',
              source: 'story',
              created_at: story.created_at,
              source_id: story.id,
            });
          }
        });
      }

      // Fetch from reels
      const { data: reels } = await supabase
        .from('reels')
        .select('id, video_url, thumbnail_url, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (reels) {
        reels.forEach((reel) => {
          if (reel.video_url) {
            allMedia.push({
              id: `reel-${reel.id}`,
              url: reel.video_url,
              type: 'video',
              source: 'reel',
              thumbnail_url: reel.thumbnail_url || undefined,
              created_at: reel.created_at || new Date().toISOString(),
              source_id: reel.id,
            });
          }
        });
      }

      // Sort by created_at (newest first)
      allMedia.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return allMedia;
    },
    enabled: !!userId,
  });
}
