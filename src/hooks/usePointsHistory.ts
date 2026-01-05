import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toCamlyCoin, generateMockTransactionHash } from '@/lib/camlyCoin';

interface PointsHistoryItem {
  id: string;
  user_id: string;
  action_type: string;
  points_earned: number;
  camly_equivalent: number;
  camly_earned: number;
  reference_id: string | null;
  reference_type: string | null;
  description: string | null;
  created_at: string;
}

interface ClaimHistoryItem {
  id: string;
  user_id: string;
  green_points_converted: number;
  camly_received: number;
  transaction_hash: string | null;
  wallet_address: string | null;
  status: string;
  created_at: string;
}

export function usePointsHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['points-history', user?.id],
    queryFn: async (): Promise<PointsHistoryItem[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function useClaimsHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['claims-history', user?.id],
    queryFn: async (): Promise<ClaimHistoryItem[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('claims_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

interface LogPointsParams {
  actionType: string;
  pointsEarned: number;
  referenceId?: string;
  referenceType?: string;
  description?: string;
}

export function useLogPoints() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: LogPointsParams) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase.from('points_history').insert({
        user_id: user.id,
        action_type: params.actionType,
        points_earned: params.pointsEarned,
        camly_equivalent: toCamlyCoin(params.pointsEarned),
        reference_id: params.referenceId || null,
        reference_type: params.referenceType || null,
        description: params.description || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-history'] });
    },
  });
}

interface ClaimParams {
  pointsToConvert: number;
  walletAddress: string;
}

export function useClaimCamly() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pointsToConvert, walletAddress }: ClaimParams) => {
      if (!user?.id) throw new Error('User not authenticated');

      const camlyAmount = toCamlyCoin(pointsToConvert);
      const txHash = generateMockTransactionHash();

      // Deduct points from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('green_points, total_camly_claimed')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile || profile.green_points < pointsToConvert) {
        throw new Error('Insufficient points');
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          green_points: profile.green_points - pointsToConvert,
          total_camly_claimed: (profile.total_camly_claimed || 0) + camlyAmount,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log the claim
      const { error: claimError } = await supabase.from('claims_history').insert({
        user_id: user.id,
        green_points_converted: pointsToConvert,
        camly_received: camlyAmount,
        transaction_hash: txHash,
        wallet_address: walletAddress,
        status: 'completed',
      });

      if (claimError) throw claimError;

      return { txHash, camlyAmount, pointsConverted: pointsToConvert };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['claims-history'] });
    },
  });
}
