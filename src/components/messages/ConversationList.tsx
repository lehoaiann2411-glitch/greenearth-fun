import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, MessageCircle, Leaf } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OnlineIndicator } from './OnlineIndicator';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Conversation } from '@/hooks/useMessages';

interface ConversationListProps {
  conversations: Conversation[] | undefined;
  isLoading: boolean;
  activeConversationId?: string;
  onNewMessage?: () => void;
}

export function ConversationList({
  conversations,
  isLoading,
  activeConversationId,
  onNewMessage,
}: ConversationListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations?.filter((conv) => {
    const participant = conv.participants?.[0];
    return participant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold">{t('messages.title')}</h2>
          </div>
          {onNewMessage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewMessage}
              className="hover:bg-primary/10"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search')}
            className="pl-9 bg-background/50"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredConversations && filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map((conv) => {
              const participant = conv.participants?.[0];
              const isActive = conv.id === activeConversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className={cn(
                    'w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-all duration-200 text-left group',
                    isActive && 'bg-primary/5 border-l-4 border-l-primary'
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-background shadow-md transition-transform group-hover:scale-105">
                      <AvatarImage src={participant?.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                        {participant?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <OnlineIndicator
                      userId={participant?.id || ''}
                      className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {participant?.full_name || t('common.user')}
                      </p>
                      {conv.last_message_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message_preview || t('messages.startConversation')}
                    </p>
                  </div>
                  {conv.unread_count && conv.unread_count > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground animate-pulse">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-primary/50" />
            </div>
            <p className="font-medium">{t('messages.noConversations')}</p>
            <p className="text-sm mt-1">{t('messages.startChatting')}</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
