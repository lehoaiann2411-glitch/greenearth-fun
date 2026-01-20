import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CAMLY_REWARDS, DAILY_LIMITS, ACTION_TYPES } from '@/lib/camlyCoin';
import { useToast } from '@/hooks/use-toast';

export interface Reel {
  id: string;
  user_id: string;
  video_url: string;
  image_url: string | null;
  media_type: 'video' | 'image';
  thumbnail_url: string | null;
  caption: string | null;
  hashtags: string[] | null;
  location_name: string | null;
  tagged_friends: string[] | null;
  music_name: string | null;
  music_url: string | null;
  duration_seconds: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_featured: boolean;
  is_trending: boolean;
  camly_earned: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  user_has_liked?: boolean;
}

export interface ReelComment {
  id: string;
  reel_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  likes_count: number;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Reel rewards constants
export const REEL_REWARDS = {
  LIKE: 100,
  COMMENT: 200,
  SHARE: 200,  // +200 Camly Coin for sharing green vibes!
  CREATE: 5000,
  VIEWS_1000: 1000,
  TOP_WEEKLY: 10000,
};

export const REEL_DAILY_LIMITS = {
  LIKES: 50,
  COMMENTS: 30,
  SHARES: 10,
};

// Trending hashtags
export const TRENDING_HASHTAGS = [
  '#SongXanh',
  '#TrongCayVN',
  '#ZeroWaste',
  '#30NgaySongXanh',
  '#EcoLifestyle',
  '#GreenEarth',
  '#PlantATree',
  '#SustainableLiving',
  '#ClimateAction',
  '#RecycleVietnam',
];

// Eco stickers for reels
export const REEL_STICKERS = [
  { id: 'tree', emoji: '🌳', label: 'Tree' },
  { id: 'leaf', emoji: '🍃', label: 'Leaf' },
  { id: 'earth', emoji: '🌍', label: 'Earth' },
  { id: 'plant', emoji: '🌱', label: 'Plant' },
  { id: 'recycle', emoji: '♻️', label: 'Recycle' },
  { id: 'sun', emoji: '☀️', label: 'Sun' },
  { id: 'water', emoji: '💧', label: 'Water' },
  { id: 'flower', emoji: '🌸', label: 'Flower' },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow' },
  { id: 'butterfly', emoji: '🦋', label: 'Butterfly' },
];

// Fetch reels feed with infinite scroll
export function useReelsFeed() {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['reels-feed'],
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 10;
      
      const { data: reels, error } = await supabase
        .from('reels')
        .select(`
          *,
          profiles:user_id (id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

      if (error) throw error;

      // Check if user has liked each reel
      if (user?.id && reels && reels.length > 0) {
        const reelIds = reels.map(r => r.id);
        const { data: likes } = await supabase
          .from('reel_likes')
          .select('reel_id')
          .eq('user_id', user.id)
          .in('reel_id', reelIds);

        const likedReelIds = new Set(likes?.map(l => l.reel_id) || []);
        return reels.map(reel => ({
          ...reel,
          user_has_liked: likedReelIds.has(reel.id),
        })) as Reel[];
      }

      return (reels || []) as Reel[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });
}

// Fetch user's reels
export function useUserReels(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-reels', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('reels')
        .select(`
          *,
          profiles:user_id (id, full_name, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Reel[];
    },
    enabled: !!userId,
  });
}

// Fetch single reel
export function useReel(reelId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reel', reelId],
    queryFn: async () => {
      if (!reelId) return null;

      const { data, error } = await supabase
        .from('reels')
        .select(`
          *,
          profiles:user_id (id, full_name, avatar_url)
        `)
        .eq('id', reelId)
        .single();

      if (error) throw error;

      // Check if user has liked
      if (user?.id) {
        const { data: like } = await supabase
          .from('reel_likes')
          .select('id')
          .eq('reel_id', reelId)
          .eq('user_id', user.id)
          .maybeSingle();

        return { ...data, user_has_liked: !!like } as Reel;
      }

      return data as Reel;
    },
    enabled: !!reelId,
  });
}

