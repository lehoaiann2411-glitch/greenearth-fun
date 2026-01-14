import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, Crown, Medal, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { formatCamly } from '@/lib/camlyCoin';

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-4 h-4 text-yellow-500" />;
    case 2:
      return <Medal className="w-4 h-4 text-gray-400" />;
    case 3:
      return <Medal className="w-4 h-4 text-amber-600" />;
    default:
      return <span className="w-4 h-4 flex items-center justify-center text-xs font-medium text-muted-foreground">{rank}</span>;
  }
};

export function TopRankingWidget() {
  const { t } = useTranslation();
  const { data: leaderboard, isLoading } = useLeaderboard('all', 5);

  if (isLoading) {
    return (
      <Card className="p-4 bg-white dark:bg-gray-900 shadow-md border-white/50 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Top Ranking</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-white dark:bg-gray-900 shadow-md border-white/50 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Top Ranking</h3>
        </div>
        <Link 
          to="/leaderboard" 
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {t('common.viewAll', 'View all')}
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {leaderboard.map((user) => (
          <Link
            key={user.id}
            to={`/profile/${user.id}`}
            className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-center w-5">
              {getRankIcon(user.rank)}
            </div>
            
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar_url || ''} alt={user.full_name || ''} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {user.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.full_name || 'Anonymous'}
              </p>
              <div className="flex items-center gap-1">
                <CamlyCoinIcon className="w-3 h-3" />
                <span className="text-xs text-muted-foreground">
                  {formatCamly(user.camly_balance || 0)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
