import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type GreenNft = Tables<'green_nfts'>;

export function useGreenNfts(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['green_nfts', targetUserId],
    queryFn: async () => {
      if (!targetUserId) throw new Error('No user ID provided');

      const { data, error } = await supabase
        .from('green_nfts')
        .select('*')
        .eq('user_id', targetUserId)
        .order('planted_at', { ascending: false });

      if (error) throw error;
      return data as GreenNft[];
    },
    enabled: !!targetUserId,
  });
}
