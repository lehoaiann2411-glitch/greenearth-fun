import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useUploadProfileMedia() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      if (!user) throw new Error('Not authenticated');

      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('post-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);
      }

      // Create a post with the uploaded media
      const isMultiple = uploadedUrls.length > 1;
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: '📷',
          image_url: isMultiple ? null : uploadedUrls[0],
          media_urls: isMultiple ? uploadedUrls : null,
        });

      if (postError) throw postError;

      return uploadedUrls;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-media'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      toast.success('Tải lên thành công!');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Lỗi khi tải lên');
    },
  });
}
