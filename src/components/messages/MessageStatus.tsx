import { Check, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'seen';
  sentAt?: string;
  deliveredAt?: string | null;
  seenAt?: string | null;
  isOwn: boolean;
}

export function MessageStatus({ 
  status, 
  sentAt, 
  deliveredAt, 
  seenAt, 
  isOwn 
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center ml-1">
            {status === 'sent' && (
              <Check className="h-3 w-3 text-primary-foreground/60" />
            )}
            {status === 'delivered' && (
              <CheckCheck className="h-3 w-3 text-primary-foreground/60" />
            )}
            {status === 'seen' && (
              <CheckCheck className="h-3 w-3 text-blue-400" />
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
