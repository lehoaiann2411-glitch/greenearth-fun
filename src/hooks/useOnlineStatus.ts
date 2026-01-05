import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useOnlineStatus(userId: string) {
  return useQuery({
    queryKey: ['online-status', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_online_status')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useUpdateOnlineStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isOnline: boolean) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('user_online_status')
        .upsert({
          user_id: user.id,
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-status', user?.id] });
    },
  });
}

export function useOnlinePresence() {
  const { user } = useAuth();
  const updateStatus = useUpdateOnlineStatus();

  useEffect(() => {
    if (!user) return;

    // Set online when component mounts
    updateStatus.mutate(true);

    // Set offline when user leaves
    const handleVisibilityChange = () => {
      updateStatus.mutate(!document.hidden);
    };

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline status on page close
      const data = JSON.stringify({
        user_id: user.id,
        is_online: false,
        last_seen: new Date().toISOString(),
      });
      navigator.sendBeacon?.('/api/offline', data);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Heartbeat every 30 seconds
    const interval = setInterval(() => {
      if (!document.hidden) {
        updateStatus.mutate(true);
      }
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
      updateStatus.mutate(false);
    };
  }, [user]);
}

export function useMultipleOnlineStatus(userIds: string[]) {
  return useQuery({
    queryKey: ['online-status-multiple', userIds.sort().join(',')],
    queryFn: async () => {
      if (userIds.length === 0) return {};

      const { data, error } = await supabase
        .from('user_online_status')
        .select('*')
        .in('user_id', userIds)
        .eq('show_status', true);

      if (error) throw error;

      const statusMap: Record<string, { isOnline: boolean; lastSeen: string }> = {};
      data?.forEach(status => {
        // Consider online if last seen within 2 minutes
        const lastSeen = new Date(status.last_seen);
        const isOnline = status.is_online && (Date.now() - lastSeen.getTime()) < 120000;
        statusMap[status.user_id] = {
          isOnline,
          lastSeen: status.last_seen,
        };
      });

      return statusMap;
    },
    enabled: userIds.length > 0,
    refetchInterval: 60000,
  });
}
