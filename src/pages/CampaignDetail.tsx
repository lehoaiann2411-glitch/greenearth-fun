import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { ParticipantList } from '@/components/campaigns/ParticipantList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useCampaign, 
  useCampaignParticipants, 
  useUserParticipation,
  useJoinCampaign,
  useLeaveCampaign,
  useCheckIn
} from '@/hooks/useCampaigns';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { getDateLocale } from '@/lib/dateLocale';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Leaf, 
  Award,
  ArrowLeft,
  Share2,
  Settings,
  LogIn,
  LogOut,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function CampaignDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dateLocale = getDateLocale(i18n.language);
  
  const { data: campaign, isLoading } = useCampaign(id || '');
  const { data: participants } = useCampaignParticipants(id || '');
  const { data: userParticipation } = useUserParticipation(id || '');
  
  const joinMutation = useJoinCampaign();
  const leaveMutation = useLeaveCampaign();
  const checkInMutation = useCheckIn();

  const handleJoin = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (id) {
      joinMutation.mutate(id);
    }
  };

  const handleLeave = () => {
    if (id) {
      leaveMutation.mutate(id);
    }
  };

  const handleCheckIn = () => {
    if (id) {
      checkInMutation.mutate(id);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t('campaign.linkCopied'));
    } catch {
      toast.error(t('campaign.copyFailed'));
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Leaf className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('campaign.notFound')}</h2>
          <Button asChild variant="outline">
            <Link to="/campaigns">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const progress = Math.min(
    ((campaign.participants_count || 0) / campaign.target_participants) * 100,
    100
  );
  
  const isCreator = user?.id === campaign.creator_id;
  const isJoined = !!userParticipation && userParticipation.status !== 'cancelled';
  const canCheckIn = isJoined && userParticipation?.status === 'registered';
  const isCheckedIn = userParticipation?.status === 'checked_in' || userParticipation?.status === 'completed';

  return (
    <Layout>
      <div className="container py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/campaigns">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('campaign.allCampaigns')}
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden">
              {campaign.image_url ? (
                <img
                  src={campaign.image_url}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <Leaf className="h-24 w-24 text-primary/50" />
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge>{t(`categories.${campaign.category}`)}</Badge>
                <Badge variant="outline" className="bg-background/80">
                  {t(`status.${campaign.status}`)}
                </Badge>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
              
              {campaign.description && (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {campaign.description}
                </p>
              )}
            </div>

            <Separator />

            {/* Details Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('campaign.time')}</p>
                    <p className="font-medium">
                      {format(new Date(campaign.start_date), 'dd/MM/yyyy', { locale: dateLocale })}
                      {' - '}
                      {format(new Date(campaign.end_date), 'dd/MM/yyyy', { locale: dateLocale })}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('campaign.locationLabel')}</p>
                    <p className="font-medium">{campaign.location || t('campaign.notDetermined')}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('campaign.rewardLabel')}</p>
                    <p className="font-medium text-primary">+{campaign.green_points_reward} {t('campaign.greenPoints')}</p>
                  </div>
                </CardContent>
              </Card>
              
              {campaign.target_trees && campaign.target_trees > 0 && (
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Leaf className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('campaign.treeTarget')}</p>
                      <p className="font-medium">{campaign.target_trees} {t('campaign.trees')}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('campaign.participants')} ({participants?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ParticipantList participants={participants || []} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('campaign.organizer')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={campaign.creator?.avatar_url || undefined} />
                    <AvatarFallback>
                      {campaign.creator?.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{campaign.creator?.full_name || t('campaign.anonymous')}</p>
                    <p className="text-sm text-muted-foreground">{t('campaign.creator')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('campaign.progress')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('campaign.participants')}</span>
                  <span className="font-medium">
                    {campaign.participants_count || 0}/{campaign.target_participants}
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">
                  {Math.round(progress)}% {t('campaign.completed')}
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isCreator && (
                <>
                  {!isJoined ? (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleJoin}
                      disabled={joinMutation.isPending}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {joinMutation.isPending ? t('campaign.processing') : t('campaign.joinNow')}
                    </Button>
                  ) : (
                    <>
                      {canCheckIn && (
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleCheckIn}
                          disabled={checkInMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {checkInMutation.isPending ? t('campaign.processing') : t('campaign.checkIn')}
                        </Button>
                      )}
                      
                      {isCheckedIn && (
                        <Button className="w-full" size="lg" variant="secondary" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {t('campaign.checkedIn')}
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleLeave}
                        disabled={leaveMutation.isPending}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {leaveMutation.isPending ? t('campaign.processing') : t('campaign.cancelRegistration')}
                      </Button>
                    </>
                  )}
                </>
              )}
              
              {isCreator && (
                <Button variant="secondary" className="w-full" asChild>
                  <Link to={`/campaigns/${campaign.id}/manage`}>
                    <Settings className="h-4 w-4 mr-2" />
                    {t('campaign.manageCampaign')}
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                {t('campaign.share')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
