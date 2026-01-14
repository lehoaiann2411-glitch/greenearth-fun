import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Loader2, Search } from 'lucide-react';
import { useFriends } from '@/hooks/useFriendships';
import { useCreateGroupConversation } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupModal({ open, onOpenChange }: CreateGroupModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: friends, isLoading: friendsLoading } = useFriends(user?.id || '');
  const createGroup = useCreateGroupConversation();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friends?.filter(friend => 
    friend.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error(t('messages.groupNameRequired'));
      return;
    }
    if (selectedMembers.length < 1) {
      toast.error(t('messages.selectAtLeastOneMember'));
      return;
    }

    try {
      const conversationId = await createGroup.mutateAsync({
        name: groupName.trim(),
        memberIds: selectedMembers,
        description: description.trim() || undefined,
      });
      
      toast.success(t('messages.groupCreated'));
      onOpenChange(false);
      navigate(`/messages/${conversationId}`);
      
      // Reset form
      setGroupName('');
      setDescription('');
      setSelectedMembers([]);
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error(t('messages.groupCreateFailed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t('messages.createGroup')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="group-name">{t('messages.groupName')}</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t('messages.groupNamePlaceholder')}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('messages.groupDescription')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('messages.groupDescriptionPlaceholder')}
              rows={2}
            />
          </div>

          {/* Member Selection */}
          <div className="space-y-2">
            <Label>{t('messages.selectMembers')} ({selectedMembers.length})</Label>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('messages.searchFriends')}
                className="pl-9"
              />
            </div>

            {/* Friends List */}
            <ScrollArea className="h-48 border rounded-lg">
              {friendsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredFriends && filteredFriends.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredFriends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => toggleMember(friend.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-lg transition-colors',
                        selectedMembers.includes(friend.id)
                          ? 'bg-primary/10'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <Checkbox
                        checked={selectedMembers.includes(friend.id)}
                        onCheckedChange={() => toggleMember(friend.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={friend.avatar_url || ''} />
                        <AvatarFallback>
                          {friend.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {friend.full_name || t('common.user')}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  {t('messages.noFriendsFound')}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!groupName.trim() || selectedMembers.length < 1 || createGroup.isPending}
              className="flex-1"
            >
              {createGroup.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.creating')}
                </>
              ) : (
                t('messages.createGroup')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
