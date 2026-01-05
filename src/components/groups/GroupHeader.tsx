import { Group, useGroupMembership, useJoinGroup, useLeaveGroup } from '@/hooks/useGroups';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Lock, Globe, MapPin, Settings, Share2, Bell, Coins, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CAMLY_REWARDS } from '@/lib/camlyCoin';
import { Link } from 'react-router-dom';

interface GroupHeaderProps {
  group: Group;
}

export function GroupHeader({ group }: GroupHeaderProps) {
  const { user } = useAuth();
  const { data: membership } = useGroupMembership(group.id);
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  const isMember = membership?.status === 'approved';
  const isPending = membership?.status === 'pending';
  const isAdmin = membership?.role === 'admin';
  const isModerator = membership?.role === 'moderator';

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-48 sm:h-64 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 overflow-hidden">
        {group.cover_image_url ? (
          <img
            src={group.cover_image_url}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-accent/20 to-primary/30">
            <span className="text-8xl">{group.icon_emoji || '🌳'}</span>
          </div>
        )}
      </div>

      {/* Group Info Overlay */}
      <div className="container relative -mt-16 pb-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 -mt-12 sm:-mt-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl shadow-lg border-4 border-white">
              {group.icon_emoji || '🌳'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {group.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Badge variant={group.privacy === 'public' ? 'secondary' : 'outline'}>
                      {group.privacy === 'public' ? (
                        <><Globe className="h-3 w-3 mr-1" /> Công khai</>
                      ) : (
                        <><Lock className="h-3 w-3 mr-1" /> Riêng tư</>
                      )}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.members_count.toLocaleString()} thành viên
                    </span>
                    {group.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {group.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/groups/${group.id}/manage`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Quản lý
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Description */}
              {group.description && (
                <p className="mt-3 text-muted-foreground">
                  {group.description}
                </p>
              )}

              {/* Stats & Join */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    📝 {group.posts_count} bài viết
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {group.events_count} sự kiện
                  </span>
                </div>

                <div className="flex-1" />

                {user && !isMember && !isPending && (
                  <Button
                    onClick={() => joinGroup.mutate({ groupId: group.id, privacy: group.privacy })}
                    disabled={joinGroup.isPending}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Tham gia (+{CAMLY_REWARDS.GROUP_JOIN.toLocaleString()} 🪙)
                  </Button>
                )}

                {isPending && (
                  <Badge variant="outline" className="py-2 px-4">
                    ⏳ Đang chờ duyệt
                  </Badge>
                )}

                {isMember && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary py-2 px-4">
                      ✓ Thành viên
                      {isAdmin && ' (Admin)'}
                      {isModerator && ' (Mod)'}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Reward hint */}
              {isMember && (
                <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200/50">
                  <p className="text-sm text-amber-800">
                    💰 Đăng bài trong nhóm: <strong>+{CAMLY_REWARDS.GROUP_POST.toLocaleString()} 🪙</strong>
                    {' • '}
                    Mời bạn đăng bài: <strong>+{CAMLY_REWARDS.GROUP_INVITE_POSTED.toLocaleString()} 🪙</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
