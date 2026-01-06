import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  ParticipantStatus
} from '@/hooks/useCampaigns';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { getDateLocale } from '@/lib/dateLocale';
import { 
  ArrowLeft, 
  Users, 
  CheckCircle,
  Clock,
  UserCheck,
  Settings
} from 'lucide-react';

const STATUS_OPTIONS: { value: CampaignStatus; labelKey: string }[] = [
  { value: 'draft', labelKey: 'status.draft' },
  { value: 'pending', labelKey: 'status.pending' },
  { value: 'active', labelKey: 'status.active' },
  { value: 'completed', labelKey: 'status.completed' },
  { value: 'cancelled', labelKey: 'status.cancelled' },
];

export default function CampaignManage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dateLocale = getDateLocale(i18n.language);
  
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

  const getParticipantStatusConfig = (status: ParticipantStatus) => {
    const configs: Record<ParticipantStatus, { labelKey: string; icon: typeof Clock; className: string }> = {
      registered: { labelKey: 'participant.statusRegistered', icon: Clock, className: 'bg-blue-100 text-blue-800' },
      checked_in: { labelKey: 'participant.statusCheckedIn', icon: UserCheck, className: 'bg-yellow-100 text-yellow-800' },
      completed: { labelKey: 'participant.statusCompleted', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      cancelled: { labelKey: 'participant.statusCancelled', icon: Clock, className: 'bg-gray-100 text-gray-800' },
    };
    return configs[status];
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
          <h2 className="text-xl font-semibold mb-4">{t('campaign.notFound')}</h2>
          <Button asChild>
            <Link to="/campaigns">{t('common.back')}</Link>
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
            {t('campaign.backToDetail')}
          </Link>
        </Button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Settings className="h-6 w-6" />
              {t('campaign.manageTitle')} {campaign.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('campaign.manageDesc')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{t('campaign.statusLabel')}</span>
            <Select value={campaign.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
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
                  <p className="text-sm text-muted-foreground">{t('campaign.totalRegistered')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('campaign.waitingCheckIn')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('participant.statusCheckedIn')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('participant.statusCompleted')}</p>
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
            <CardTitle>{t('campaign.participantList')}</CardTitle>
            <CardDescription>
              {t('campaign.participantListDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {participants && participants.length > 0 ? (
              <div className="space-y-3">
                {participants.map((participant) => {
                  const statusConfig = getParticipantStatusConfig(participant.status);
                  const StatusIcon = statusConfig.icon;
                  
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
                            {participant.user?.full_name || t('common.anonymous')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t('campaign.registered')} {format(new Date(participant.registered_at), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
                          </p>
                          {participant.checked_in_at && (
                            <p className="text-sm text-muted-foreground">
                              Check-in: {format(new Date(participant.checked_in_at), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={statusConfig.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {t(statusConfig.labelKey)}
                        </Badge>
                        
                        <Select
                          value={participant.status}
                          onValueChange={(value) => handleParticipantStatusChange(participant.id, value as ParticipantStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder={t('campaign.update')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="registered">{t('participant.statusRegistered')}</SelectItem>
                            <SelectItem value="checked_in">{t('participant.statusCheckedIn')}</SelectItem>
                            <SelectItem value="completed">{t('participant.statusCompleted')}</SelectItem>
                            <SelectItem value="cancelled">{t('participant.statusCancelled')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t('campaign.noParticipants')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
