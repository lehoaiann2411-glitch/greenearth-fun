import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Clock, Check, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useFriendshipStatus,
  useSendFriendRequest,
  useCancelFriendRequest,
  useUnfriend,
  useAcceptFriendRequest,
} from '@/hooks/useFriendships';
import { useCreateConversation } from '@/hooks/useMessages';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AddFriendButtonProps {
  targetUserId: string;
  variant?: 'default' | 'compact';
}

export function AddFriendButton({ targetUserId, variant = 'default' }: AddFriendButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: status, isLoading: statusLoading } = useFriendshipStatus(targetUserId);
  
  const sendRequest = useSendFriendRequest();
  const cancelRequest = useCancelFriendRequest();
  const unfriend = useUnfriend();
  const acceptRequest = useAcceptFriendRequest();
  const createConversation = useCreateConversation();

  if (!user || user.id === targetUserId) return null;

  const isLoading = statusLoading || sendRequest.isPending || cancelRequest.isPending || 
                    unfriend.isPending || acceptRequest.isPending;

  const handleSendMessage = async () => {
    const conversation = await createConversation.mutateAsync(targetUserId);
    navigate(`/messages/${conversation.id}`);
  };

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
          {variant !== 'compact' && 'Message'}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size={variant === 'compact' ? 'sm' : 'default'}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {variant !== 'compact' && 'Friends'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => unfriend.mutate(targetUserId)}
              className="text-destructive"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Unfriend
            </DropdownMenuItem>
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
        {variant !== 'compact' && 'Request Sent'}
      </Button>
    );
  }

  if (status === 'pending_received') {
    // Need to get the friendship ID to accept
    return (
      <Button
        variant="default"
        size={variant === 'compact' ? 'sm' : 'default'}
        className="gap-2 bg-primary"
        disabled={isLoading}
      >
        <Check className="h-4 w-4" />
        {variant !== 'compact' && 'Accept Request'}
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
      {variant !== 'compact' && 'Add Friend'}
    </Button>
  );
}
