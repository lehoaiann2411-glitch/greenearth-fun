import { useGroupMembers, usePendingMembers, useApproveMember, useRejectMember, GroupMember } from '@/hooks/useGroups';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Crown, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GroupMembersListProps {
  groupId: string;
  isAdmin?: boolean;
}

function MemberItem({ member, groupId, isAdmin, isPending }: { 
  member: GroupMember; 
  groupId: string;
  isAdmin?: boolean;
  isPending?: boolean;
}) {
  const approveMember = useApproveMember();
  const rejectMember = useRejectMember();

  const roleIcons = {
    admin: <Crown className="h-4 w-4 text-amber-500" />,
    moderator: <Shield className="h-4 w-4 text-blue-500" />,
    member: null,
  };

  const roleLabels = {
    admin: 'Quản trị viên',
    moderator: 'Điều hành viên',
    member: 'Thành viên',
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <Link to={`/profile?id=${member.user_id}`} className="flex items-center gap-3 hover:opacity-80">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.profile?.avatar_url || ''} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {member.profile?.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {member.profile?.full_name || 'Người dùng'}
            </span>
            {roleIcons[member.role]}
          </div>
          <span className="text-xs text-muted-foreground">
            {roleLabels[member.role]}
          </span>
        </div>
      </Link>

      {isPending && isAdmin && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => approveMember.mutate({ memberId: member.id, groupId })}
            disabled={approveMember.isPending}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => rejectMember.mutate({ memberId: member.id, groupId })}
            disabled={rejectMember.isPending}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function GroupMembersList({ groupId, isAdmin = false }: GroupMembersListProps) {
  const { data: members, isLoading } = useGroupMembers(groupId);
  const { data: pendingMembers } = usePendingMembers(groupId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  const admins = members?.filter(m => m.role === 'admin') || [];
  const moderators = members?.filter(m => m.role === 'moderator') || [];
  const regularMembers = members?.filter(m => m.role === 'member') || [];

  return (
    <div className="space-y-6">
      {/* Pending Members (Admin only) */}
      {isAdmin && pendingMembers && pendingMembers.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {pendingMembers.length}
              </Badge>
              Yêu cầu tham gia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingMembers.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                groupId={groupId}
                isAdmin={isAdmin}
                isPending
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Admins */}
      {admins.length > 0 && (
        <Card className="border-white/20 bg-white/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Quản trị viên ({admins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {admins.map((member) => (
              <MemberItem key={member.id} member={member} groupId={groupId} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Moderators */}
      {moderators.length > 0 && (
        <Card className="border-white/20 bg-white/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Điều hành viên ({moderators.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {moderators.map((member) => (
              <MemberItem key={member.id} member={member} groupId={groupId} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Regular Members */}
      <Card className="border-white/20 bg-white/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Thành viên ({regularMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {regularMembers.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Chưa có thành viên nào
            </p>
          ) : (
            regularMembers.map((member) => (
              <MemberItem key={member.id} member={member} groupId={groupId} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
