import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationPreferences {
  follows: boolean;
  friend_requests: boolean;
  messages: boolean;
  likes: boolean;
  comments: boolean;
  shares: boolean;
  campaigns: boolean;
  rewards: boolean;
}

const defaultPreferences: NotificationPreferences = {
  follows: true,
  friend_requests: true,
  messages: true,
  likes: true,
  comments: true,
  shares: true,
  campaigns: true,
  rewards: true,
};

export function useNotificationPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user) return defaultPreferences;

      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      return {
        ...defaultPreferences,
        ...(data?.notification_preferences as Partial<NotificationPreferences> || {}),
      };
    },
    enabled: !!user,
  });
}

export function useUpdateNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      if (!user) throw new Error('Not authenticated');

      // Get current preferences first
      const { data: currentData } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      const currentPrefs = (currentData?.notification_preferences as unknown as NotificationPreferences) || defaultPreferences;
      const updatedPrefs = { ...currentPrefs, ...preferences };

      const { error } = await supabase
        .from('profiles')
        .update({ 
          notification_preferences: updatedPrefs as unknown as { [key: string]: string | number | boolean | null }
        })
        .eq('id', user.id);

      if (error) throw error;
      return updatedPrefs;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-preferences', user?.id], data);
    },
  });
}

// Helper to check if user wants a specific notification type
export async function shouldSendNotification(
  userId: string,
  notificationType: keyof NotificationPreferences
): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', userId)
    .single();

  if (error) return true; // Default to sending if we can't check

  const prefs = (data?.notification_preferences as unknown as NotificationPreferences) || defaultPreferences;
  return prefs[notificationType] !== false;
}
