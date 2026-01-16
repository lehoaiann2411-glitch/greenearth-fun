import { Check, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'seen';
  sentAt?: string;
  deliveredAt?: string | null;
  seenAt?: string | null;
  isOwn: boolean;
  className?: string;
  showLabel?: boolean;
}

export function MessageStatus({ 
  status, 
  sentAt, 
  deliveredAt, 
  seenAt, 
  isOwn,
  className,
  showLabel = true
}: MessageStatusProps) {
  const { t } = useTranslation();

  // Only show status for own messages
  if (!isOwn) return null;

  const getTooltipContent = () => {
    const lines = [];
    if (sentAt) {
      lines.push(`${t('messages.sent')}: ${format(new Date(sentAt), 'HH:mm')}`);
    }
    if (deliveredAt) {
      lines.push(`${t('messages.delivered')}: ${format(new Date(deliveredAt), 'HH:mm')}`);
    }
    if (seenAt) {
      lines.push(`${t('messages.seen')}: ${format(new Date(seenAt), 'HH:mm')}`);
    }
    return lines.join('\n');
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'sent':
        return t('messages.sent', 'Đã gửi');
      case 'delivered':
        return t('messages.delivered', 'Đã nhận');
      case 'seen':
        return t('messages.seen', 'Đã xem');
      default:
        return '';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex items-center gap-0.5 ml-1", className)}>
            {status === 'sent' && (
              <Check className={cn("h-3 w-3", className ? "" : "text-primary-foreground/60")} />
            )}
            {status === 'delivered' && (
              <CheckCheck className={cn("h-3 w-3", className ? "" : "text-primary-foreground/60")} />
            )}
            {status === 'seen' && (
              <CheckCheck className="h-3 w-3 text-blue-400" />
            )}
            {showLabel && (
              <span className={cn(
                "text-[10px] font-medium",
                status === 'seen' 
                  ? "text-blue-400" 
                  : className ? "" : "text-primary-foreground/60"
              )}>
                {getStatusLabel()}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="left" className="whitespace-pre-line text-xs">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
