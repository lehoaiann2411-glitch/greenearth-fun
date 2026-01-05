import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type GreenNft = Tables<'green_nfts'>;
type GreenNftInsert = TablesInsert<'green_nfts'>;
type GreenNftUpdate = TablesUpdate<'green_nfts'>;

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

export function useGreenNft(nftId: string) {
  return useQuery({
    queryKey: ['green_nft', nftId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('green_nfts')
        .select('*')
        .eq('id', nftId)
        .single();

      if (error) throw error;
      return data as GreenNft;
    },
    enabled: !!nftId,
  });
}

export function useCreateGreenNft() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (nft: Omit<GreenNftInsert, 'user_id' | 'id' | 'created_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('green_nfts')
        .insert({
          ...nft,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Award Camly Coins for minting NFT
      const { error: pointsError } = await supabase
        .from('points_history')
        .insert({
          user_id: user.id,
          action_type: 'nft_mint',
          points_earned: 50,
          camly_equivalent: 5000,
          description: `Minted Green NFT: ${nft.tree_type}`,
          reference_type: 'green_nft',
          reference_id: data.id,
        });

      if (pointsError) console.error('Failed to award points:', pointsError);

      // Update profile camly_balance directly
      const { data: profile } = await supabase
        .from('profiles')
        .select('camly_balance')
        .eq('id', user.id)
        .single();

      const currentBalance = profile?.camly_balance || 0;
      await supabase
        .from('profiles')
        .update({ camly_balance: currentBalance + 5000 })
        .eq('id', user.id);

      return data as GreenNft;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['green_nfts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('🌳 NFT đã được tạo thành công! +5,000 Camly Coin');
    },
    onError: (error) => {
      toast.error('Không thể tạo NFT: ' + error.message);
    },
  });
}

export function useUpdateGreenNft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: GreenNftUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('green_nfts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as GreenNft;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['green_nfts'] });
      queryClient.invalidateQueries({ queryKey: ['green_nft', data.id] });
      toast.success('NFT đã được cập nhật!');
    },
    onError: (error) => {
      toast.error('Không thể cập nhật NFT: ' + error.message);
    },
  });
}

export function useDeleteGreenNft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nftId: string) => {
      const { error } = await supabase
        .from('green_nfts')
        .delete()
        .eq('id', nftId);

      if (error) throw error;
      return nftId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['green_nfts'] });
      toast.success('NFT đã được xóa!');
    },
    onError: (error) => {
      toast.error('Không thể xóa NFT: ' + error.message);
    },
  });
}
