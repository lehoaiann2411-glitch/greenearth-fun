import { X, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ReplyPreviewProps {
  replyToMessage: {
    id: string;
    content: string | null;
    sender_id: string;
    sender?: {
      full_name: string | null;
    };
    message_type?: string;
  };
  currentUserId: string;
  onCancel: () => void;
}

export function ReplyPreview({ replyToMessage, currentUserId, onCancel }: ReplyPreviewProps) {
  const { t } = useTranslation();
  const isOwnMessage = replyToMessage.sender_id === currentUserId;
  const senderName = isOwnMessage 
    ? t('messages.you') 
    : replyToMessage.sender?.full_name || t('common.user');

  const getPreviewContent = () => {
    if (replyToMessage.message_type === 'image') return `📷 ${t('messages.photo')}`;
    if (replyToMessage.message_type === 'video') return `🎥 ${t('messages.video')}`;
    if (replyToMessage.message_type === 'voice') return `🎤 ${t('messages.voiceMessage')}`;
    if (replyToMessage.message_type === 'camly_gift') return `🎁 ${t('messages.gift')}`;
    return replyToMessage.content || '';
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-t border-b">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Reply className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary truncate">
            {t('messages.replyingTo')} {senderName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {getPreviewContent()}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
