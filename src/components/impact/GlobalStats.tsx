import { TreePine, Leaf, Users, Award, Hexagon, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCO2, formatArea } from '@/lib/carbonCalculations';

interface GlobalStatsProps {
  stats: {
    totalTrees: number;
    totalCO2: number;
    totalForestArea: number;
    totalUsers: number;
    totalCampaigns: number;
    totalNFTs: number;
  } | undefined;
  isLoading: boolean;
}

export function GlobalStats({ stats, isLoading }: GlobalStatsProps) {
  const statCards = [
    {
      title: 'Tổng cây đã trồng',
      value: stats?.totalTrees.toLocaleString() || '0',
      icon: TreePine,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'CO₂ hấp thụ/năm',
      value: stats ? formatCO2(stats.totalCO2) : '0 kg',
      icon: Leaf,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Diện tích rừng',
      value: stats ? formatArea(stats.totalForestArea) : '0 m²',
      icon: TrendingUp,
      color: 'text-teal-600',
      bgColor: 'bg-teal-500/10',
    },
    {
      title: 'Thành viên',
      value: stats?.totalUsers.toLocaleString() || '0',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Chiến dịch hoạt động',
      value: stats?.totalCampaigns.toLocaleString() || '0',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Green NFTs',
      value: stats?.totalNFTs.toLocaleString() || '0',
      icon: Hexagon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
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

      {/* Impact visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tác động tích cực
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-green-500/10">
              <div className="text-3xl font-bold text-green-600">
                {stats ? Math.round(stats.totalCO2 / 1000) : 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Tấn CO₂ được hấp thụ mỗi năm
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10">
              <div className="text-3xl font-bold text-blue-600">
                {stats ? Math.round(stats.totalTrees * 0.1) : 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Loài động vật được bảo vệ
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-500/10">
              <div className="text-3xl font-bold text-amber-600">
                {stats ? Math.round(stats.totalForestArea / 10000) : 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Hecta rừng được phục hồi
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
