import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Coins,
  History,
  Gift,
  TreePine,
  Heart,
  Share2,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  Wallet,
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
import { CoinAnimation } from '@/components/rewards/CoinAnimation';
import { PointsDisplay } from '@/components/rewards/PointsDisplay';
import { ClaimModal } from '@/components/rewards/ClaimModal';
import {
  toCamlyCoin,
  getClaimableAmount,
  canClaim,
  POINTS_CONFIG,
  getActionLabel,
  GREEN_POINTS_PER_CAMLY,
} from '@/lib/camlyCoin';

const earnActions = [
  { key: 'PLANT_TREE', icon: TreePine, color: 'text-green-500' },
  { key: 'DONATE_PER_USD', icon: Heart, color: 'text-red-500', suffix: '/USD' },
  { key: 'DAILY_CHECK_IN', icon: CheckCircle, color: 'text-blue-500' },
  { key: 'COMPLETE_QUEST', icon: Gift, color: 'text-purple-500' },
  { key: 'SHARE_POST', icon: Share2, color: 'text-orange-500' },
  { key: 'VERIFY_TREE_GROWTH', icon: Sparkles, color: 'text-emerald-500' },
  { key: 'TOP_CONTRIBUTOR_BONUS', icon: Coins, color: 'text-yellow-500' },
];

export default function Rewards() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: pointsHistory, isLoading: historyLoading } = usePointsHistory();
  const { data: claimsHistory, isLoading: claimsLoading } = useClaimsHistory();

  const [claimModalOpen, setClaimModalOpen] = useState(false);

  const isLoading = authLoading || profileLoading;
  const language = i18n.language as 'en' | 'vi';

  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
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

  const greenPoints = profile?.green_points || 0;
  const totalCamlyClaimed = profile?.total_camly_claimed || 0;
  const { points: claimablePoints, camly: claimableCamly } = getClaimableAmount(greenPoints);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CoinAnimation size="lg" animated />
            {t('rewards.title', 'Rewards & Wallet')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('rewards.subtitle', 'Earn Green Points and claim CAMLY tokens')}
          </p>
        </div>

        {/* Wallet Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                {isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <CoinAnimation size="md" animated={false} />
                      <div>
                        <p className="text-sm text-muted-foreground">Green Points</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {greenPoints.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ≈ {toCamlyCoin(greenPoints).toLocaleString()} CAMLY
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                {isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <Wallet className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t('rewards.totalClaimed', 'Total Claimed')}
                        </p>
                        <p className="text-2xl font-bold">{totalCamlyClaimed.toLocaleString()} CAMLY</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {claimsHistory?.length || 0} {t('rewards.transactions', 'transactions')}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-dashed border-green-300 dark:border-green-700">
              <CardContent className="p-6">
                {isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('rewards.readyToClaim', 'Ready to Claim')}
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">
                      {claimableCamly.toLocaleString()} CAMLY
                    </p>
                    <Button
                      onClick={() => setClaimModalOpen(true)}
                      disabled={!canClaim(greenPoints)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Coins className="mr-2 h-4 w-4" />
                      {t('rewards.claimNow', 'Claim CAMLY')}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
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

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>{t('rewards.pointsHistory', 'Points History')}</CardTitle>
                <CardDescription>
                  {t('rewards.recentEarnings', 'Your recent point earnings')}
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
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Coins className="h-5 w-5 text-green-600 dark:text-green-400" />
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
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            +{item.points_earned} GP
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ≈ {item.camly_equivalent} CAMLY
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{t('rewards.noHistory', 'No point history yet')}</p>
                    <p className="text-sm">
                      {t('rewards.startEarning', 'Start earning points by completing actions!')}
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
                          <CoinAnimation size="sm" animated={false} />
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
                      {t('rewards.claimInfo', 'Claim your CAMLY tokens when you have enough points!')}
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
                  {t('rewards.howToEarnTitle', 'How to Earn Green Points')}
                </CardTitle>
                <CardDescription>
                  {GREEN_POINTS_PER_CAMLY} Green Points = 1 CAMLY Token
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {earnActions.map(({ key, icon: Icon, color, suffix }) => {
                    const points = POINTS_CONFIG[key as keyof typeof POINTS_CONFIG];
                    const camly = toCamlyCoin(points);
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full bg-background ${color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="font-medium">
                            {getActionLabel(key.toLowerCase(), language)}
                            {suffix && <span className="text-muted-foreground">{suffix}</span>}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            +{points} GP
                          </p>
                          <p className="text-xs text-muted-foreground">≈ {camly} CAMLY</p>
                        </div>
                      </motion.div>
                    );
                  })}
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
                          'Complete daily quests and participate in campaigns to maximize your earnings!'
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

      <ClaimModal
        open={claimModalOpen}
        onOpenChange={setClaimModalOpen}
        greenPoints={greenPoints}
        walletAddress={profile?.wallet_address || ''}
      />
    </Layout>
  );
}
