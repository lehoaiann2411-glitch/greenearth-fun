import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCampaigns, useMyParticipations, CATEGORY_LABELS } from '@/hooks/useCampaigns';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  TreePine, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { getRankByPoints, getNextRank, getProgressToNextRank, getPointsToNextRank } from '@/lib/greenRanks';
import { formatCamly } from '@/lib/camlyCoin';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: campaigns } = useCampaigns();
  const { data: myParticipations } = useMyParticipations();

  const dateLocale = i18n.language === 'vi' ? vi : enUS;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <div className="mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="mt-2 h-5 w-48" />
          </div>
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            <Skeleton className="h-48 w-full lg:col-span-2" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !profile) return null;

  const currentRank = getRankByPoints(profile.green_points);
  const nextRank = getNextRank(currentRank);
  const progressToNextRank = getProgressToNextRank(profile.green_points);
  const pointsToNext = getPointsToNextRank(profile.green_points);
  const RankIcon = currentRank.icon;
  const camlyBalance = profile.camly_balance || 0;

  const quickStats = [
    { icon: TreePine, label: t('impact.treesPlanted'), value: profile.trees_planted, color: 'text-accent' },
    { icon: Trophy, label: t('impact.campaignsJoined'), value: profile.campaigns_joined, color: 'text-sky' },
    { icon: Leaf, label: t('impact.greenPoints'), value: profile.green_points, color: 'text-primary' },
  ];

  // Get upcoming campaigns (first 3)
  const upcomingCampaigns = campaigns?.slice(0, 3) || [];
  
  // Get user's current participations
  const activeParticipations = myParticipations?.filter(
    p => p.status !== 'cancelled' && p.status !== 'completed'
  ).slice(0, 3) || [];

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              Xin chào, {user.user_metadata?.full_name || 'Người bạn xanh'}! 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              Chào mừng bạn quay trở lại Green Earth
            </p>
          </div>
          <Button asChild className="gradient-forest gap-2">
            <Link to="/campaigns">
              Tham gia chiến dịch
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Camly Coin Card */}
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950/50 dark:to-amber-900/50 border-yellow-200 dark:border-yellow-800">
            <CardContent className="flex items-center gap-4 p-6">
              <CamlyCoinIcon size="lg" animated />
              <div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatCamly(camlyBalance)}</p>
                <p className="text-sm text-muted-foreground">Camly Coin</p>
                <Link to="/rewards" className="text-xs text-yellow-600 hover:underline flex items-center gap-1">
                  {t('rewards.howToEarn', 'Earn more')} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Rank Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RankIcon className={`h-5 w-5 ${currentRank.colorClass}`} />
                Cấp bậc của bạn
              </CardTitle>
              <CardDescription>
                Tiến độ thăng hạng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full ${currentRank.bgClass}`}>
                    <RankIcon className={`h-8 w-8 ${currentRank.colorClass}`} />
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold">{currentRank.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.green_points} / {nextRank?.minPoints || profile.green_points} điểm
                    </p>
                  </div>
                </div>
                {nextRank && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Cấp tiếp theo</p>
                    <p className="font-medium text-primary">{nextRank.name}</p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <Progress value={progressToNextRank} className="h-3" />
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {nextRank ? `Còn ${pointsToNext} điểm để lên cấp` : 'Bạn đã đạt cấp cao nhất!'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                Hành động nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link to="/profile">
                  <TrendingUp className="h-4 w-4" />
                  Xem hồ sơ
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link to="/leaderboard">
                  <Trophy className="h-4 w-4" />
                  Bảng xếp hạng
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Participations */}
        {activeParticipations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Chiến dịch đang tham gia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeParticipations.map((participation) => (
                  <Link
                    key={participation.id}
                    to={`/campaigns/${participation.campaign_id}`}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <TreePine className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{(participation as { campaign?: { title?: string } }).campaign?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Trạng thái: {participation.status === 'registered' ? 'Đã đăng ký' : 'Đã check-in'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {participation.status === 'registered' ? 'Chờ check-in' : 'Đang tham gia'}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Campaigns */}
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-sky" />
                Chiến dịch sắp tới
              </CardTitle>
              <CardDescription>
                Các chiến dịch bạn có thể tham gia
              </CardDescription>
            </div>
            <Button variant="ghost" asChild className="gap-1">
              <Link to="/campaigns">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingCampaigns.length > 0 ? (
              <div className="space-y-4">
                {upcomingCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    to={`/campaigns/${campaign.id}`}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <TreePine className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{campaign.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{format(new Date(campaign.start_date), 'dd/MM/yyyy', { locale: vi })}</span>
                          {campaign.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {campaign.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{CATEGORY_LABELS[campaign.category]}</Badge>
                      <div className="text-right">
                        <p className="font-medium text-primary">+{campaign.green_points_reward}</p>
                        <p className="text-xs text-muted-foreground">điểm</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có chiến dịch nào</p>
                <Button asChild className="mt-4">
                  <Link to="/campaigns/create">Tạo chiến dịch đầu tiên</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
