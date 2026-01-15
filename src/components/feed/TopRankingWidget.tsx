import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, Crown, ChevronRight, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
import { formatCamly } from '@/lib/camlyCoin';
import { cn } from '@/lib/utils';

// Podium card for top 3 with enhanced metallic colors
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

  // Enhanced metallic glow effects
  const glowColors = {
    1: 'shadow-[0_0_25px_rgba(251,191,36,0.6),0_0_50px_rgba(245,158,11,0.3)]',
    2: 'shadow-[0_0_20px_rgba(148,163,184,0.5),0_0_40px_rgba(100,116,139,0.3)]',
    3: 'shadow-[0_0_20px_rgba(234,88,12,0.5),0_0_40px_rgba(194,65,12,0.3)]'
  };

  // Enhanced ring colors with gradients
  const ringColors = {
    1: 'ring-4 ring-yellow-400',
    2: 'ring-3 ring-slate-300',
    3: 'ring-3 ring-orange-500'
  };

  // Rich metallic gradients for backgrounds
  const bgGradients = {
    1: 'bg-gradient-to-t from-yellow-500/40 via-amber-400/30 via-orange-300/20 to-transparent',
    2: 'bg-gradient-to-t from-slate-400/40 via-gray-300/30 via-slate-200/15 to-transparent',
    3: 'bg-gradient-to-t from-orange-600/40 via-amber-600/30 via-yellow-700/15 to-transparent'
  };

  // Enhanced text colors
  const textColors = {
    1: 'text-amber-500 dark:text-yellow-300',
    2: 'text-slate-500 dark:text-slate-300',
    3: 'text-orange-600 dark:text-amber-400'
  };

  // Glow background colors
  const glowBgColors = {
    1: 'bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-400',
    2: 'bg-gradient-to-r from-slate-300 via-gray-200 to-slate-400',
    3: 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600'
  };

  // Podium base 3D metallic effect
  const podiumStyles = {
    1: 'bg-gradient-to-t from-yellow-500/50 via-amber-400/40 via-yellow-300/20 to-yellow-100/10 border-yellow-400/60 shadow-inner shadow-yellow-500/30',
    2: 'bg-gradient-to-t from-slate-400/50 via-gray-300/40 via-slate-200/20 to-slate-100/10 border-slate-300/60 shadow-inner shadow-slate-400/30',
    3: 'bg-gradient-to-t from-orange-500/50 via-amber-500/40 via-orange-400/20 to-amber-200/10 border-orange-500/60 shadow-inner shadow-orange-500/30'
  };

  return (
    <Link 
      to={`/profile/${user.id}`}
      className="flex flex-col items-center group"
    >
      {/* Crown for champion with rainbow glow */}
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
          className="mb-1 relative"
        >
          {/* Crown glow effect */}
          <motion.div
            className="absolute inset-0 blur-lg"
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Crown className="w-8 h-8 text-yellow-400" />
          </motion.div>
          <Crown className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] relative" />
        </motion.div>
      )}

      {/* Avatar with enhanced metallic glow */}
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
        {/* Enhanced glow effect with gradient */}
        <motion.div
          animate={{ 
            opacity: [0.5, 0.9, 0.5],
            scale: [1, 1.15, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={cn(
            "absolute inset-0 rounded-full blur-md",
            glowBgColors[rank as 1 | 2 | 3]
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

      {/* Name with enhanced color */}
      <p className={cn(
        "mt-2 text-xs font-bold truncate max-w-[80px] text-center drop-shadow-sm",
        textColors[rank as 1 | 2 | 3]
      )}>
        {user.full_name?.split(' ')[0] || 'User'}
      </p>

      {/* Camly balance with glow */}
      <div className="flex items-center gap-1 mt-0.5">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: rank * 0.3 }}
        >
          <CamlyCoinIcon className="w-3.5 h-3.5" />
        </motion.div>
        <span className={cn(
          "text-xs font-bold",
          rank === 1 && "text-amber-600 dark:text-yellow-400",
          rank === 2 && "text-slate-600 dark:text-slate-300",
          rank === 3 && "text-orange-600 dark:text-amber-500"
        )}>
          {formatCamly(user.camly_balance || 0)}
        </span>
      </div>

      {/* Podium base with 3D metallic effect */}
      <div className={cn(
        "mt-2 w-20 rounded-t-lg flex items-end justify-center transition-all border-t-2 border-x-2",
        heights[rank as 1 | 2 | 3],
        podiumStyles[rank as 1 | 2 | 3],
        "group-hover:scale-105"
      )}>
        <span className={cn(
          "text-2xl font-black mb-2 drop-shadow-lg",
          textColors[rank as 1 | 2 | 3],
          "opacity-70"
        )}>
          {rank}
        </span>
      </div>
    </Link>
  );
}

// Colorful rank badges for positions 4-10
const rankBadgeColors: Record<number, string> = {
  4: 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400 border-violet-300/30',
  5: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border-blue-300/30',
  6: 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-300/30',
  7: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-300/30',
  8: 'bg-gradient-to-r from-lime-500/20 to-yellow-500/20 text-lime-600 dark:text-lime-400 border-lime-300/30',
  9: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-300/30',
  10: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-400 border-rose-300/30'
};

// Regular ranking item for #4-#10 with colorful badges
function RankingItem({ user, index }: { user: LeaderboardEntry; index: number }) {
  const rank = user.rank || (index + 4);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
    >
      <Link
        to={`/profile/${user.id}`}
        className="flex items-center gap-2.5 py-2 px-2 rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:via-transparent hover:to-primary/5 transition-all duration-200 group border border-transparent hover:border-primary/10"
      >
        {/* Colorful rank badge */}
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center border font-bold text-xs",
          rankBadgeColors[rank] || 'bg-muted text-muted-foreground'
        )}>
          {rank}
        </div>
        
        {/* Avatar */}
        <Avatar className="w-8 h-8 group-hover:scale-105 transition-transform ring-2 ring-transparent group-hover:ring-primary/20">
          <AvatarImage src={user.avatar_url || ''} alt={user.full_name || ''} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {user.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <p className="flex-1 text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
          {user.full_name || 'Anonymous'}
        </p>

        {/* Camly balance with coin */}
        <div className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 rounded-full">
          <CamlyCoinIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
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
      <Card className="overflow-hidden bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-gray-900 dark:via-amber-950/10 dark:to-gray-900 shadow-xl border-0">
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 via-orange-500 to-rose-500 p-4">
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
                <Skeleton className="w-7 h-7 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-16 rounded-full" />
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
      <Card className="overflow-hidden bg-gradient-to-b from-white via-amber-50/20 to-white dark:from-gray-900 dark:via-amber-950/10 dark:to-gray-900 shadow-xl border-0">
        {/* Header with luxury golden gradient */}
        <motion.div 
          className="bg-gradient-to-r from-amber-500 via-yellow-400 via-orange-500 to-rose-500 p-4 relative overflow-hidden"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: '200% 200%' }}
        >
          {/* Animated shimmer overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ width: '50%' }}
          />
          
          {/* Sparkle pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE1KSIvPjwvc3ZnPg==')] opacity-60" />
          
          {/* Floating sparkles with multiple colors */}
          <motion.div
            className="absolute top-2 right-8"
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-yellow-200 drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
          </motion.div>
          <motion.div
            className="absolute top-4 right-20"
            animate={{ 
              y: [0, -3, 0],
              opacity: [0.3, 0.9, 0.3]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            <Star className="w-3 h-3 text-white fill-white/60" />
          </motion.div>
          <motion.div
            className="absolute bottom-2 right-12"
            animate={{ 
              y: [0, -4, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
          >
            <Sparkles className="w-4 h-4 text-pink-200" />
          </motion.div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div 
                className="bg-white/25 backdrop-blur-sm rounded-full p-2 shadow-lg"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Trophy className="w-6 h-6 text-white drop-shadow-lg" />
              </motion.div>
              <div>
                <h3 className="font-bold text-white text-lg drop-shadow-md flex items-center gap-2">
                  👑 Top Ranking
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                </h3>
                <p className="text-white/80 text-xs flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3" />
                  Top 10 {t('leaderboard.topEarners', 'Earners')}
                </p>
              </div>
            </div>
            <Link 
              to="/leaderboard" 
              className="text-xs text-white font-semibold flex items-center gap-1 transition-all bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl"
            >
              {t('common.viewAll', 'View all')}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

        {/* Podium Section - Top 3 */}
        <div className="px-4 pt-6 pb-2 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/20 dark:to-transparent">
          <div className="flex items-end justify-center gap-2">
            {/* #2 - Left */}
            {top3[1] && <PodiumCard user={top3[1]} rank={2} />}
            
            {/* #1 - Center (Champion) */}
            {top3[0] && <PodiumCard user={top3[0]} rank={1} isChampion />}
            
            {/* #3 - Right */}
            {top3[2] && <PodiumCard user={top3[2]} rank={3} />}
          </div>
        </div>

        {/* Divider with medal icons */}
        <div className="flex items-center justify-center gap-2 py-3 px-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
          <div className="flex gap-2 items-center">
            <span className="text-lg drop-shadow-md">🥇</span>
            <motion.span 
              className="text-yellow-500 text-lg"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
            <span className="text-lg drop-shadow-md">🥈</span>
            <motion.span 
              className="text-amber-500 text-lg"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              ✦
            </motion.span>
            <span className="text-lg drop-shadow-md">🥉</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
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

        {/* Footer CTA with golden gradient */}
        <div className="p-3 pt-2">
          <Link
            to="/leaderboard"
            className="block w-full py-2.5 text-center text-sm font-bold text-amber-700 dark:text-amber-300 bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-orange-400/20 hover:from-amber-500/30 hover:via-yellow-400/25 hover:to-orange-400/30 rounded-xl transition-all border border-amber-300/30 hover:border-amber-400/50 shadow-sm hover:shadow-md"
          >
            🏆 {t('leaderboard.seeFullRanking', 'See Full Ranking')}
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