// Create a new reel
export function useCreateReel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      mediaFile,
      mediaType,
      caption,
      hashtags,
      locationName,
      taggedFriends,
      musicName,
      durationSeconds,
    }: {
      mediaFile: File;
      mediaType: 'video' | 'image';
      caption?: string;
      hashtags?: string[];
      locationName?: string;
      taggedFriends?: string[];
      musicName?: string;
      durationSeconds: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Determine bucket based on media type
      const bucket = mediaType === 'video' ? 'reels' : 'reel-images';
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, mediaFile, { cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Create reel record
      const { data, error } = await supabase
        .from('reels')
        .insert({
          user_id: user.id,
          video_url: mediaType === 'video' ? publicUrl : null,
          image_url: mediaType === 'image' ? publicUrl : null,
          media_type: mediaType,
          caption,
          hashtags,
          location_name: locationName,
          tagged_friends: taggedFriends,
          music_name: musicName,
          duration_seconds: durationSeconds,
          camly_earned: REEL_REWARDS.CREATE,
        })
        .select()
        .single();

      if (error) throw error;

      // Award Camly Coins to creator - use direct update instead of RPC
      const { data: profileData } = await supabase
        .from('profiles')
        .select('camly_balance')
        .eq('id', user.id)
        .single();

      await supabase
        .from('profiles')
        .update({ camly_balance: (profileData?.camly_balance || 0) + REEL_REWARDS.CREATE })
        .eq('id', user.id);

      // Record in points history
      await supabase.from('points_history').insert({
        user_id: user.id,
        action_type: 'reel_create',
        points_earned: REEL_REWARDS.CREATE,
        camly_equivalent: REEL_REWARDS.CREATE,
        reference_id: data.id,
        reference_type: 'reel',
        description: 'Created a new reel',
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels-feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-reels'] });
      toast({
        title: 'Reel đã đăng!',
        description: `+${REEL_REWARDS.CREATE.toLocaleString()} Camly Coin 🪙`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Không thể đăng reel. Vui lòng thử lại.',
        variant: 'destructive',
      });
      console.error('Create reel error:', error);
    },
  });
}

// Like/unlike a reel
export function useLikeReel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reelId, isLiked }: { reelId: string; isLiked: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('reel_likes')
          .delete()
          .eq('reel_id', reelId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { action: 'unliked' };
      } else {
        // Check daily limit
        const today = new Date().toISOString().split('T')[0];
        const { data: limits } = await supabase
          .from('daily_limits')
          .select('reel_likes_count')
          .eq('user_id', user.id)
          .eq('limit_date', today)
          .maybeSingle();

        const currentCount = limits?.reel_likes_count || 0;
        const canEarn = currentCount < REEL_DAILY_LIMITS.LIKES;

        // Like
        const { error } = await supabase
          .from('reel_likes')
          .insert({
            reel_id: reelId,
            user_id: user.id,
            camly_earned: canEarn ? REEL_REWARDS.LIKE : 0,
          });

        if (error) throw error;

        // Update daily limits
        if (limits) {
          await supabase
            .from('daily_limits')
            .update({ reel_likes_count: currentCount + 1 })
            .eq('user_id', user.id)
            .eq('limit_date', today);
        } else {
          await supabase.from('daily_limits').insert({
            user_id: user.id,
            limit_date: today,
            reel_likes_count: 1,
          });
        }

        // Award Camly if within limit
        if (canEarn) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('camly_balance')
            .eq('id', user.id)
            .single();

          await supabase
            .from('profiles')
            .update({ camly_balance: (profile?.camly_balance || 0) + REEL_REWARDS.LIKE })
            .eq('id', user.id);
        }

        return { action: 'liked', earned: canEarn ? REEL_REWARDS.LIKE : 0 };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reels-feed'] });
      queryClient.invalidateQueries({ queryKey: ['reel'] });
      
      if (data.action === 'liked' && data.earned && data.earned > 0) {
        toast({
          title: 'Đã thích!',
          description: `+${data.earned} Camly Coin 🪙`,
        });
      }
    },
  });
}

// Comment on a reel
export function useCommentOnReel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      reelId,
      content,
      parentId,
    }: {
      reelId: string;
      content: string;
      parentId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check daily limit
      const today = new Date().toISOString().split('T')[0];
      const { data: limits } = await supabase
        .from('daily_limits')
        .select('reel_comments_count')
        .eq('user_id', user.id)
        .eq('limit_date', today)
        .maybeSingle();

      const currentCount = limits?.reel_comments_count || 0;
      const canEarn = currentCount < REEL_DAILY_LIMITS.COMMENTS;

      const { data, error } = await supabase
        .from('reel_comments')
        .insert({
          reel_id: reelId,
          user_id: user.id,
          content,
          parent_id: parentId,
          camly_earned: canEarn ? REEL_REWARDS.COMMENT : 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Update daily limits
      if (limits) {
        await supabase
          .from('daily_limits')
          .update({ reel_comments_count: currentCount + 1 })
          .eq('user_id', user.id)
          .eq('limit_date', today);
      } else {
        await supabase.from('daily_limits').insert({
          user_id: user.id,
          limit_date: today,
          reel_comments_count: 1,
        });
      }

      // Award Camly if within limit
      if (canEarn) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('camly_balance')
          .eq('id', user.id)
          .single();

        await supabase
          .from('profiles')
          .update({ camly_balance: (profile?.camly_balance || 0) + REEL_REWARDS.COMMENT })
          .eq('id', user.id);
      }

      return { data, earned: canEarn ? REEL_REWARDS.COMMENT : 0 };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['reel-comments'] });
      queryClient.invalidateQueries({ queryKey: ['reel'] });
      
      if (result.earned > 0) {
        toast({
          title: 'Đã bình luận!',
          description: `+${result.earned} Camly Coin 🪙`,
        });
      }
    },
  });
}

