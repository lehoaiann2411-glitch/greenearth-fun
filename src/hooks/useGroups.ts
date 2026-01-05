import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CAMLY_REWARDS, ACTION_TYPES } from '@/lib/camlyCoin';

export interface Group {
  id: string;
  name: string;
  name_vi: string | null;
  description: string | null;
  description_vi: string | null;
  cover_image_url: string | null;
  icon_emoji: string;
  privacy: 'public' | 'private';
  location: string | null;
  location_vi: string | null;
  category: string;
  created_by: string;
  members_count: number;
  posts_count: number;
  events_count: number;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  creator?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  status: 'pending' | 'approved' | 'rejected';
  invited_by: string | null;
  camly_earned: number;
  joined_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface GroupFilters {
  search?: string;
  category?: string;
  location?: string;
  featured?: boolean;
}

// Fetch all groups with filters
export function useGroups(filters?: GroupFilters) {
  return useQuery({
    queryKey: ['groups', filters],
    queryFn: async () => {
      let query = supabase
        .from('groups')
        .select(`
          *,
          creator:profiles!groups_created_by_fkey(id, full_name, avatar_url)
        `)
        .order('is_featured', { ascending: false })
        .order('members_count', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,name_vi.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.location) {
        query = query.or(`location.ilike.%${filters.location}%,location_vi.ilike.%${filters.location}%`);
      }
      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Group[];
    },
  });
}

// Fetch user's groups
export function useMyGroups() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-groups', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          group:groups(
            *,
            creator:profiles!groups_created_by_fkey(id, full_name, avatar_url)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data.map(m => m.group) as Group[];
    },
    enabled: !!user,
  });
}

// Fetch single group
export function useGroup(groupId: string) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          creator:profiles!groups_created_by_fkey(id, full_name, avatar_url)
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return data as Group;
    },
    enabled: !!groupId,
  });
}

// Fetch group members
export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profile:profiles!group_members_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .eq('status', 'approved')
        .order('role', { ascending: true })
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data as GroupMember[];
    },
    enabled: !!groupId,
  });
}

// Fetch pending members
export function usePendingMembers(groupId: string) {
  return useQuery({
    queryKey: ['pending-members', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profile:profiles!group_members_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data as GroupMember[];
    },
    enabled: !!groupId,
  });
}

// Check user's membership status
export function useGroupMembership(groupId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['group-membership', groupId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as GroupMember | null;
    },
    enabled: !!groupId && !!user,
  });
}

// Create group
export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (groupData: {
      name: string;
      name_vi?: string;
      description?: string;
      description_vi?: string;
      cover_image_url?: string;
      icon_emoji?: string;
      privacy: 'public' | 'private';
      location?: string;
      category?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          ...groupData,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'admin',
          status: 'approved',
        });

      if (memberError) throw memberError;

      // Award Camly Coin
      await supabase.from('points_history').insert({
        user_id: user.id,
        action_type: ACTION_TYPES.GROUP_CREATE,
        points_earned: CAMLY_REWARDS.GROUP_CREATE,
        camly_equivalent: CAMLY_REWARDS.GROUP_CREATE,
        camly_earned: CAMLY_REWARDS.GROUP_CREATE,
        description: `Created group: ${groupData.name}`,
        reference_type: 'group',
        reference_id: group.id,
      });

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
      toast.success(`+${CAMLY_REWARDS.GROUP_CREATE.toLocaleString()} 🪙 Đã tạo nhóm mới!`);
    },
    onError: (error) => {
      toast.error('Failed to create group');
      console.error(error);
    },
  });
}

// Join group
export function useJoinGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ groupId, privacy }: { groupId: string; privacy: 'public' | 'private' }) => {
      if (!user) throw new Error('Must be logged in');

      const status = privacy === 'public' ? 'approved' : 'pending';

      const { data, error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
          status,
        })
        .select()
        .single();

      if (error) throw error;

      // Award Camly for joining (only for public groups)
      if (status === 'approved') {
        await supabase.from('points_history').insert({
          user_id: user.id,
          action_type: ACTION_TYPES.GROUP_JOIN,
          points_earned: CAMLY_REWARDS.GROUP_JOIN,
          camly_equivalent: CAMLY_REWARDS.GROUP_JOIN,
          camly_earned: CAMLY_REWARDS.GROUP_JOIN,
          description: 'Joined a group',
          reference_type: 'group',
          reference_id: groupId,
        });
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-membership', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-members', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
      
      if (variables.privacy === 'public') {
        toast.success(`+${CAMLY_REWARDS.GROUP_JOIN.toLocaleString()} 🪙 Đã tham gia nhóm!`);
      } else {
        toast.success('Yêu cầu tham gia đã được gửi!');
      }
    },
    onError: (error) => {
      toast.error('Failed to join group');
      console.error(error);
    },
  });
}

// Leave group
export function useLeaveGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['group-membership', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      toast.success('Đã rời nhóm');
    },
    onError: (error) => {
      toast.error('Failed to leave group');
      console.error(error);
    },
  });
}

// Approve member (admin only)
export function useApproveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, groupId }: { memberId: string; groupId: string }) => {
      const { error } = await supabase
        .from('group_members')
        .update({ status: 'approved' })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['pending-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      toast.success('Đã chấp nhận thành viên');
    },
  });
}

// Reject member (admin only)
export function useRejectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, groupId }: { memberId: string; groupId: string }) => {
      const { error } = await supabase
        .from('group_members')
        .update({ status: 'rejected' })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['pending-members', groupId] });
      toast.success('Đã từ chối yêu cầu');
    },
  });
}

// Update group
export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, data }: { groupId: string; data: Partial<Group> }) => {
      const { error } = await supabase
        .from('groups')
        .update(data)
        .eq('id', groupId);

      if (error) throw error;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Đã cập nhật nhóm');
    },
  });
}

// Group categories for filtering
export const GROUP_CATEGORIES = [
  { value: 'all', label: 'Tất cả', label_en: 'All' },
  { value: 'tree_planting', label: 'Trồng cây', label_en: 'Tree Planting', emoji: '🌳' },
  { value: 'cleanup', label: 'Dọn dẹp', label_en: 'Cleanup', emoji: '🧹' },
  { value: 'recycling', label: 'Tái chế', label_en: 'Recycling', emoji: '♻️' },
  { value: 'esg', label: 'ESG', label_en: 'ESG', emoji: '🏢' },
  { value: 'education', label: 'Giáo dục', label_en: 'Education', emoji: '📚' },
  { value: 'general', label: 'Chung', label_en: 'General', emoji: '🌍' },
  { value: 'other', label: 'Khác', label_en: 'Other', emoji: '💚' },
] as const;

// Vietnam locations for filtering
export const VIETNAM_LOCATIONS = [
  'Hà Nội',
  'TP.HCM',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Nha Trang',
  'Huế',
  'Đà Lạt',
  'Vũng Tàu',
  'Toàn quốc',
] as const;

// Eco emojis for groups
export const GROUP_EMOJIS = ['🌳', '🌱', '🍃', '🌍', '♻️', '🌿', '🌸', '☀️', '🌈', '💚', '🏔️', '🌊', '🦋', '🐝', '🌻'] as const;
