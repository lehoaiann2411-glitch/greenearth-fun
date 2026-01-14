import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Users, UserPlus, Settings, LogOut, MoreVertical, Phone, Video } from 'lucide-react';
import { GroupMembersModal } from './GroupMembersModal';
import { cn } from '@/lib/utils';

interface GroupChatHeaderProps {
  conversation: {
    id: string;
    name: string | null;
    avatar_url?: string | null;
    description?: string | null;
    created_by?: string | null;
  };
  participants: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role?: string;
  }[];
  currentUserId: string;
  onLeaveGroup: () => void;
  onStartCall?: (type: 'voice' | 'video') => void;
}

export function GroupChatHeader({
  conversation,
  participants,
  currentUserId,
  onLeaveGroup,
  onStartCall,
}: GroupChatHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showMembers, setShowMembers] = useState(false);

  const isAdmin = participants.find(p => p.id === currentUserId)?.role === 'admin';
  const memberCount = participants.length + 1; // +1 for current user
  const onlineCount = 1; // TODO: Implement online tracking for groups

  // Get first 3 member avatars for group avatar
  const displayAvatars = participants.slice(0, 3);

  return (
    <>
      <div className="pb-3 border-b bg-gradient-to-r from-primary/5 to-accent/5 p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => navigate('/messages')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Group Avatar */}
          <div className="relative">
            {conversation.avatar_url ? (
              <Avatar className="h-10 w-10 ring-2 ring-background shadow-md">
                <AvatarImage src={conversation.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                  <Users className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="relative h-10 w-10">
                {displayAvatars.map((p, i) => (
                  <Avatar
                    key={p.id}
                    className={cn(
                      'h-6 w-6 absolute ring-2 ring-background',
                      i === 0 && 'top-0 left-0',
                      i === 1 && 'top-0 right-0',
                      i === 2 && 'bottom-0 left-1/2 -translate-x-1/2'
                    )}
                  >
                    <AvatarImage src={p.avatar_url || ''} />
                    <AvatarFallback className="text-[8px] bg-muted">
                      {p.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </div>

          {/* Group Info */}
          <button 
            className="flex-1 text-left"
            onClick={() => setShowMembers(true)}
          >
            <p className="font-medium">{conversation.name || t('messages.group')}</p>
            <p className="text-xs text-muted-foreground">
              {memberCount} {t('messages.members')} • {onlineCount} {t('messages.online')}
            </p>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {onStartCall && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary"
                  onClick={() => onStartCall('voice')}
                  title={t('calls.voiceCall')}
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary"
                  onClick={() => onStartCall('video')}
                  title={t('calls.videoCall')}
                >
                  <Video className="h-5 w-5" />
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowMembers(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  {t('messages.viewMembers')}
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('messages.addMembers')}
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    {t('messages.groupSettings')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={onLeaveGroup}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('messages.leaveGroup')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Members Modal */}
      <GroupMembersModal
        open={showMembers}
        onOpenChange={setShowMembers}
        conversationId={conversation.id}
        participants={participants}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
      />
    </>
  );
}
