import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends } from '@/hooks/useFriendships';
import { useCreateConversation } from '@/hooks/useMessages';
import { OnlineIndicator } from './OnlineIndicator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewMessageModal({ open, onOpenChange }: NewMessageModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: friends, isLoading } = useFriends(user?.id || '');
  const createConversation = useCreateConversation();

  const filteredFriends = friends?.filter(friend =>
    friend.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSelectFriend = async (friendId: string) => {
    setSelectedUserId(friendId);
    try {
      const conversation = await createConversation.mutateAsync(friendId);
      onOpenChange(false);
      setSearchQuery('');
      setSelectedUserId(null);
      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error(t('messages.createFailed'));
      setSelectedUserId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            {t('messages.newMessage')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('messages.searchFriends')}
              className="pl-10"
            />
          </div>

          {/* Friends List */}
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFriends.length > 0 ? (
              <div className="space-y-1">
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleSelectFriend(friend.id)}
                    disabled={createConversation.isPending}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                      'hover:bg-primary/5 active:scale-[0.98]',
                      selectedUserId === friend.id && 'bg-primary/10'
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                        <AvatarImage src={friend.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {friend.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <OnlineIndicator
                        userId={friend.id}
                        className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{friend.full_name}</p>
                      {friend.location && (
                        <p className="text-xs text-muted-foreground truncate">
                          {friend.location}
                        </p>
                      )}
                    </div>
                    {selectedUserId === friend.id && createConversation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-primary/50" />
                </div>
                <p className="text-muted-foreground text-sm">
                  {searchQuery 
                    ? t('common.noResults') 
                    : t('messages.startChatting')
                  }
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
