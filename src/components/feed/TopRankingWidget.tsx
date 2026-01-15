import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, Crown, Medal, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
import { formatCamly } from '@/lib/camlyCoin';
import { cn } from '@/lib/utils';

// Podium card for top 3
function PodiumCard({ 
  user, 
  rank, 
  isChampion = false 
}: { 
  user: LeaderboardEntry; 
  rank: number; 
  isChampion?: boolean;
}) {
  const heights = {
    1: 'h-28',
    2: 'h-20',
    3: 'h-16'
  };

  const avatarSizes = {
    1: 'w-16 h-16',
    2: 'w-12 h-12',
    3: 'w-12 h-12'
  };

  const glowColors = {
    1: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]',
    2: 'shadow-[0_0_15px_rgba(192,192,192,0.4)]',
    3: 'shadow-[0_0_15px_rgba(205,127,50,0.4)]'
  };

  const ringColors = {
    1: 'ring-4 ring-yellow-400/60',
    2: 'ring-3 ring-gray-300/60',
    3: 'ring-3 ring-amber-600/60'
  };

  const bgGradients = {
    1: 'bg-gradient-to-t from-yellow-500/30 via-yellow-400/20 to-transparent',
    2: 'bg-gradient-to-t from-gray-400/30 via-gray-300/20 to-transparent',
    3: 'bg-gradient-to-t from-amber-600/30 via-amber-500/20 to-transparent'
  };

  const textColors = {
    1: 'text-yellow-600 dark:text-yellow-400',
    2: 'text-gray-500 dark:text-gray-300',
    3: 'text-amber-600 dark:text-amber-400'
  };

  return (
    <Link 
      to={`/profile/${user.id}`}
      className="flex flex-col items-center group"
    >
      {/* Crown for champion */}
      {isChampion && (
        <motion.div
          animate={{ 
            y: [0, -4, 0],
            rotate: [-5, 5, -5]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-1"
        >
          <Crown className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
        </motion.div>
      )}

      {/* Avatar with glow */}
      <motion.div
        animate={isChampion ? { 
          y: [0, -3, 0],
          scale: [1, 1.02, 1]
        } : { y: [0, -2, 0] }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Glow effect */}
        <motion.div
          animate={{ 
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={cn(
            "absolute inset-0 rounded-full blur-md",
            rank === 1 && "bg-yellow-400",
            rank === 2 && "bg-gray-300",
            rank === 3 && "bg-amber-500"
          )}
        />
        
        <Avatar className={cn(
          "relative transition-transform group-hover:scale-110",
          avatarSizes[rank as 1 | 2 | 3],
          ringColors[rank as 1 | 2 | 3],
          glowColors[rank as 1 | 2 | 3]
        )}>
          <AvatarImage src={user.avatar_url || ''} alt={user.full_name || ''} />
          <AvatarFallback className={cn(
            "text-lg font-bold",
            bgGradients[rank as 1 | 2 | 3]
          )}>
            {user.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
      </motion.div>

      {/* Name */}
      <p className={cn(
        "mt-2 text-xs font-semibold truncate max-w-[80px] text-center",
        textColors[rank as 1 | 2 | 3]
      )}>
        {user.full_name?.split(' ')[0] || 'User'}
      </p>

      {/* Camly balance */}
      <div className="flex items-center gap-1 mt-0.5">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: rank * 0.3 }}
        >
          <CamlyCoinIcon className="w-3.5 h-3.5" />
        </motion.div>
        <span className="text-xs font-bold text-primary">
          {formatCamly(user.camly_balance || 0)}
        </span>
      </div>

      {/* Podium base */}
      <div className={cn(
        "mt-2 w-20 rounded-t-lg flex items-end justify-center transition-all",
        heights[rank as 1 | 2 | 3],
        bgGradients[rank as 1 | 2 | 3],
        "border-t-2 border-x-2",
        rank === 1 && "border-yellow-400/50",
        rank === 2 && "border-gray-300/50",
        rank === 3 && "border-amber-500/50",
        "group-hover:scale-105"
      )}>
        <span className={cn(
          "text-2xl font-black mb-2",
          textColors[rank as 1 | 2 | 3],
          "opacity-60"
        )}>
          {rank}
        </span>
      </div>
    </Link>
  );
}

// Regular ranking item for #4-#10
function RankingItem({ user, index }: { user: LeaderboardEntry; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
    >
      <Link
        to={`/profile/${user.id}`}
        className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-muted/50 transition-all duration-200 group"
      >
        {/* Rank number */}
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs font-bold text-muted-foreground">{user.rank}</span>
        </div>
        
        {/* Avatar */}
        <Avatar className="w-8 h-8 group-hover:scale-105 transition-transform">
          <AvatarImage src={user.avatar_url || ''} alt={user.full_name || ''} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {user.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <p className="flex-1 text-sm font-medium truncate text-foreground">
          {user.full_name || 'Anonymous'}
        </p>

        {/* Camly balance */}
        <div className="flex items-center gap-1">
          <CamlyCoinIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold text-muted-foreground">
            {formatCamly(user.camly_balance || 0)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function TopRankingWidget() {
  const { t } = useTranslation();
  const { data: leaderboard, isLoading } = useLeaderboard('all', 10);

  if (isLoading) {
    return (
      <Card className="overflow-hidden bg-white dark:bg-gray-900 shadow-lg border-0">
        <div className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 p-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-white" />
            <h3 className="font-bold text-white text-lg">Top Ranking</h3>
          </div>
        </div>
        <div className="p-4">
          {/* Podium skeleton */}
          <div className="flex items-end justify-center gap-3 mb-4">
            <div className="flex flex-col items-center">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="w-16 h-16 mt-2 rounded-t-lg" />
            </div>
            <div className="flex flex-col items-center">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="w-20 h-24 mt-2 rounded-t-lg" />
            </div>
            <div className="flex flex-col items-center">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="w-16 h-14 mt-2 rounded-t-lg" />
            </div>
          </div>
          {/* List skeleton */}
          <div className="space-y-2">
            {[4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return null;
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden bg-white dark:bg-gray-900 shadow-lg border-0">
        {/* Header with animated gradient */}
        <motion.div 
          className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 p-4 relative overflow-hidden"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: '200% 200%' }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
          
          {/* Floating sparkles */}
          <motion.div
            className="absolute top-2 right-8"
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </motion.div>
          <motion.div
            className="absolute bottom-2 right-16"
            animate={{ 
              y: [0, -3, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            <Sparkles className="w-3 h-3 text-white/60" />
          </motion.div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div 
                className="bg-white/20 backdrop-blur-sm rounded-full p-2"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-white text-lg">🏆 Top Ranking</h3>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Top 10 {t('leaderboard.topEarners', 'Earners')}
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
        </motion.div>

        {/* Podium Section - Top 3 */}
        <div className="px-4 pt-6 pb-2">
          <div className="flex items-end justify-center gap-2">
            {/* #2 - Left */}
            {top3[1] && <PodiumCard user={top3[1]} rank={2} />}
            
            {/* #1 - Center (Champion) */}
            {top3[0] && <PodiumCard user={top3[0]} rank={1} isChampion />}
            
            {/* #3 - Right */}
            {top3[2] && <PodiumCard user={top3[2]} rank={3} />}
          </div>
        </div>

        {/* Divider with decorations */}
        <div className="flex items-center justify-center gap-2 py-3 px-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="flex gap-1">
            <span className="text-yellow-500">✦</span>
            <span className="text-gray-400">✦</span>
            <span className="text-amber-500">✦</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Rankings List #4-#10 */}
        {rest.length > 0 && (
          <ScrollArea className="h-[200px] px-2">
            <div className="space-y-0.5">
              {rest.map((user, index) => (
                <RankingItem key={user.id} user={user} index={index} />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer CTA */}
        <div className="p-3 pt-2">
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
