import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard, LeaderboardPeriod } from '@/hooks/useLeaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Crown, Leaf } from 'lucide-react';
import { getRankByPoints } from '@/lib/greenRanks';

export default function Leaderboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const { data: leaderboard, isLoading } = useLeaderboard(period);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: Crown,
          bgClass: 'bg-gradient-to-r from-yellow-400 to-amber-500',
          textClass: 'text-yellow-600',
          ringClass: 'ring-yellow-400',
        };
      case 2:
        return {
          icon: Medal,
          bgClass: 'bg-gradient-to-r from-gray-300 to-gray-400',
          textClass: 'text-gray-500',
          ringClass: 'ring-gray-400',
        };
      case 3:
        return {
          icon: Medal,
          bgClass: 'bg-gradient-to-r from-orange-400 to-orange-500',
          textClass: 'text-orange-600',
          ringClass: 'ring-orange-400',
        };
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-forest">
                <Trophy className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              Bảng Xếp Hạng
            </h1>
            <p className="mt-2 text-muted-foreground">
              Top những người bạn xanh tích cực nhất
            </p>
          </div>

          {/* Period Tabs */}
          <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">Tuần này</TabsTrigger>
              <TabsTrigger value="month">Tháng này</TabsTrigger>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                Top 50 Điểm Xanh
              </CardTitle>
              <CardDescription>
                Xếp hạng dựa trên tổng điểm xanh tích lũy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : leaderboard?.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Chưa có dữ liệu xếp hạng
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard?.map((entry) => {
                    const rankStyle = getRankStyle(entry.rank);
                    const userRank = getRankByPoints(entry.green_points);
                    const RankIcon = userRank.icon;
                    const isCurrentUser = user?.id === entry.id;

                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                          isCurrentUser
                            ? 'border-primary/30 bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        {/* Rank */}
                        <div className="flex w-12 justify-center">
                          {rankStyle ? (
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${rankStyle.bgClass}`}>
                              <rankStyle.icon className="h-5 w-5 text-white" />
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-muted-foreground">
                              #{entry.rank}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar className={`h-12 w-12 ${rankStyle ? `ring-2 ${rankStyle.ringClass}` : ''}`}>
                          <AvatarImage src={entry.avatar_url || ''} alt={entry.full_name || ''} />
                          <AvatarFallback className="bg-muted">
                            {entry.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {entry.full_name || 'Người dùng ẩn danh'}
                            </p>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="shrink-0">Bạn</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <RankIcon className={`h-4 w-4 ${userRank.colorClass}`} />
                            <span>{userRank.name}</span>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {entry.green_points.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">điểm</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
