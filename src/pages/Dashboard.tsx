import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Leaf, 
  TreePine, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { getRankByPoints, getNextRank, getProgressToNextRank, getPointsToNextRank } from '@/lib/greenRanks';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();

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

  const currentRank = getRankByPoints(profile.green_points);
  const nextRank = getNextRank(currentRank);
  const progressToNextRank = getProgressToNextRank(profile.green_points);
  const pointsToNext = getPointsToNextRank(profile.green_points);
  const RankIcon = currentRank.icon;

  const quickStats = [
    { icon: Leaf, label: 'Điểm Xanh', value: profile.green_points, color: 'text-primary' },
    { icon: TreePine, label: 'Cây đã trồng', value: profile.trees_planted, color: 'text-accent' },
    { icon: Trophy, label: 'Chiến dịch', value: profile.campaigns_joined, color: 'text-sky' },
  ];

  const upcomingCampaigns = [
    { id: 1, title: 'Trồng cây tại Sóc Sơn', date: '15/01/2026', points: 50 },
    { id: 2, title: 'Dọn rác bãi biển Đà Nẵng', date: '20/01/2026', points: 30 },
    { id: 3, title: 'Workshop tái chế', date: '25/01/2026', points: 20 },
  ];

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

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
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
                <Link to="/nft-gallery">
                  <TreePine className="h-4 w-4" />
                  Bộ sưu tập NFT
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
            <div className="space-y-4">
              {upcomingCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <TreePine className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{campaign.title}</p>
                      <p className="text-sm text-muted-foreground">{campaign.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-primary">+{campaign.points}</p>
                      <p className="text-xs text-muted-foreground">điểm</p>
                    </div>
                    <Button size="sm">Tham gia</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
