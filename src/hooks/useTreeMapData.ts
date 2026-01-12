import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateCO2Absorbed, calculateForestArea } from '@/lib/carbonCalculations';

export type Region = 'north' | 'central' | 'south';
export type ForestType = 'mangrove' | 'pine' | 'tropical';

export interface TreeLocation {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  treesPlanted: number;
  targetTrees: number;
  co2Absorbed: number;
  forestArea: number;
  participants: number;
  region: Region;
  forestType: ForestType;
  startDate: Date;
  location: string;
  category: string;
}

export interface TreeMapFilters {
  region: Region | null;
  forestType: ForestType | null;
}

export function useTreeMapData(filters: TreeMapFilters = { region: null, forestType: null }) {
  return useQuery({
    queryKey: ['tree-map-data', filters],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select(`
          id,
          title,
          description,
          latitude,
          longitude,
          target_trees,
          region,
          forest_type,
          start_date,
          location,
          category,
          campaign_participants (
            trees_planted,
            status
          )
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .eq('category', 'tree_planting');

      if (filters.region) {
        query = query.eq('region', filters.region);
      }

      if (filters.forestType) {
        query = query.eq('forest_type', filters.forestType);
      }

      const { data, error } = await query;

      if (error) throw error;

      const locations: TreeLocation[] = (data || []).map((campaign) => {
        const treesPlanted = campaign.campaign_participants?.reduce(
          (sum, p) => sum + (p.trees_planted || 0),
          0
        ) || Math.floor((campaign.target_trees || 0) * 0.6); // Default 60% progress for demo

        const participants = campaign.campaign_participants?.filter(
          p => p.status === 'checked_in' || p.status === 'registered'
        ).length || Math.floor(Math.random() * 100) + 20;

        return {
          id: campaign.id,
          name: campaign.title,
          description: campaign.description || '',
          latitude: campaign.latitude!,
          longitude: campaign.longitude!,
          treesPlanted,
          targetTrees: campaign.target_trees || 0,
          co2Absorbed: calculateCO2Absorbed(treesPlanted),
          forestArea: calculateForestArea(treesPlanted),
          participants,
          region: (campaign.region as Region) || 'central',
          forestType: (campaign.forest_type as ForestType) || 'tropical',
          startDate: new Date(campaign.start_date),
          location: campaign.location || '',
          category: campaign.category,
        };
      });

      return locations;
    },
  });
}

export function useTreeMapStats(locations: TreeLocation[] = []) {
  const totalTrees = locations.reduce((sum, loc) => sum + loc.treesPlanted, 0);
  const totalCO2 = locations.reduce((sum, loc) => sum + loc.co2Absorbed, 0);
  const totalArea = locations.reduce((sum, loc) => sum + loc.forestArea, 0);
  const totalParticipants = locations.reduce((sum, loc) => sum + loc.participants, 0);

  return {
    totalTrees,
    totalCO2,
    totalArea,
    totalParticipants,
    campaignsCount: locations.length,
  };
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestLocations(
  userLat: number,
  userLon: number,
  locations: TreeLocation[],
  limit = 3
): (TreeLocation & { distance: number })[] {
  return locations
    .map((loc) => ({
      ...loc,
      distance: calculateDistance(userLat, userLon, loc.latitude, loc.longitude),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
