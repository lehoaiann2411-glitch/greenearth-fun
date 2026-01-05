import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard, LeaderboardPeriod } from '@/hooks/useLeaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Crown } from 'lucide-react';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { formatCamly } from '@/lib/camlyCoin';

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
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              Bảng Xếp Hạng Camly Coin
            </h1>
            <p className="mt-2 text-muted-foreground">
              Top những người bạn giàu Camly Coin nhất
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
              <CamlyCoinIcon size="sm" />
              Top Ranking
              </CardTitle>
              <CardDescription>
                Xếp hạng dựa trên số Camly Coin sở hữu
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
                    const isCurrentUser = user?.id === entry.id;
                    const camlyBalance = entry.camly_balance || 0;

                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                          isCurrentUser
                            ? 'border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20'
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
                          <p className="text-sm text-muted-foreground">
                            {entry.trees_planted} cây đã trồng
                          </p>
                        </div>

                        {/* Camly Balance */}
                        <div className="text-right flex items-center gap-2">
                          <CamlyCoinIcon size="sm" />
                          <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                            {formatCamly(camlyBalance)}
                          </p>
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
