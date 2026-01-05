import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CAMLY_REWARDS, ACTION_TYPES, DAILY_LIMITS, REACTION_EMOJIS } from '@/lib/camlyCoin';

// Note: Using post_likes table as base, with reaction_type stored in a future migration
// For now, reactions work like enhanced likes

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ReactionCount {
  reaction_type: string;
  count: number;
}

// Get all reactions for a post (using likes as base)
export function usePostReactions(postId: string) {
  return useQuery({
    queryKey: ['post-reactions', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_likes')
        .select(`
          id,
          post_id,
          user_id,
          created_at,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId);

      if (error) throw error;

      // For now, all likes are treated as 'leaf' reactions
      const reactions = (data || []).map((like: any) => ({
        ...like,
        reaction_type: 'leaf',
      }));

      return {
        reactions: reactions as PostReaction[],
        counts: [{ reaction_type: 'leaf', count: reactions.length }] as ReactionCount[],
        total: reactions.length,
      };
    },
    enabled: !!postId,
  });
}

// Get current user's reaction on a post
export function useUserReaction(postId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-reaction', postId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return { ...data, reaction_type: 'leaf' };
      }
      return null;
    },
    enabled: !!postId && !!user,
  });
}

// Add or change reaction (using likes table)
export function useAddReaction() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: string; reactionType: string }) => {
      if (!user) throw new Error('Must be logged in');

      // Check if user already liked/reacted
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        // Remove existing like (toggle behavior)
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id);
        
        if (error) throw error;

        // Get current likes count and decrement
        const { data: post } = await supabase
          .from('posts')
          .select('likes_count')
          .eq('id', postId)
          .single();
        
        if (post) {
          await supabase
            .from('posts')
            .update({ likes_count: Math.max(0, (post.likes_count || 1) - 1) })
            .eq('id', postId);
        }
        
        return { action: 'removed', reactionType };
      }

      // Check daily limit
      const today = new Date().toISOString().split('T')[0];
      const { data: dailyLimit } = await supabase
        .from('daily_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('limit_date', today)
        .maybeSingle();

      const currentReactions = dailyLimit?.likes_count || 0;
      const canEarnReward = currentReactions < DAILY_LIMITS.REACTIONS;

      // Insert new like
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id,
        });

      if (insertError) throw insertError;

      // Get current likes count and increment
      const { data: postData } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();
      
      if (postData) {
        await supabase
          .from('posts')
          .update({ likes_count: (postData.likes_count || 0) + 1 })
          .eq('id', postId);
      }

      // Award Camly if within limit
      if (canEarnReward) {
        // Update daily limit
        if (dailyLimit) {
          await supabase
            .from('daily_limits')
            .update({ likes_count: currentReactions + 1 })
            .eq('id', dailyLimit.id);
        } else {
          await supabase
            .from('daily_limits')
            .insert({
              user_id: user.id,
              limit_date: today,
              likes_count: 1,
            });
        }

        // Log points history
        await supabase.from('points_history').insert({
          user_id: user.id,
          action_type: ACTION_TYPES.REACT_POST,
          camly_earned: CAMLY_REWARDS.REACT_POST,
          points_earned: 0,
          camly_equivalent: CAMLY_REWARDS.REACT_POST,
          reference_type: 'post',
          reference_id: postId,
          description: `Reacted with ${reactionType}`,
        });

        return { action: 'added', reactionType, rewarded: true, amount: CAMLY_REWARDS.REACT_POST };
      }

      return { action: 'added', reactionType, rewarded: false };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post-reactions', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['user-reaction', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      if (result.rewarded) {
        toast({
          title: `+${result.amount} 🪙`,
          description: 'Camly Coin earned!',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Could not add reaction',
        variant: 'destructive',
      });
    },
  });
}

// Remove reaction
export function useRemoveReaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post-reactions', postId] });
      queryClient.invalidateQueries({ queryKey: ['user-reaction', postId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

// Export reaction emojis for use in components
export { REACTION_EMOJIS };
