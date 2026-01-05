import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CampaignParticipant } from '@/hooks/useCampaigns';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CheckCircle, Clock, UserCheck } from 'lucide-react';

interface ParticipantListProps {
  participants: CampaignParticipant[];
}

const statusConfig = {
  registered: {
    label: 'Đã đăng ký',
    icon: Clock,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  checked_in: {
    label: 'Đã check-in',
    icon: UserCheck,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  completed: {
    label: 'Hoàn thành',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  cancelled: {
    label: 'Đã hủy',
    icon: Clock,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  },
};

export function ParticipantList({ participants }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Chưa có người tham gia
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {participants.map((participant) => {
        const status = statusConfig[participant.status];
        const StatusIcon = status.icon;
        
        return (
          <div
            key={participant.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={participant.user?.avatar_url || undefined} />
                <AvatarFallback>
                  {participant.user?.full_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {participant.user?.full_name || 'Người dùng ẩn danh'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Đăng ký {format(new Date(participant.registered_at), 'dd/MM/yyyy', { locale: vi })}
                </p>
              </div>
            </div>
            
            <Badge className={status.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
