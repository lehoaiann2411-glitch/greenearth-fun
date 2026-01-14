import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, MoreVertical, Crown, MessageCircle, UserMinus, Shield } from 'lucide-react';
import { OnlineIndicator } from './OnlineIndicator';
import { useRemoveGroupMember } from '@/hooks/useMessages';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GroupMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  participants: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role?: string;
  }[];
  currentUserId: string;
  isAdmin: boolean;
}

export function GroupMembersModal({
  open,
  onOpenChange,
  conversationId,
  participants,
  currentUserId,
  isAdmin,
}: GroupMembersModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const removeMember = useRemoveGroupMember();

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember.mutateAsync({
        conversationId,
        userId,
      });
      toast.success(t('messages.memberRemoved'));
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error(t('messages.memberRemoveFailed'));
    }
  };

  const handleMessageMember = (userId: string) => {
    onOpenChange(false);
    navigate(`/messages?userId=${userId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t('messages.groupMembers')} ({participants.length + 1})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {/* Current user (always first) */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t('messages.you')}</span>
                  {isAdmin && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Crown className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Other participants */}
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={participant.avatar_url || ''} />
                    <AvatarFallback>
                      {participant.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <OnlineIndicator
                    userId={participant.id}
                    className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {participant.full_name || t('common.user')}
                    </span>
                    {participant.role === 'admin' && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Crown className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleMessageMember(participant.id)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {t('messages.sendMessage')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/profile/${participant.id}`)}>
                      <Users className="h-4 w-4 mr-2" />
                      {t('messages.viewProfile')}
                    </DropdownMenuItem>
                    {isAdmin && participant.role !== 'admin' && (
                      <>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          {t('messages.makeAdmin')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveMember(participant.id)}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          {t('messages.removeMember')}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
