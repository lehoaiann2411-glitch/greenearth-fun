import { TreePine, Leaf, Award, Hexagon, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCO2, formatArea } from '@/lib/carbonCalculations';
import { useUserBadges } from '@/hooks/useBadges';

interface PersonalImpactProps {
  stats: {
    treesPlanted: number;
    co2Absorbed: number;
    forestArea: number;
    greenPoints: number;
    campaignsJoined: number;
    nftsOwned: number;
    greenReputation: number;
  } | null | undefined;
  isLoading: boolean;
}

export function PersonalImpact({ stats, isLoading }: PersonalImpactProps) {
  const { data: userBadges } = useUserBadges();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Không có dữ liệu</p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: 'Cây đã trồng',
      value: stats.treesPlanted.toString(),
      icon: TreePine,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'CO₂ hấp thụ/năm',
      value: formatCO2(stats.co2Absorbed),
      icon: Leaf,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Điểm xanh',
      value: stats.greenPoints.toLocaleString(),
      icon: Star,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Chiến dịch',
      value: stats.campaignsJoined.toString(),
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Green NFTs',
      value: stats.nftsOwned.toString(),
      icon: Hexagon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Uy tín xanh',
      value: stats.greenReputation.toString(),
      icon: TrendingUp,
      color: 'text-teal-600',
      bgColor: 'bg-teal-500/10',
    },
  ];

  // Calculate next milestone
  const nextTreeMilestone = Math.ceil((stats.treesPlanted + 1) / 10) * 10;
  const treeProgress = (stats.treesPlanted / nextTreeMilestone) * 100;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress to next milestone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tiến độ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Mốc tiếp theo: {nextTreeMilestone} cây
              </span>
              <span className="text-sm font-medium">
                {stats.treesPlanted}/{nextTreeMilestone}
              </span>
            </div>
            <Progress value={treeProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Earned Badges */}
      {userBadges && userBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Huy hiệu đã đạt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {userBadges.map((ub) => (
                <div
                  key={ub.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 text-primary"
                >
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {ub.badge?.name_vi || ub.badge?.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