// Fetch reel comments
export function useReelComments(reelId: string | undefined) {
  return useQuery({
    queryKey: ['reel-comments', reelId],
    queryFn: async () => {
      if (!reelId) return [];

      const { data, error } = await supabase
        .from('reel_comments')
        .select(`
          *,
          profiles:user_id (id, full_name, avatar_url)
        `)
        .eq('reel_id', reelId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as ReelComment[];
    },
    enabled: !!reelId,
  });
}

// Record reel view
export function useRecordReelView() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ reelId, watchedSeconds }: { reelId: string; watchedSeconds: number }) => {
      if (!user?.id) return null;

      const { error } = await supabase
        .from('reel_views')
        .upsert({
          reel_id: reelId,
          viewer_id: user.id,
          watched_seconds: watchedSeconds,
        }, {
          onConflict: 'reel_id,viewer_id',
        });

      if (error && !error.message.includes('duplicate')) throw error;
      return { success: true };
    },
  });
}

// Share a reel
export function useShareReel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reelId }: { reelId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check daily limit
      const today = new Date().toISOString().split('T')[0];
      const { data: limits } = await supabase
        .from('daily_limits')
        .select('reel_shares_count')
        .eq('user_id', user.id)
        .eq('limit_date', today)
        .maybeSingle();

      const currentCount = limits?.reel_shares_count || 0;
      const canEarn = currentCount < REEL_DAILY_LIMITS.SHARES;

      const { error } = await supabase
        .from('reel_shares')
        .insert({
          reel_id: reelId,
          user_id: user.id,
          camly_earned: canEarn ? REEL_REWARDS.SHARE : 0,
        });

      if (error) throw error;

      // Update daily limits
      if (limits) {
        await supabase
          .from('daily_limits')
          .update({ reel_shares_count: currentCount + 1 })
          .eq('user_id', user.id)
          .eq('limit_date', today);
      } else {
        await supabase.from('daily_limits').insert({
          user_id: user.id,
          limit_date: today,
          reel_shares_count: 1,
        });
      }

      // Award Camly if within limit
      if (canEarn) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('camly_balance')
          .eq('id', user.id)
          .single();

        await supabase
          .from('profiles')
          .update({ camly_balance: (profile?.camly_balance || 0) + REEL_REWARDS.SHARE })
          .eq('id', user.id);
      }

      return { earned: canEarn ? REEL_REWARDS.SHARE : 0 };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['reels-feed'] });
      
      if (result.earned > 0) {
        toast({
          title: 'Đã chia sẻ!',
          description: `+${result.earned} Camly Coin 🪙`,
        });
      }
    },
  });
}

// Gift Camly to reel creator
export function useGiftCamly() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reelId, receiverId, amount }: { reelId: string; receiverId: string; amount: number }) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (user.id === receiverId) throw new Error('Cannot gift to yourself');

      // Check sender balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('camly_balance')
        .eq('id', user.id)
        .single();

      if (!profile || (profile.camly_balance || 0) < amount) {
        throw new Error('Insufficient balance');
      }

      // Record gift
      const { error: giftError } = await supabase
        .from('reel_gifts')
        .insert({
          reel_id: reelId,
          sender_id: user.id,
          receiver_id: receiverId,
          amount,
        });

      if (giftError) throw giftError;

      // Deduct from sender
      await supabase
        .from('profiles')
        .update({ camly_balance: (profile.camly_balance || 0) - amount })
        .eq('id', user.id);

      // Add to receiver
      const { data: receiverProfile } = await supabase
        .from('profiles')
        .select('camly_balance')
        .eq('id', receiverId)
        .single();

      await supabase
        .from('profiles')
        .update({ camly_balance: (receiverProfile?.camly_balance || 0) + amount })
        .eq('id', receiverId);

      return { success: true, amount };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Đã tặng Camly!',
        description: `Bạn đã tặng ${result.amount.toLocaleString()} Camly Coin 🪙`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message === 'Insufficient balance' 
          ? 'Số dư không đủ' 
          : 'Không thể tặng Camly. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
  });
}

// Fetch trending reels
export function useTrendingReels() {
  return useQuery({
    queryKey: ['trending-reels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reels')
        .select(`
          *,
          profiles:user_id (id, full_name, avatar_url)
        `)
        .eq('is_trending', true)
        .order('views_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as Reel[];
    },
  });
}

// Fetch discover reels (for discover tab)
export function useDiscoverReels() {
  return useQuery({
    queryKey: ['discover-reels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reels')
        .select(`
          *,
          profiles:user_id (id, full_name, avatar_url)
        `)
        .order('likes_count', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as Reel[];
    },
  });
}
