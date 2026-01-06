import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Clock, Check, MessageCircle, Loader2, Phone, Video, Ban, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useFriendshipStatus,
  useSendFriendRequest,
  useCancelFriendRequest,
  useUnfriend,
  useAcceptFriendRequest,
} from '@/hooks/useFriendships';
import { useCreateConversation } from '@/hooks/useMessages';
import { useCall } from '@/contexts/CallContext';
import { useBlockUser, useHasBlocked, useUnblockUser } from '@/hooks/useBlocking';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface AddFriendButtonProps {
  targetUserId: string;
  targetUserName?: string;
  targetUserAvatar?: string;
  variant?: 'default' | 'compact';
}

export function AddFriendButton({ 
  targetUserId, 
  targetUserName,
  targetUserAvatar,
  variant = 'default' 
}: AddFriendButtonProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: status, isLoading: statusLoading } = useFriendshipStatus(targetUserId);
  const { data: hasBlocked } = useHasBlocked(targetUserId);
  const { startCall } = useCall();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  
  const sendRequest = useSendFriendRequest();
  const cancelRequest = useCancelFriendRequest();
  const unfriend = useUnfriend();
  const acceptRequest = useAcceptFriendRequest();
  const createConversation = useCreateConversation();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  if (!user || user.id === targetUserId) return null;

  const isLoading = statusLoading || sendRequest.isPending || cancelRequest.isPending || 
                    unfriend.isPending || acceptRequest.isPending || blockUser.isPending || unblockUser.isPending;

  const handleSendMessage = async () => {
    const conversation = await createConversation.mutateAsync(targetUserId);
    navigate(`/messages/${conversation.id}`);
  };

  const handleVoiceCall = () => {
    startCall(targetUserId, 'voice', targetUserName, targetUserAvatar);
  };

  const handleVideoCall = () => {
    startCall(targetUserId, 'video', targetUserName, targetUserAvatar);
  };

  const handleBlock = () => {
    blockUser.mutate(targetUserId);
    setShowBlockDialog(false);
  };

  const handleUnblock = () => {
    unblockUser.mutate(targetUserId);
  };

  // If user has blocked this person
  if (hasBlocked) {
    return (
      <Button
        variant="outline"
        size={variant === 'compact' ? 'sm' : 'default'}
        onClick={handleUnblock}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Ban className="h-4 w-4" />
        )}
        {variant !== 'compact' && t('blocking.unblock')}
      </Button>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size={variant === 'compact' ? 'sm' : 'default'}
          onClick={handleSendMessage}
          disabled={createConversation.isPending}
          className="gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          {variant !== 'compact' && t('common.message')}
        </Button>
        <Button
          variant="outline"
          size={variant === 'compact' ? 'sm' : 'default'}
          onClick={handleVoiceCall}
          className="gap-2"
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size={variant === 'compact' ? 'sm' : 'default'}
          onClick={handleVideoCall}
          className="gap-2"
        >
          <Video className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size={variant === 'compact' ? 'sm' : 'default'}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {variant !== 'compact' && t('friends.friends')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => unfriend.mutate(targetUserId)}
              className="text-destructive"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              {t('friends.unfriend')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  {t('blocking.block')}
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('blocking.confirmBlockTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('blocking.confirmBlock', { name: targetUserName || t('common.user') })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBlock} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t('blocking.block')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (status === 'pending_sent') {
    return (
      <Button
        variant="secondary"
        size={variant === 'compact' ? 'sm' : 'default'}
        onClick={() => cancelRequest.mutate(targetUserId)}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        {variant !== 'compact' && t('friends.requestSent')}
      </Button>
    );
  }

  if (status === 'pending_received') {
    return (
      <Button
        variant="default"
        size={variant === 'compact' ? 'sm' : 'default'}
        className="gap-2 bg-primary"
        disabled={isLoading}
      >
        <Check className="h-4 w-4" />
        {variant !== 'compact' && t('friends.acceptRequest')}
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size={variant === 'compact' ? 'sm' : 'default'}
      onClick={() => sendRequest.mutate(targetUserId)}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {variant !== 'compact' && t('friends.addFriend')}
    </Button>
  );
}
