import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useCampaign, 
  useCampaignParticipants,
  useUpdateCampaign,
  useUpdateParticipant,
  CampaignStatus,
  ParticipantStatus,
  STATUS_LABELS
} from '@/hooks/useCampaigns';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Users, 
  CheckCircle,
  Clock,
  UserCheck,
  Settings
} from 'lucide-react';

const participantStatusConfig = {
  registered: { label: 'Đã đăng ký', icon: Clock, className: 'bg-blue-100 text-blue-800' },
  checked_in: { label: 'Đã check-in', icon: UserCheck, className: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Hoàn thành', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', icon: Clock, className: 'bg-gray-100 text-gray-800' },
};

export default function CampaignManage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: campaign, isLoading } = useCampaign(id || '');
  const { data: participants } = useCampaignParticipants(id || '');
  
  const updateCampaignMutation = useUpdateCampaign();
  const updateParticipantMutation = useUpdateParticipant();

  const handleStatusChange = (newStatus: CampaignStatus) => {
    if (id) {
      updateCampaignMutation.mutate({ id, updates: { status: newStatus } });
    }
  };

  const handleParticipantStatusChange = (participantId: string, newStatus: ParticipantStatus) => {
    updateParticipantMutation.mutate({ 
      participantId, 
      updates: { status: newStatus } 
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h2 className="text-xl font-semibold mb-4">Không tìm thấy chiến dịch</h2>
          <Button asChild>
            <Link to="/campaigns">Quay lại</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Check if user is the creator
  if (user?.id !== campaign.creator_id) {
    navigate(`/campaigns/${id}`);
    return null;
  }

  const stats = {
    total: participants?.length || 0,
    registered: participants?.filter(p => p.status === 'registered').length || 0,
    checked_in: participants?.filter(p => p.status === 'checked_in').length || 0,
    completed: participants?.filter(p => p.status === 'completed').length || 0,
  };

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to={`/campaigns/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại chi tiết
          </Link>
        </Button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Settings className="h-6 w-6" />
              Quản lý: {campaign.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý người tham gia và cập nhật trạng thái chiến dịch
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Trạng thái:</span>
            <Select value={campaign.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng đăng ký</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chờ check-in</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.registered}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Đã check-in</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.checked_in}</p>
                </div>
                <UserCheck className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hoàn thành</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants Management */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách người tham gia</CardTitle>
            <CardDescription>
              Quản lý trạng thái và xác nhận hoàn thành cho người tham gia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {participants && participants.length > 0 ? (
              <div className="space-y-3">
                {participants.map((participant) => {
                  const status = participantStatusConfig[participant.status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
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
                            {participant.user?.full_name || 'Ẩn danh'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Đăng ký: {format(new Date(participant.registered_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </p>
                          {participant.checked_in_at && (
                            <p className="text-sm text-muted-foreground">
                              Check-in: {format(new Date(participant.checked_in_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={status.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        
                        <Select
                          value={participant.status}
                          onValueChange={(value) => handleParticipantStatusChange(participant.id, value as ParticipantStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Cập nhật" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="registered">Đã đăng ký</SelectItem>
                            <SelectItem value="checked_in">Đã check-in</SelectItem>
                            <SelectItem value="completed">Hoàn thành</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có người tham gia
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
