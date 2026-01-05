import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: string;
  campaign_id: string | null;
  title: string;
  title_vi: string | null;
  description: string | null;
  description_vi: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  max_attendees: number | null;
  created_by: string | null;
  created_at: string;
}

interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  rsvp_status: string;
  registered_at: string;
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          *,
          profile:profiles(id, full_name, avatar_url)
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}

export function useJoinEvent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, status = 'going' }: { eventId: string; status?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('event_attendees')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          rsvp_status: status,
        }, {
          onConflict: 'event_id,user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useLeaveEvent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
