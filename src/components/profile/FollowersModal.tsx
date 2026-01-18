import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFollowers, useFollowing, useFollowUser, useUnfollowUser, useIsFollowing } from '@/hooks/useFollow';
import { useAuth } from '@/contexts/AuthContext';
import { Search, TreePine, UserPlus, UserMinus, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  initialTab?: 'followers' | 'following';
}

interface FollowUserCardProps {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio?: string | null;
  treesPlanted?: number;
  createdAt?: string;
  showFollowButton?: boolean;
}

function FollowUserCard({ 
  userId, 
  fullName, 
  avatarUrl, 
  bio, 
  treesPlanted,
  createdAt,
  showFollowButton = true 
}: FollowUserCardProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: isFollowing, isLoading: checkingFollow } = useIsFollowing(userId);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const locale = i18n.language === 'vi' ? vi : enUS;

  const isOwnProfile = user?.id === userId;
  const isPending = followUser.isPending || unfollowUser.isPending;

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowUser.mutateAsync(userId);
    } else {
      await followUser.mutateAsync(userId);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <Link to={`/profile/${userId}`}>
        <Avatar className="h-12 w-12 border-2 border-background">
          <AvatarImage src={avatarUrl || ''} alt={fullName || ''} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {fullName?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/profile/${userId}`} className="hover:underline">
          <p className="font-medium text-sm truncate">{fullName || t('common.user')}</p>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {treesPlanted !== undefined && (
            <span className="flex items-center gap-1">
              <TreePine className="h-3 w-3 text-green-500" />
              {treesPlanted}
            </span>
          )}
          {createdAt && (
            <span>
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale })}
            </span>
          )}
        </div>
        {bio && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{bio}</p>
        )}
      </div>

      {showFollowButton && !isOwnProfile && (
        <Button
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          onClick={handleFollowToggle}
          disabled={isPending || checkingFollow}
          className="shrink-0"
        >
          {isFollowing ? (
            <>
              <UserMinus className="h-4 w-4 mr-1" />
              {t('friends.unfollow')}
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-1" />
              {t('friends.followBack')}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export function FollowersModal({ 
  isOpen, 
  onClose, 
  userId, 
  userName,
  initialTab = 'followers' 
}: FollowersModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: followers, isLoading: followersLoading } = useFollowers(userId);
  const { data: following, isLoading: followingLoading } = useFollowing(userId);

  const filteredFollowers = followers?.filter(f => 
    f.follower?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredFollowing = following?.filter(f => 
    f.following?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {userName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'followers' | 'following')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers" className="gap-2">
              {t('friends.followers')}
              {followers && <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{followers.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-2">
              {t('profile.following')}
              {following && <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{following.length}</span>}
            </TabsTrigger>
          </TabsList>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <TabsContent value="followers" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {followersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20 mt-1" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredFollowers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{searchQuery ? t('common.noResults') : t('friends.noFollowers')}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredFollowers.map((f) => (
                    <FollowUserCard
                      key={f.id}
                      userId={f.follower?.id || ''}
                      fullName={f.follower?.full_name || null}
                      avatarUrl={f.follower?.avatar_url || null}
                      bio={f.follower?.bio}
                      createdAt={f.created_at}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {followingLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20 mt-1" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredFollowing.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{searchQuery ? t('common.noResults') : t('profile.noFollowing')}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredFollowing.map((f) => (
                    <FollowUserCard
                      key={f.id}
                      userId={f.following?.id || ''}
                      fullName={f.following?.full_name || null}
                      avatarUrl={f.following?.avatar_url || null}
                      bio={f.following?.bio}
                      createdAt={f.created_at}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
