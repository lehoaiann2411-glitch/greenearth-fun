import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type CampaignCategory = 'tree_planting' | 'cleanup' | 'recycling' | 'awareness' | 'other';
export type CampaignStatus = 'draft' | 'pending' | 'active' | 'completed' | 'cancelled';
export type ParticipantStatus = 'registered' | 'checked_in' | 'completed' | 'cancelled';

export interface Campaign {
  id: string;
  creator_id: string;
  organization_id: string | null;
  title: string;
  description: string | null;
  category: CampaignCategory;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  end_date: string;
  target_participants: number;
  target_trees: number | null;
  image_url: string | null;
  status: CampaignStatus;
  green_points_reward: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  participants_count?: number;
}

export interface CampaignParticipant {
  id: string;
  campaign_id: string;
  user_id: string;
  status: ParticipantStatus;
  registered_at: string;
  checked_in_at: string | null;
  trees_planted: number | null;
  notes: string | null;
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface CampaignFilters {
  category?: CampaignCategory;
  status?: CampaignStatus;
  search?: string;
  location?: string;
}

export const CATEGORY_LABELS: Record<CampaignCategory, string> = {
  tree_planting: 'Trồng cây',
  cleanup: 'Dọn dẹp',
  recycling: 'Tái chế',
  awareness: 'Nâng cao nhận thức',
  other: 'Khác',
};

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Nháp',
  pending: 'Chờ duyệt',
  active: 'Đang diễn ra',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          creator:profiles!campaigns_creator_id_fkey(id, full_name, avatar_url)
        `)
        .in('status', ['active', 'pending'])
        .order('start_date', { ascending: true });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get participant counts
      const campaignIds = data?.map(c => c.id) || [];
      if (campaignIds.length > 0) {
        const { data: participantCounts } = await supabase
          .from('campaign_participants')
          .select('campaign_id')
          .in('campaign_id', campaignIds)
          .neq('status', 'cancelled');

        const countMap: Record<string, number> = {};
        participantCounts?.forEach(p => {
          countMap[p.campaign_id] = (countMap[p.campaign_id] || 0) + 1;
        });

        return data?.map(campaign => ({
          ...campaign,
          participants_count: countMap[campaign.id] || 0,
        })) as Campaign[];
      }

      return data as Campaign[];
    },
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          creator:profiles!campaigns_creator_id_fkey(id, full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Get participant count
      const { count } = await supabase
        .from('campaign_participants')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', id)
        .neq('status', 'cancelled');

      return {
        ...data,
        participants_count: count || 0,
      } as Campaign;
    },
    enabled: !!id,
  });
}

export function useCampaignParticipants(campaignId: string) {
  return useQuery({
    queryKey: ['campaign-participants', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_participants')
        .select(`
          *,
          user:profiles!campaign_participants_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('campaign_id', campaignId)
        .neq('status', 'cancelled')
        .order('registered_at', { ascending: false });

      if (error) throw error;
      return data as CampaignParticipant[];
    },
    enabled: !!campaignId,
  });
}

export function useUserParticipation(campaignId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-participation', campaignId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('campaign_participants')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as CampaignParticipant | null;
    },
    enabled: !!campaignId && !!user,
  });
}

export function useMyCampaigns() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-campaigns', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user,
  });
}

export function useMyParticipations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-participations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('campaign_participants')
        .select(`
          *,
          campaign:campaigns(*)
        `)
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .order('registered_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (campaign: {
      title: string;
      description?: string;
      category: CampaignCategory;
      location?: string;
      start_date: string;
      end_date: string;
      target_participants: number;
      target_trees?: number;
      image_url?: string;
      green_points_reward: number;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập');

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...campaign,
          creator_id: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
      toast.success('Tạo chiến dịch thành công!');
    },
    onError: (error) => {
      toast.error('Lỗi khi tạo chiến dịch: ' + error.message);
    },
  });
}

export function useJoinCampaign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!user) throw new Error('Bạn cần đăng nhập');

      const { data, error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: campaignId,
          user_id: user.id,
          status: 'registered',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-participants', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['user-participation', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['my-participations'] });
      toast.success('Đăng ký tham gia thành công!');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

export function useLeaveCampaign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!user) throw new Error('Bạn cần đăng nhập');

      const { error } = await supabase
        .from('campaign_participants')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-participants', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['user-participation', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['my-participations'] });
      toast.success('Đã hủy đăng ký!');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!user) throw new Error('Bạn cần đăng nhập');

      const { data, error } = await supabase
        .from('campaign_participants')
        .update({
          status: 'checked_in',
          checked_in_at: new Date().toISOString(),
        })
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-participants', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['user-participation', campaignId] });
      toast.success('Check-in thành công!');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

export function useUpdateParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      participantId, 
      updates 
    }: { 
      participantId: string; 
      updates: { status?: ParticipantStatus; trees_planted?: number; notes?: string } 
    }) => {
      const { data, error } = await supabase
        .from('campaign_participants')
        .update(updates)
        .eq('id', participantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-participants', data.campaign_id] });
      queryClient.invalidateQueries({ queryKey: ['user-participation', data.campaign_id] });
      queryClient.invalidateQueries({ queryKey: ['my-participations'] });
      toast.success('Cập nhật thành công!');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Omit<Campaign, 'id' | 'creator_id' | 'created_at' | 'updated_at'>> 
    }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', data.id] });
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
      toast.success('Cập nhật chiến dịch thành công!');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

export async function uploadCampaignImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('campaign-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('campaign-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
