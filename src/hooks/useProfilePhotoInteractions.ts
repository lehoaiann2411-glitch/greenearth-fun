import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type PhotoType = 'avatar' | 'cover';

interface ProfilePhotoLike {
  id: string;
  user_id: string;
  profile_id: string;
  photo_type: PhotoType;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ProfilePhotoComment {
  id: string;
  user_id: string;
  profile_id: string;
  photo_type: PhotoType;
  content: string;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useProfilePhotoLikes(profileId: string, photoType: PhotoType) {
  return useQuery({
    queryKey: ['profile-photo-likes', profileId, photoType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_photo_likes')
        .select('*')
        .eq('profile_id', profileId)
        .eq('photo_type', photoType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profile info separately
      const userIds = [...new Set(data.map(like => like.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(like => ({
        ...like,
        profiles: profileMap.get(like.user_id),
      })) as ProfilePhotoLike[];
    },
    enabled: !!profileId && !!photoType,
  });
}

export function useProfilePhotoComments(profileId: string, photoType: PhotoType) {
  return useQuery({
    queryKey: ['profile-photo-comments', profileId, photoType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_photo_comments')
        .select('*')
        .eq('profile_id', profileId)
        .eq('photo_type', photoType)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Fetch profile info separately
      const userIds = [...new Set(data.map(comment => comment.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(comment => ({
        ...comment,
        profiles: profileMap.get(comment.user_id),
      })) as ProfilePhotoComment[];
    },
    enabled: !!profileId && !!photoType,
  });
}

export function useLikeProfilePhoto() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ profileId, photoType }: { profileId: string; photoType: PhotoType }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check if already liked
      const { data: existing } = await supabase
        .from('profile_photo_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .eq('photo_type', photoType)
        .single();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from('profile_photo_likes')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        return { action: 'unliked' };
      } else {
        // Like
        const { error } = await supabase
          .from('profile_photo_likes')
          .insert({
            user_id: user.id,
            profile_id: profileId,
            photo_type: photoType,
          });
        
        if (error) throw error;
        return { action: 'liked' };
      }
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['profile-photo-likes', variables.profileId, variables.photoType] 
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể thực hiện thao tác. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
  });
}

export function useCreateProfilePhotoComment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      profileId, 
      photoType, 
      content 
    }: { 
      profileId: string; 
      photoType: PhotoType; 
      content: string 
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profile_photo_comments')
        .insert({
          user_id: user.id,
          profile_id: profileId,
          photo_type: photoType,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['profile-photo-comments', variables.profileId, variables.photoType] 
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi bình luận. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteProfilePhotoComment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      profileId, 
      photoType 
    }: { 
      commentId: string; 
      profileId: string; 
      photoType: PhotoType 
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profile_photo_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['profile-photo-comments', variables.profileId, variables.photoType] 
      });
      toast({
        title: 'Đã xóa',
        description: 'Bình luận đã được xóa.',
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa bình luận. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
  });
}

export function useHasLikedProfilePhoto(profileId: string, photoType: PhotoType) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile-photo-has-liked', profileId, photoType, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from('profile_photo_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .eq('photo_type', photoType)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!profileId && !!photoType && !!user?.id,
  });
}
