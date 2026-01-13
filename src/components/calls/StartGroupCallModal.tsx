import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Phone, Video, Search, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFriends } from '@/hooks/useFriendships';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface StartGroupCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCall: (userIds: string[], callType: 'voice' | 'video') => Promise<void>;
}

export function StartGroupCallModal({ 
  isOpen, 
  onClose, 
  onStartCall 
}: StartGroupCallModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  
  const { data: friends, isLoading } = useFriends(user?.id || '');

  const filteredFriends = friends?.filter(friend => 
    friend.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleStartCall = async (callType: 'voice' | 'video') => {
    if (selectedUsers.length < 1) return;
    
    setIsStarting(true);
    try {
      await onStartCall(selectedUsers, callType);
      onClose();
      setSelectedUsers([]);
      setSearchQuery('');
    } finally {
      setIsStarting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedUsers([]);
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('calls.createGroupCall')}
          </DialogTitle>
        </DialogHeader>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('calls.searchFriends')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Selected count */}
        {selectedUsers.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedUsers.length} {t('calls.selected')}
          </div>
        )}
        
        {/* Friends list */}
        <ScrollArea className="h-64">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? t('common.noResults') : t('friends.noFriends')}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFriends.map(friend => (
                <label
                  key={friend.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={selectedUsers.includes(friend.id)}
                    onCheckedChange={() => handleToggleUser(friend.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.avatar_url || ''} />
                    <AvatarFallback>
                      {friend.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{friend.full_name}</span>
                </label>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleStartCall('voice')}
            disabled={selectedUsers.length < 1 || isStarting}
            className="flex-1"
          >
            <Phone className="h-4 w-4 mr-2" />
            {t('calls.voiceCall')}
          </Button>
          <Button
            onClick={() => handleStartCall('video')}
            disabled={selectedUsers.length < 1 || isStarting}
            className="flex-1"
          >
            <Video className="h-4 w-4 mr-2" />
            {t('calls.videoCall')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
