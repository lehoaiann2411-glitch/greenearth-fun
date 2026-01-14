import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, Crown, Medal, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { formatCamly } from '@/lib/camlyCoin';
import { cn } from '@/lib/utils';

const getRankStyles = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        icon: <Crown className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.6)]" />,
        border: 'ring-2 ring-yellow-400/50 shadow-[0_0_12px_rgba(234,179,8,0.4)]',
        bg: 'bg-gradient-to-br from-yellow-500/20 via-amber-400/10 to-orange-500/20',
        textColor: 'text-yellow-600 dark:text-yellow-400',
        badge: 'bg-gradient-to-r from-yellow-400 to-amber-500'
      };
    case 2:
      return {
        icon: <Medal className="w-5 h-5 text-gray-400 drop-shadow-[0_0_4px_rgba(156,163,175,0.5)]" />,
        border: 'ring-2 ring-gray-300/50 shadow-[0_0_8px_rgba(156,163,175,0.3)]',
        bg: 'bg-gradient-to-br from-gray-300/20 via-slate-200/10 to-gray-400/20',
        textColor: 'text-gray-500 dark:text-gray-300',
        badge: 'bg-gradient-to-r from-gray-300 to-gray-400'
      };
    case 3:
      return {
        icon: <Medal className="w-5 h-5 text-amber-600 drop-shadow-[0_0_4px_rgba(180,83,9,0.5)]" />,
        border: 'ring-2 ring-amber-600/50 shadow-[0_0_8px_rgba(180,83,9,0.3)]',
        bg: 'bg-gradient-to-br from-amber-600/20 via-orange-500/10 to-amber-700/20',
        textColor: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-gradient-to-r from-amber-500 to-amber-700'
      };
    default:
      return {
        icon: <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>,
        border: '',
        bg: '',
        textColor: 'text-muted-foreground',
        badge: ''
      };
  }
};

export function TopRankingWidget() {
  const { t } = useTranslation();
  const { data: leaderboard, isLoading } = useLeaderboard('all', 5);

  if (isLoading) {
    return (
      <Card className="overflow-hidden bg-white dark:bg-gray-900 shadow-lg border-0">
        <div className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 p-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-white" />
            <h3 className="font-bold text-white text-lg">Top Ranking</h3>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden bg-white dark:bg-gray-900 shadow-lg border-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Top Ranking</h3>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t('leaderboard.topEarners', 'Top Earners')}
                </p>
              </div>
            </div>
            <Link 
              to="/leaderboard" 
              className="text-xs text-white/80 hover:text-white flex items-center gap-1 transition-colors bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full"
            >
              {t('common.viewAll', 'View all')}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Rankings List */}
        <div className="p-3 space-y-2">
          {leaderboard.map((user, index) => {
            const styles = getRankStyles(user.rank);
            const isTopThree = user.rank <= 3;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/profile/${user.id}`}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200",
                    "hover:scale-[1.02] hover:shadow-md",
                    isTopThree ? styles.bg : "hover:bg-muted/50"
                  )}
                >
                  {/* Rank Badge */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    isTopThree && styles.badge,
                    isTopThree && "text-white shadow-sm"
                  )}>
                    {styles.icon}
                  </div>
                  
                  {/* Avatar with ring for top 3 */}
                  <Avatar className={cn(
                    "w-11 h-11 transition-transform",
                    isTopThree && styles.border
                  )}>
                    <AvatarImage src={user.avatar_url || ''} alt={user.full_name || ''} />
                    <AvatarFallback className={cn(
                      "text-sm font-semibold",
                      isTopThree ? styles.bg : "bg-primary/10 text-primary"
                    )}>
                      {user.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-semibold truncate",
                      isTopThree ? styles.textColor : "text-foreground"
                    )}>
                      {user.full_name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <CamlyCoinIcon className="w-4 h-4" />
                      <span className={cn(
                        "text-sm font-medium",
                        isTopThree ? "text-primary" : "text-muted-foreground"
                      )}>
                        {formatCamly(user.camly_balance || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Rank number for top 3 */}
                  {isTopThree && (
                    <div className={cn(
                      "text-2xl font-black opacity-20",
                      styles.textColor
                    )}>
                      #{user.rank}
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="px-4 pb-4">
          <Link
            to="/leaderboard"
            className="block w-full py-2.5 text-center text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
          >
            🏆 {t('leaderboard.seeFullRanking', 'See Full Ranking')}
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
