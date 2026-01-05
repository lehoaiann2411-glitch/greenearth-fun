import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calculateCO2Absorbed, calculateForestArea } from '@/lib/carbonCalculations';

interface GlobalStats {
  totalTrees: number;
  totalCO2: number;
  totalForestArea: number;
  totalUsers: number;
  totalCampaigns: number;
  totalNFTs: number;
}

interface PersonalStats {
  treesPlanted: number;
  co2Absorbed: number;
  forestArea: number;
  greenPoints: number;
  campaignsJoined: number;
  nftsOwned: number;
  greenReputation: number;
}

export function useGlobalStats() {
  return useQuery({
    queryKey: ['global-stats'],
    queryFn: async () => {
      // Get total trees from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('trees_planted');

      if (profilesError) throw profilesError;

      const totalTrees = profiles?.reduce((sum, p) => sum + (p.trees_planted || 0), 0) || 0;

      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total campaigns
      const { count: totalCampaigns } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total NFTs
      const { count: totalNFTs } = await supabase
        .from('green_nfts')
        .select('*', { count: 'exact', head: true });

      const stats: GlobalStats = {
        totalTrees,
        totalCO2: calculateCO2Absorbed(totalTrees),
        totalForestArea: calculateForestArea(totalTrees),
        totalUsers: totalUsers || 0,
        totalCampaigns: totalCampaigns || 0,
        totalNFTs: totalNFTs || 0,
      };

      return stats;
    },
    staleTime: 60000, // Cache for 1 minute
  });
}

export function usePersonalStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personal-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('trees_planted, green_points, campaigns_joined, green_reputation')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get NFT count
      const { count: nftsOwned } = await supabase
        .from('green_nfts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const stats: PersonalStats = {
        treesPlanted: profile?.trees_planted || 0,
        co2Absorbed: calculateCO2Absorbed(profile?.trees_planted || 0),
        forestArea: calculateForestArea(profile?.trees_planted || 0),
        greenPoints: profile?.green_points || 0,
        campaignsJoined: profile?.campaigns_joined || 0,
        nftsOwned: nftsOwned || 0,
        greenReputation: profile?.green_reputation || 0,
      };

      return stats;
    },
    enabled: !!user,
  });
}

export function useTreeLocations() {
  return useQuery({
    queryKey: ['tree-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('green_nfts')
        .select('id, tree_type, latitude, longitude, location, planted_at, verified')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;
      return data;
    },
  });
}
