import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  userId: string;
  className?: string;
  showOffline?: boolean;
}

export function OnlineIndicator({ userId, className, showOffline = false }: OnlineIndicatorProps) {
  const { data: status } = useOnlineStatus(userId);

  // Check if online (last seen within 2 minutes)
  const isOnline = status?.is_online && 
    (Date.now() - new Date(status.last_seen).getTime()) < 120000;

  if (!isOnline && !showOffline) return null;

  return (
    <span
      className={cn(
        'inline-block h-3 w-3 rounded-full border-2 border-background',
        isOnline ? 'bg-green-500' : 'bg-gray-400',
        className
      )}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
}
