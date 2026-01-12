import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ForestArea {
  id: string;
  campaign_id?: string;
  name: string;
  coordinates: [number, number][];
  area_hectares: number;
  forest_type?: string;
  trees_count: number;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

export interface CreateForestAreaInput {
  campaign_id?: string;
  name: string;
  coordinates: [number, number][];
  area_hectares: number;
  forest_type?: string;
  trees_count?: number;
}

export function useForestAreas() {
  return useQuery({
    queryKey: ['forest-areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_areas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        coordinates: item.coordinates as [number, number][],
        area_hectares: Number(item.area_hectares),
        trees_count: item.trees_count || 0
      })) as ForestArea[];
    }
  });
}

export function useForestAreasByCampaign(campaignId: string) {
  return useQuery({
    queryKey: ['forest-areas', 'campaign', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_areas')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        coordinates: item.coordinates as [number, number][],
        area_hectares: Number(item.area_hectares),
        trees_count: item.trees_count || 0
      })) as ForestArea[];
    },
    enabled: !!campaignId
  });
}

export function useCreateForestArea() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateForestAreaInput) => {
      const { data, error } = await supabase
        .from('forest_areas')
        .insert({
          ...input,
          coordinates: input.coordinates as unknown as never,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-areas'] });
    }
  });
}

export function useUpdateForestArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ForestArea> & { id: string }) => {
      const { data, error } = await supabase
        .from('forest_areas')
        .update({
          ...input,
          coordinates: input.coordinates as unknown as never
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-areas'] });
    }
  });
}

export function useDeleteForestArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('forest_areas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-areas'] });
    }
  });
}

// Calculate area in hectares using Shoelace formula
export function calculatePolygonArea(coordinates: [number, number][]): number {
  if (coordinates.length < 3) return 0;

  let area = 0;
  const n = coordinates.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    // coordinates are [lng, lat]
    const xi = coordinates[i][0];
    const yi = coordinates[i][1];
    const xj = coordinates[j][0];
    const yj = coordinates[j][1];
    
    area += xi * yj;
    area -= xj * yi;
  }

  area = Math.abs(area) / 2;
  
  // Convert to hectares (approximate for small areas)
  // 1 degree ≈ 111km at equator, so 1 sq degree ≈ 12321 sq km
  // Vietnam is around 10-23°N, so we use average factor
  const degToKm = 111;
  const areaKm2 = area * degToKm * degToKm * Math.cos((coordinates[0][1] * Math.PI) / 180);
  const areaHectares = areaKm2 * 100; // 1 km² = 100 hectares

  return Math.round(areaHectares * 100) / 100;
}
