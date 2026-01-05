import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CAMLY_REWARDS, isGreenMessage } from '@/lib/camlyCoin';

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  views_count: number;
  reactions_count: number;
  replies_count: number;
  text_overlays: any[];
  stickers: any[];
  location_name: string | null;
  campaign_id: string | null;
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
        grouped.get(userId)!.stories.push({
          ...story,
          text_overlays: Array.isArray(story.text_overlays) ? story.text_overlays : [],
          stickers: Array.isArray(story.stickers) ? story.stickers : [],
          reactions_count: story.reactions_count || 0,
          replies_count: story.replies_count || 0,
        });
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
    refetchInterval: 60000,
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

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, file);

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Story uploads are not configured. Please contact admin.');
        }
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

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

      // Award Camly Coins (legacy - 1000)
      const camlyAmount = 1000;

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

// Enhanced create story with overlays
export function useCreateStoryEnhanced() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      file, 
      caption,
      text_overlays,
      stickers,
      location_name,
      campaign_id,
    }: { 
      file: File; 
      caption?: string;
      text_overlays?: any[];
      stickers?: any[];
      location_name?: string;
      campaign_id?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

      const { data: story, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: urlData.publicUrl,
          media_type: mediaType,
          caption: caption || null,
          text_overlays: text_overlays || [],
          stickers: stickers || [],
          location_name: location_name || null,
          campaign_id: campaign_id || null,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Award Camly Coins - 2000 for enhanced story
      const camlyAmount = CAMLY_REWARDS.CREATE_STORY;

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

// Story reactions
export function useStoryReaction(storyId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['story-reaction', storyId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('story_reactions')
        .select('*')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!storyId,
  });
}

export function useReactToStory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ storyId, reactionType }: { storyId: string; reactionType: string }) => {
      if (!user) throw new Error('Must be logged in');

      // Check if already reacted
      const { data: existing } = await supabase
        .from('story_reactions')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update reaction
        await supabase
          .from('story_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existing.id);
      } else {
        // Insert new reaction
        await supabase
          .from('story_reactions')
          .insert({
            story_id: storyId,
            user_id: user.id,
            reaction_type: reactionType,
          });

        // Award Camly Coins
        const camlyAmount = CAMLY_REWARDS.STORY_REACTION;
        
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
      }

      return { reactionType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-reaction'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Story replies
export function useReplyToStory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ storyId, content }: { storyId: string; content: string }) => {
      if (!user) throw new Error('Must be logged in');

      const isGreen = isGreenMessage(content);
      const camlyAmount = isGreen ? CAMLY_REWARDS.STORY_GREEN_REPLY : CAMLY_REWARDS.STORY_REPLY;

      const { error } = await supabase
        .from('story_replies')
        .insert({
          story_id: storyId,
          user_id: user.id,
          content,
          is_green_reply: isGreen,
          camly_earned: camlyAmount,
        });

      if (error) throw error;

      // Award Camly Coins
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
        action_type: isGreen ? 'story_green_reply' : 'story_reply',
        points_earned: 0,
        camly_equivalent: camlyAmount,
        camly_earned: camlyAmount,
        description: isGreen ? 'Sent a green reply' : 'Replied to a story',
        reference_id: storyId,
        reference_type: 'story',
      });

      return { camlyAmount, isGreen };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Story viewers list
export function useStoryViewers(storyId: string) {
  return useQuery({
    queryKey: ['story-viewers', storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_views')
        .select(`
          *,
          viewer:profiles!story_views_viewer_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('story_id', storyId)
        .order('viewed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!storyId,
  });
}
