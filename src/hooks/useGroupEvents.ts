import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CAMLY_REWARDS, ACTION_TYPES } from '@/lib/camlyCoin';

export interface GroupEvent {
  id: string;
  group_id: string;
  created_by: string;
  title: string;
  title_vi: string | null;
  description: string | null;
  description_vi: string | null;
  cover_image_url: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  max_attendees: number | null;
  rsvp_count: number;
  campaign_id: string | null;
  created_at: string;
  creator?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  user_rsvp?: {
    id: string;
    status: 'going' | 'interested' | 'not_going';
  } | null;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'interested' | 'not_going';
  created_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Fetch group events
export function useGroupEvents(groupId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['group-events', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_events')
        .select(`
          *,
          creator:profiles!group_events_created_by_fkey(id, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (error) throw error;

      // Get user's RSVPs
      if (user && data.length > 0) {
        const eventIds = data.map(e => e.id);
        const { data: rsvps } = await supabase
          .from('group_event_rsvps')
          .select('id, event_id, status')
          .eq('user_id', user.id)
          .in('event_id', eventIds);

        const rsvpMap = new Map(rsvps?.map(r => [r.event_id, r]) || []);
        return data.map(e => ({ ...e, user_rsvp: rsvpMap.get(e.id) || null })) as GroupEvent[];
      }

      return data as GroupEvent[];
    },
    enabled: !!groupId,
  });
}

// Fetch past events
export function usePastGroupEvents(groupId: string) {
  return useQuery({
    queryKey: ['group-events-past', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_events')
        .select(`
          *,
          creator:profiles!group_events_created_by_fkey(id, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .lt('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as GroupEvent[];
    },
    enabled: !!groupId,
  });
}

// Create event
export function useCreateGroupEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventData: {
      group_id: string;
      title: string;
      title_vi?: string;
      description?: string;
      description_vi?: string;
      cover_image_url?: string;
      event_date: string;
      start_time?: string;
      end_time?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
      max_attendees?: number;
      campaign_id?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('group_events')
        .insert({
          ...eventData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { group_id }) => {
      queryClient.invalidateQueries({ queryKey: ['group-events', group_id] });
      queryClient.invalidateQueries({ queryKey: ['group', group_id] });
      toast.success('Đã tạo sự kiện!');
    },
    onError: (error) => {
      toast.error('Failed to create event');
      console.error(error);
    },
  });
}

// RSVP to event
export function useRSVPEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ eventId, groupId, status }: { eventId: string; groupId: string; status: 'going' | 'interested' | 'not_going' }) => {
      if (!user) throw new Error('Must be logged in');

      // Check if user already has RSVP
      const { data: existing } = await supabase
        .from('group_event_rsvps')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing RSVP
        const { error } = await supabase
          .from('group_event_rsvps')
          .update({ status })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new RSVP
        const { error } = await supabase
          .from('group_event_rsvps')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status,
          });

        if (error) throw error;
      }

      // Check if event hit 50 RSVPs and award bonus
      const { data: event } = await supabase
        .from('group_events')
        .select('rsvp_count, created_by')
        .eq('id', eventId)
        .single();

      if (event && event.rsvp_count >= 50) {
        // Check if bonus already awarded
        const { data: existingBonus } = await supabase
          .from('points_history')
          .select('id')
          .eq('user_id', event.created_by)
          .eq('reference_id', eventId)
          .eq('action_type', ACTION_TYPES.GROUP_EVENT_BONUS)
          .maybeSingle();

        if (!existingBonus) {
          // Award 50+ RSVP bonus to event creator
          await supabase.from('points_history').insert({
            user_id: event.created_by,
            action_type: ACTION_TYPES.GROUP_EVENT_BONUS,
            points_earned: CAMLY_REWARDS.GROUP_EVENT_50_RSVP,
            camly_equivalent: CAMLY_REWARDS.GROUP_EVENT_50_RSVP,
            camly_earned: CAMLY_REWARDS.GROUP_EVENT_50_RSVP,
            description: 'Event reached 50+ RSVPs!',
            reference_type: 'group_event',
            reference_id: eventId,
          });
        }
      }
    },
    onSuccess: (_, { groupId, status }) => {
      queryClient.invalidateQueries({ queryKey: ['group-events', groupId] });
      const messages: Record<string, string> = {
        going: 'Bạn sẽ tham gia! 🎉',
        interested: 'Đã đánh dấu quan tâm',
        not_going: 'Đã cập nhật',
      };
      toast.success(messages[status]);
    },
    onError: (error) => {
      toast.error('Failed to RSVP');
      console.error(error);
    },
  });
}

// Cancel RSVP
export function useCancelRSVP() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ eventId, groupId }: { eventId: string; groupId: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('group_event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group-events', groupId] });
      toast.success('Đã hủy tham gia');
    },
  });
}

// Get event RSVPs
export function useEventRSVPs(eventId: string) {
  return useQuery({
    queryKey: ['event-rsvps', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_event_rsvps')
        .select(`
          *,
          profile:profiles!group_event_rsvps_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('event_id', eventId)
        .in('status', ['going', 'interested'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EventRSVP[];
    },
    enabled: !!eventId,
  });
}

// Delete event
export function useDeleteGroupEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, groupId }: { eventId: string; groupId: string }) => {
      const { error } = await supabase
        .from('group_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group-events', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      toast.success('Đã xóa sự kiện');
    },
  });
}
