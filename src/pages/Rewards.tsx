import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  History,
  Gift,
  TreePine,
  Heart,
  Share2,
  FileText,
  Calendar,
  UserPlus,
  Sparkles,
  Copy,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { usePointsHistory, useClaimsHistory } from '@/hooks/usePointsHistory';
import { useToast } from '@/hooks/use-toast';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { CoinAnimation } from '@/components/rewards/CoinAnimation';
import { DailyCheckIn } from '@/components/rewards/DailyCheckIn';
import { EarningsBreakdown } from '@/components/rewards/EarningsBreakdown';
import {
  CAMLY_REWARDS,
  DAILY_LIMITS,
  formatCamly,
  getActionLabel,
} from '@/lib/camlyCoin';

const earnActions = [
  { 
    key: 'CREATE_POST', 
    icon: FileText, 
    color: 'text-blue-500',
    reward: CAMLY_REWARDS.CREATE_POST,
    limit: 'Unlimited',
    limitVi: 'Không giới hạn'
  },
  { 
    key: 'SHARE_POST', 
    icon: Share2, 
    color: 'text-orange-500',
    reward: CAMLY_REWARDS.SHARE_POST,
    limit: `${DAILY_LIMITS.SHARES}/day`,
    limitVi: `${DAILY_LIMITS.SHARES}/ngày`
  },
  { 
    key: 'LIKE_POST', 
    icon: Heart, 
    color: 'text-pink-500',
    reward: CAMLY_REWARDS.LIKE_POST,
    limit: `${DAILY_LIMITS.LIKES}/day`,
    limitVi: `${DAILY_LIMITS.LIKES}/ngày`
  },
  { 
    key: 'DAILY_CHECK_IN', 
    icon: Calendar, 
    color: 'text-emerald-500',
    reward: CAMLY_REWARDS.DAILY_CHECK_IN,
    limit: '1/day',
    limitVi: '1/ngày'
  },
  { 
    key: 'STREAK_7_DAY_BONUS', 
    icon: Sparkles, 
    color: 'text-yellow-500',
    reward: CAMLY_REWARDS.STREAK_7_DAY_BONUS,
    limit: 'Weekly',
    limitVi: 'Hàng tuần'
  },
  { 
    key: 'PLANT_TREE', 
    icon: TreePine, 
    color: 'text-green-500',
    reward: CAMLY_REWARDS.PLANT_TREE,
    limit: 'Unlimited',
    limitVi: 'Không giới hạn'
  },
  { 
    key: 'INVITE_FRIEND', 
    icon: UserPlus, 
    color: 'text-purple-500',
    reward: CAMLY_REWARDS.INVITE_FRIEND,
    limit: 'Unlimited',
    limitVi: 'Không giới hạn'
  },
  { 
    key: 'SIGNUP_BONUS', 
    icon: Gift, 
    color: 'text-cyan-500',
    reward: CAMLY_REWARDS.SIGNUP_BONUS,
    limit: 'One-time',
    limitVi: 'Một lần'
  },
];

export default function Rewards() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: pointsHistory, isLoading: historyLoading } = usePointsHistory();
  const { data: claimsHistory, isLoading: claimsLoading } = useClaimsHistory();

  const isLoading = authLoading || profileLoading;
  const language = i18n.language as 'en' | 'vi';

  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <CamlyCoinIcon size="xl" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('common.loginRequired', 'Login Required')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('rewards.loginToView', 'Please login to view your rewards')}
          </p>
          <Button onClick={() => navigate('/auth')}>
            {t('nav.login', 'Login')}
          </Button>
        </div>
      </Layout>
    );
  }

  const camlyBalance = profile?.camly_balance || 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CamlyCoinIcon size="lg" animated />
            {t('rewards.title', 'Rewards & Wallet')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('rewards.subtitle', 'Earn Camly Coin for your green actions')}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="overview">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t('rewards.overview', 'Overview')}
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              {t('rewards.history', 'History')}
            </TabsTrigger>
            <TabsTrigger value="claims">
              <Wallet className="h-4 w-4 mr-2" />
              {t('rewards.claims', 'Claims')}
            </TabsTrigger>
            <TabsTrigger value="earn">
              <Gift className="h-4 w-4 mr-2" />
              {t('rewards.howToEarn', 'How to Earn')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Earnings Breakdown */}
              <EarningsBreakdown />
              
              {/* Daily Check-in */}
              <DailyCheckIn />
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>{t('rewards.pointsHistory', 'Rewards History')}</CardTitle>
                <CardDescription>
                  {t('rewards.recentEarnings', 'Your recent Camly Coin earnings')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : pointsHistory && pointsHistory.length > 0 ? (
                  <div className="space-y-3">
                    {pointsHistory.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <CamlyCoinIcon size="sm" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {getActionLabel(item.action_type, language)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-1 justify-end">
                            +{formatCamly(item.camly_equivalent || item.camly_earned || 0)} <CamlyCoinIcon size="xs" />
                          </p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{t('rewards.noHistory', 'No rewards yet')}</p>
                    <p className="text-sm">
                      {t('rewards.startEarning', 'Start earning Camly Coin by completing actions!')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle>{t('rewards.claimHistory', 'Claim History')}</CardTitle>
                <CardDescription>
                  {t('rewards.yourClaims', 'Your CAMLY token claims')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {claimsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : claimsHistory && claimsHistory.length > 0 ? (
                  <div className="space-y-3">
                    {claimsHistory.map((claim) => (
                      <div
                        key={claim.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <CamlyCoinIcon size="sm" />
                          <div>
                            <p className="font-medium">
                              {claim.camly_received.toLocaleString()} CAMLY
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(claim.created_at), 'MMM d, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={claim.status === 'completed' ? 'default' : 'secondary'}
                            className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          >
                            {claim.status}
                          </Badge>
                          {claim.transaction_hash && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(claim.transaction_hash!);
                                toast({ title: 'Copied!' });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{t('rewards.noClaims', 'No claims yet')}</p>
                    <p className="text-sm">
                      {t('rewards.claimInfo', 'Claim your CAMLY tokens when you have enough!')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earn">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  {t('rewards.howToEarnTitle', 'How to Earn Camly Coin')}
                </CardTitle>
                <CardDescription>
                  {language === 'vi' 
                    ? 'Kiếm Camly Coin trực tiếp cho mỗi hành động!'
                    : 'Earn Camly Coin directly for each action!'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {earnActions.map(({ key, icon: Icon, color, reward, limit, limitVi }, index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-background ${color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-medium block">
                            {getActionLabel(key.toLowerCase(), language)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {language === 'vi' ? limitVi : limit}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1 justify-end">
                          +{formatCamly(reward)} <CamlyCoinIcon size="xs" />
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-300">
                        {t('rewards.tip', 'Pro Tip')}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {t(
                          'rewards.tipDescription',
                          'Post, share, and engage with the community to maximize your earnings!'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
