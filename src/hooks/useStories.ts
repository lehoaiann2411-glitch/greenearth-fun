import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CAMLY_REWARDS } from '@/lib/camlyCoin';

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  views_count: number;
  created_at: string;
  expires_at: string;
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface GroupedStories {
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  stories: Story[];
  hasUnviewed: boolean;
}

export function useStories() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          user:profiles!stories_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group stories by user
      const grouped = new Map<string, GroupedStories>();
      
      for (const story of data || []) {
        const userId = story.user_id;
        if (!grouped.has(userId)) {
          grouped.set(userId, {
            user: story.user as any,
            stories: [],
            hasUnviewed: true,
          });
        }
        grouped.get(userId)!.stories.push(story);
      }

      // Put current user's stories first
      const result = Array.from(grouped.values());
      if (user) {
        const myIndex = result.findIndex(g => g.user.id === user.id);
        if (myIndex > 0) {
          const [myStories] = result.splice(myIndex, 1);
          result.unshift(myStories);
        }
      }

      return result;
    },
    refetchInterval: 60000, // Refetch every minute to handle expiring stories
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      file, 
      caption 
    }: { 
      file: File; 
      caption?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Upload media
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('stories')
        .upload(fileName, file);

      if (uploadError) {
        // If bucket doesn't exist, create it first
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Story uploads are not configured. Please contact admin.');
        }
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

      // Create story
      const { data: story, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: urlData.publicUrl,
          media_type: mediaType,
          caption: caption || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Award Camly Coins for creating story
      const camlyAmount = 1000; // Story reward

      // Get current balance and update
      const { data: profile } = await supabase
        .from('profiles')
        .select('camly_balance')
        .eq('id', user.id)
        .single();

      await supabase
        .from('profiles')
        .update({
          camly_balance: (profile?.camly_balance || 0) + camlyAmount,
        })
        .eq('id', user.id);

      await supabase.from('points_history').insert({
        user_id: user.id,
        action_type: 'story_create',
        points_earned: 0,
        camly_equivalent: camlyAmount,
        camly_earned: camlyAmount,
        description: 'Created a story',
        reference_id: story.id,
        reference_type: 'story',
      });

      return { story, camlyAmount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useViewStory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (storyId: string) => {
      if (!user) return;

      const { error } = await supabase
        .from('story_views')
        .insert({
          story_id: storyId,
          viewer_id: user.id,
        });

      // Ignore unique constraint errors (already viewed)
      if (error && !error.message.includes('duplicate')) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}
