import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WasteAnalysisResult {
  waste_type: string;
  waste_type_vi: string;
  material: string;
  material_vi: string;
  recyclable: boolean;
  bin_color: 'yellow' | 'blue' | 'black' | 'red';
  disposal_instructions: string;
  disposal_instructions_vi: string;
  reuse_suggestions: string[];
  reuse_suggestions_vi: string[];
  environmental_note: string;
  environmental_note_vi: string;
  confidence: number;
}

export interface WasteScan {
  id: string;
  user_id: string;
  image_url: string | null;
  waste_type: string;
  waste_type_vi: string | null;
  material: string | null;
  recyclable: boolean | null;
  bin_color: string;
  disposal_instructions: string | null;
  points_earned: number | null;
  scanned_at: string;
}

const SCAN_REWARD = 50;

export function useAnalyzeWaste() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeWaste = async (imageBase64: string): Promise<WasteAnalysisResult> => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-waste', {
        body: { image_base64: imageBase64 },
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze waste');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data as WasteAnalysisResult;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveScanResult = async (
    result: WasteAnalysisResult,
    imageUrl?: string
  ): Promise<WasteScan | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('waste_scans')
        .insert({
          user_id: user.id,
          image_url: imageUrl || null,
          waste_type: result.waste_type,
          waste_type_vi: result.waste_type_vi,
          material: result.material,
          recyclable: result.recyclable,
          bin_color: result.bin_color,
          disposal_instructions: result.disposal_instructions,
          disposal_instructions_vi: result.disposal_instructions_vi,
          reuse_suggestions: result.reuse_suggestions,
          environmental_note: result.environmental_note,
          environmental_note_vi: result.environmental_note_vi,
          points_earned: SCAN_REWARD,
        })
        .select('id, user_id, image_url, waste_type, waste_type_vi, material, recyclable, bin_color, disposal_instructions, points_earned, scanned_at')
        .single();

      if (error) {
        console.error('Error saving scan:', error);
        return null;
      }

      // Award Camly coins by incrementing the balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('camly_balance')
        .eq('id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            camly_balance: (profile.camly_balance || 0) + SCAN_REWARD,
          })
          .eq('id', user.id);
      }

      // Record in points history
      await supabase.from('points_history').insert({
        user_id: user.id,
        action_type: 'waste_scan',
        points_earned: SCAN_REWARD * 10,
        camly_equivalent: SCAN_REWARD,
        description: `Scanned: ${result.waste_type_vi || result.waste_type}`,
        reference_id: data.id,
        reference_type: 'waste_scan',
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['waste-scans'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast({
        title: `+${SCAN_REWARD} Camly! 🪙`,
        description: 'Cảm ơn bạn đã phân loại rác!',
      });

      return data as WasteScan;
    } catch (error) {
      console.error('Error saving scan result:', error);
      return null;
    }
  };

  return {
    analyzeWaste,
    saveScanResult,
    isAnalyzing,
  };
}

export function useWasteScanHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['waste-scans', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('waste_scans')
        .select('id, user_id, image_url, waste_type, waste_type_vi, material, recyclable, bin_color, disposal_instructions, points_earned, scanned_at')
        .eq('user_id', user.id)
        .order('scanned_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching scan history:', error);
        return [];
      }

      return data as WasteScan[];
    },
    enabled: !!user,
  });
}

export function useWasteScanStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['waste-scan-stats', user?.id],
    queryFn: async () => {
      if (!user) return { totalScans: 0, totalCamly: 0, uniqueTypes: 0 };

      const { data, error } = await supabase
        .from('waste_scans')
        .select('waste_type, points_earned')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching scan stats:', error);
        return { totalScans: 0, totalCamly: 0, uniqueTypes: 0 };
      }

      const uniqueTypes = new Set(data.map((s) => s.waste_type)).size;
      const totalCamly = data.reduce((sum, s) => sum + (s.points_earned || 0), 0);

      return {
        totalScans: data.length,
        totalCamly,
        uniqueTypes,
      };
    },
    enabled: !!user,
  });
}
