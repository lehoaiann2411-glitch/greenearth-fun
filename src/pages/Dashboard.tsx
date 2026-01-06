import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCampaigns, useMyParticipations, CATEGORY_LABELS } from '@/hooks/useCampaigns';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  TreePine, 
  Trophy, 
  Target, 
  Calendar,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { formatCamly } from '@/lib/camlyCoin';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { format } from 'date-fns';
import { vi, enUS, zhCN, es, fr, de, pt, ja, ru, ar, hi, Locale } from 'date-fns/locale';

const localeMap: Record<string, Locale> = { vi, en: enUS, zh: zhCN, es, fr, de, pt, ja, ru, ar, hi };

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: campaigns } = useCampaigns();
  const { data: myParticipations } = useMyParticipations();

  const currentLocale = localeMap[i18n.language] || enUS;

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
          <div className="mb-8 grid gap-4 md:grid-cols-3">
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

  const camlyBalance = profile.camly_balance || 0;
  const userName = user.user_metadata?.full_name || t('post.greenWarrior');

  const quickStats = [
    { icon: TreePine, label: t('impact.treesPlanted'), value: profile.trees_planted, color: 'text-green-600' },
    { icon: Trophy, label: t('impact.campaignsJoined'), value: profile.campaigns_joined, color: 'text-blue-600' },
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
              {t('dashboard.hello', { name: userName })}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {t('dashboard.welcome')}
            </p>
          </div>
          <Button asChild className="gradient-forest gap-2">
            <Link to="/campaigns">
              {t('dashboard.joinCampaign')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {/* Camly Coin Card - Featured */}
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950/50 dark:to-amber-900/50 border-yellow-200 dark:border-yellow-800">
            <CardContent className="flex items-center gap-4 p-6">
              <CamlyCoinIcon size="lg" animated />
              <div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatCamly(camlyBalance)}</p>
                <p className="text-sm text-muted-foreground">Camly Coin</p>
                <Link to="/rewards" className="text-xs text-yellow-600 hover:underline flex items-center gap-1">
                  {t('dashboard.earnMore')} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
          
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
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t('dashboard.quickActions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4" asChild>
                <Link to="/profile">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{t('dashboard.viewProfile')}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.updateInfo')}</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4" asChild>
                <Link to="/leaderboard">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                    <CamlyCoinIcon size="sm" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{t('dashboard.leaderboard')}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.topCamly')}</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4" asChild>
                <Link to="/rewards">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <CamlyCoinIcon size="sm" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{t('dashboard.rewards')}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.earnMore')}</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4" asChild>
                <Link to="/campaigns/create">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <TreePine className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{t('dashboard.createCampaign')}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.startGreen')}</p>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* My Participations or Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t('dashboard.participating')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeParticipations.length > 0 ? (
                <div className="space-y-3">
                  {activeParticipations.map((participation) => (
                    <Link
                      key={participation.id}
                      to={`/campaigns/${participation.campaign_id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <TreePine className="h-5 w-5 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{(participation as { campaign?: { title?: string } }).campaign?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {participation.status === 'registered' ? t('dashboard.waitingCheckIn') : t('dashboard.inProgress')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <TreePine className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('dashboard.noParticipation')}</p>
                  <Button asChild size="sm" className="mt-3">
                    <Link to="/campaigns">{t('dashboard.explore')}</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Campaigns */}
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t('dashboard.upcomingCampaigns')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.campaignsToJoin')}
              </CardDescription>
            </div>
            <Button variant="ghost" asChild className="gap-1">
              <Link to="/campaigns">
                {t('dashboard.viewAll')}
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
                          <span>{format(new Date(campaign.start_date), 'dd/MM/yyyy', { locale: currentLocale })}</span>
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
                      <div className="text-right flex items-center gap-1">
                        <CamlyCoinIcon size="sm" />
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">+{formatCamly(campaign.green_points_reward * 100)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('dashboard.noCampaigns')}</p>
                <Button asChild className="mt-4">
                  <Link to="/campaigns/create">{t('dashboard.createFirst')}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
