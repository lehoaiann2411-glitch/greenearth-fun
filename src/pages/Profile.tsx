import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserRank } from '@/hooks/useLeaderboard';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Leaf, 
  TreePine, 
  Trophy, 
  MapPin,
  Edit,
  Award,
  Target,
  Calendar,
  Coins,
  ArrowRight,
} from 'lucide-react';
import { getRankByPoints, getNextRank, getProgressToNextRank, getPointsToNextRank } from '@/lib/greenRanks';
import { toCamlyCoin, canClaim } from '@/lib/camlyCoin';
import { CoinAnimation } from '@/components/rewards/CoinAnimation';
import { ClaimModal } from '@/components/rewards/ClaimModal';

export default function Profile() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: userRank } = useUserRank(user?.id);
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <div className="mx-auto max-w-4xl space-y-8">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !profile) return null;

  const currentRank = getRankByPoints(profile.green_points);
  const nextRank = getNextRank(currentRank);
  const progress = getProgressToNextRank(profile.green_points);
  const pointsToNext = getPointsToNextRank(profile.green_points);
  const RankIcon = currentRank.icon;
  const camlyCoin = toCamlyCoin(profile.green_points);

  const stats = [
    { 
      icon: Leaf, 
      label: t('impact.greenPoints'), 
      value: profile.green_points, 
      color: 'text-primary',
      subLabel: `≈ ${camlyCoin} CAMLY`
    },
    { icon: TreePine, label: t('impact.treesPlanted'), value: profile.trees_planted, color: 'text-accent' },
    { icon: Trophy, label: t('impact.campaignsJoined'), value: profile.campaigns_joined, color: 'text-sky' },
  ];

  const badges = [
    { name: t('badges.pioneer', 'Người tiên phong'), icon: Award, earned: profile.campaigns_joined >= 1 },
    { name: t('badges.protector', 'Nhà bảo vệ'), icon: TreePine, earned: profile.trees_planted >= 5 },
    { name: t('badges.warrior', 'Chiến binh xanh'), icon: Target, earned: profile.green_points >= 500 },
  ];

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Profile Header Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 gradient-forest opacity-10" />
            <CardContent className="relative p-6 md:p-8">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                    <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                      {profile.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full ${currentRank.bgClass} ${currentRank.colorClass} ring-4 ring-background`}>
                    <RankIcon className="h-5 w-5" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col items-center gap-3 md:flex-row">
                    <h1 className="font-display text-2xl font-bold md:text-3xl">
                      {profile.full_name || 'Người dùng Green Earth'}
                    </h1>
                    <Badge variant="secondary" className={currentRank.colorClass}>
                      {currentRank.name}
                    </Badge>
                  </div>
                  
                  {profile.bio && (
                    <p className="mt-2 text-muted-foreground">{profile.bio}</p>
                  )}
                  
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground md:justify-start">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Tham gia {new Date(profile.created_at).toLocaleDateString('vi-VN')}
                    </span>
                    {userRank && (
                      <span className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Hạng #{userRank}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/profile/edit">
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    {stat.subLabel && (
                      <p className="text-xs text-green-600 dark:text-green-400">{stat.subLabel}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Camly Coin Card */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CoinAnimation size="md" animated />
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{camlyCoin}</p>
                    <p className="text-sm text-muted-foreground">CAMLY</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setClaimModalOpen(true)}
                  disabled={!canClaim(profile.green_points)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Coins className="mr-2 h-4 w-4" />
                  {t('rewards.claimCamly', 'Claim CAMLY')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Rank Progress */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RankIcon className={`h-5 w-5 ${currentRank.colorClass}`} />
                Tiến độ thăng hạng
              </CardTitle>
              <CardDescription>
                {nextRank 
                  ? `Còn ${pointsToNext} điểm để đạt cấp ${nextRank.name}`
                  : 'Bạn đã đạt cấp bậc cao nhất!'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className={currentRank.colorClass}>{currentRank.name}</span>
                {nextRank && (
                  <span className="text-muted-foreground">{nextRank.name}</span>
                )}
              </div>
              <Progress value={progress} className="mt-2 h-3" />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {profile.green_points} / {nextRank?.minPoints || profile.green_points} điểm
              </p>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Huy hiệu
              </CardTitle>
              <CardDescription>
                Các thành tựu bạn đã đạt được
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {badges.map((badge) => (
                  <div
                    key={badge.name}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                      badge.earned
                        ? 'border-primary/30 bg-primary/5'
                        : 'opacity-40 grayscale'
                    }`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      badge.earned ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <badge.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium">{badge.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/rewards">
                <Coins className="h-4 w-4" />
                {t('nav.rewards', 'Rewards')}
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/leaderboard">
                <Trophy className="h-4 w-4" />
                {t('nav.leaderboard', 'Leaderboard')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <ClaimModal
        open={claimModalOpen}
        onOpenChange={setClaimModalOpen}
        greenPoints={profile.green_points}
        walletAddress={profile.wallet_address || ''}
      />
    </Layout>
  );
}
