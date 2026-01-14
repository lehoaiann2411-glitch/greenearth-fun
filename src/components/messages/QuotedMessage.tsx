import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface QuotedMessageProps {
  message: {
    id: string;
    content: string | null;
    sender_id: string;
    sender?: {
      full_name: string | null;
    };
    message_type?: string;
  };
  currentUserId: string;
  isOwnMessage: boolean;
  onScrollToMessage?: (messageId: string) => void;
}

export function QuotedMessage({ 
  message, 
  currentUserId, 
  isOwnMessage,
  onScrollToMessage 
}: QuotedMessageProps) {
  const { t } = useTranslation();
  const isQuotedOwn = message.sender_id === currentUserId;
  const senderName = isQuotedOwn 
    ? t('messages.you') 
    : message.sender?.full_name || t('common.user');

  const getPreviewContent = () => {
    if (message.message_type === 'image') return `📷 ${t('messages.photo')}`;
    if (message.message_type === 'video') return `🎥 ${t('messages.video')}`;
    if (message.message_type === 'voice') return `🎤 ${t('messages.voiceMessage')}`;
    if (message.message_type === 'camly_gift') return `🎁 ${t('messages.gift')}`;
    return message.content || '';
  };

  return (
    <button
      onClick={() => onScrollToMessage?.(message.id)}
      className={cn(
        'w-full text-left rounded-lg p-2 mb-1 border-l-2 transition-colors',
        isOwnMessage 
          ? 'bg-primary-foreground/10 border-primary-foreground/50 hover:bg-primary-foreground/20' 
          : 'bg-background/30 border-primary/50 hover:bg-background/50'
      )}
    >
      <p className={cn(
        'text-[10px] font-medium truncate',
        isOwnMessage ? 'text-primary-foreground/80' : 'text-primary'
      )}>
        {senderName}
      </p>
      <p className={cn(
        'text-[11px] truncate',
        isOwnMessage ? 'text-primary-foreground/60' : 'text-muted-foreground'
      )}>
        {getPreviewContent()}
      </p>
    </button>
  );
}
