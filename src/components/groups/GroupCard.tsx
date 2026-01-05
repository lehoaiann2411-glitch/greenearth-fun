import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Lock, Globe, MapPin, Coins } from 'lucide-react';
import { Group, useJoinGroup, useGroupMembership, useLeaveGroup } from '@/hooks/useGroups';
import { useAuth } from '@/contexts/AuthContext';
import { CAMLY_REWARDS } from '@/lib/camlyCoin';
import { motion } from 'framer-motion';
import { CamlyCoinInline } from '@/components/rewards/CamlyCoinIcon';

interface GroupCardProps {
  group: Group;
  showJoinButton?: boolean;
}

export function GroupCard({ group, showJoinButton = true }: GroupCardProps) {
  const { user } = useAuth();
  const { data: membership } = useGroupMembership(group.id);
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  const isMember = membership?.status === 'approved';
  const isPending = membership?.status === 'pending';

  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    joinGroup.mutate({ groupId: group.id, privacy: group.privacy });
  };

  const handleLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    leaveGroup.mutate(group.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/groups/${group.id}`}>
        <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-white/20 bg-white/80 backdrop-blur-sm hover:bg-white cursor-pointer">
          {/* Cover Image */}
          <div className="relative h-32 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 overflow-hidden">
            {group.cover_image_url ? (
              <img
                src={group.cover_image_url}
                alt={group.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-5xl">{group.icon_emoji || '🌳'}</span>
              </div>
            )}
            
            {/* Privacy Badge */}
            <Badge 
              variant={group.privacy === 'public' ? 'secondary' : 'outline'}
              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm"
            >
              {group.privacy === 'public' ? (
                <><Globe className="h-3 w-3 mr-1" /> Công khai</>
              ) : (
                <><Lock className="h-3 w-3 mr-1" /> Riêng tư</>
              )}
            </Badge>

            {/* Featured Badge */}
            {group.is_featured && (
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                ⭐ Nổi bật
              </Badge>
            )}
          </div>

          <CardContent className="p-4">
            {/* Group Info */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl shadow-sm">
                {group.icon_emoji || '🌳'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {group.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{group.members_count.toLocaleString()} thành viên</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {group.description && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                {group.description}
              </p>
            )}

            {/* Location & Stats */}
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              {group.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {group.location}
                </span>
              )}
              <span>{group.posts_count} bài viết</span>
            </div>

            {/* Actions */}
            {showJoinButton && user && (
              <div className="mt-4">
                {isMember ? (
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      ✓ Thành viên
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleLeave}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Rời nhóm
                    </Button>
                  </div>
                ) : isPending ? (
                  <Badge variant="outline" className="w-full justify-center py-2">
                    Đang chờ duyệt...
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleJoin}
                    disabled={joinGroup.isPending}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Tham gia (+{CAMLY_REWARDS.GROUP_JOIN.toLocaleString()} <CamlyCoinInline />)
                  </Button>
                )}
              </div>
            )}

            {/* Reward hint */}
            {!isMember && !isPending && (
              <p className="mt-2 text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                +{CAMLY_REWARDS.GROUP_POST.toLocaleString()} <CamlyCoinInline /> mỗi bài đăng trong nhóm
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
