import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, Crown, ChevronRight, Sparkles, Star, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
import { formatCamly } from '@/lib/camlyCoin';
import { cn } from '@/lib/utils';

// Podium card for top 3 with Green-Gold-Pearl theme
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

  // Enhanced glow effects with Green-Gold-Pearl theme
  const glowColors = {
    1: 'shadow-[0_0_25px_rgba(251,191,36,0.6),0_0_50px_rgba(16,185,129,0.3)]', // Gold + Green glow
    2: 'shadow-[0_0_20px_rgba(148,163,184,0.5),0_0_40px_rgba(100,116,139,0.3)]', // Silver
    3: 'shadow-[0_0_20px_rgba(234,88,12,0.5),0_0_40px_rgba(194,65,12,0.3)]' // Bronze
  };

  // Ring colors with gold accent for champion
  const ringColors = {
    1: 'ring-4 ring-yellow-400',
    2: 'ring-3 ring-slate-300',
    3: 'ring-3 ring-orange-500'
  };

  // Rich gradients - Green for champion background
  const bgGradients = {
    1: 'bg-gradient-to-t from-emerald-500/40 via-yellow-400/30 via-green-300/20 to-transparent',
    2: 'bg-gradient-to-t from-slate-400/40 via-gray-300/30 via-slate-200/15 to-transparent',
    3: 'bg-gradient-to-t from-orange-600/40 via-amber-600/30 via-yellow-700/15 to-transparent'
  };

  // Enhanced text colors - Emerald for champion
  const textColors = {
    1: 'text-emerald-600 dark:text-emerald-400',
    2: 'text-slate-500 dark:text-slate-300',
    3: 'text-orange-600 dark:text-amber-400'
  };

  // Glow background colors - Green-Gold for champion
  const glowBgColors = {
    1: 'bg-gradient-to-r from-yellow-400 via-emerald-400 to-green-500',
    2: 'bg-gradient-to-r from-slate-300 via-gray-200 to-slate-400',
    3: 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600'
  };

  // Podium base - Green + Gold for champion
  const podiumStyles = {
    1: 'bg-gradient-to-t from-emerald-500/50 via-yellow-400/40 via-green-300/20 to-emerald-100/10 border-emerald-400/60 shadow-inner shadow-emerald-500/30',
    2: 'bg-gradient-to-t from-slate-400/50 via-gray-300/40 via-slate-200/20 to-slate-100/10 border-slate-300/60 shadow-inner shadow-slate-400/30',
    3: 'bg-gradient-to-t from-orange-500/50 via-amber-500/40 via-orange-400/20 to-amber-200/10 border-orange-500/60 shadow-inner shadow-orange-500/30'
  };

  return (
    <Link 
      to={`/profile/${user.id}`}
      className="flex flex-col items-center group"
    >
      {/* Crown for champion with gold glow */}
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

      {/* Avatar with enhanced glow */}
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

      {/* Name with emerald color for champion */}
      <p className={cn(
        "mt-2 text-xs font-bold truncate max-w-[80px] text-center drop-shadow-sm",
        textColors[rank as 1 | 2 | 3]
      )}>
        {user.full_name?.split(' ')[0] || 'User'}
      </p>

      {/* Camly balance with gold-green accent */}
      <div className={cn(
        "flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full",
        rank === 1 && "bg-gradient-to-r from-yellow-400/20 via-emerald-400/15 to-yellow-400/20",
        rank === 2 && "bg-slate-200/30 dark:bg-slate-700/30",
        rank === 3 && "bg-orange-200/30 dark:bg-orange-900/30"
      )}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: rank * 0.3 }}
        >
          <CamlyCoinIcon className="w-3.5 h-3.5" />
        </motion.div>
        <span className={cn(
          "text-xs font-bold",
          rank === 1 && "text-yellow-600 dark:text-yellow-400",
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

// Green-themed rank badges for positions 4-10
const rankBadgeColors: Record<number, string> = {
  4: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-300/30',
  5: 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-600 dark:text-teal-400 border-teal-300/30',
  6: 'bg-gradient-to-r from-green-500/20 to-lime-500/20 text-green-600 dark:text-green-400 border-green-300/30',
  7: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-300/30',
  8: 'bg-gradient-to-r from-emerald-400/20 to-teal-400/20 text-emerald-500 dark:text-emerald-300 border-emerald-200/30',
  9: 'bg-gradient-to-r from-lime-500/20 to-green-500/20 text-lime-600 dark:text-lime-400 border-lime-300/30',
  10: 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-700 dark:text-green-300 border-green-400/30'
};

// Regular ranking item for #4-#10 with green theme
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
        className="flex items-center gap-2.5 py-2 px-2 rounded-xl hover:bg-gradient-to-r hover:from-emerald-500/5 hover:via-transparent hover:to-emerald-500/5 transition-all duration-200 group border border-transparent hover:border-emerald-200/30 dark:hover:border-emerald-700/30"
      >
        {/* Colorful rank badge */}
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center border font-bold text-xs",
          rankBadgeColors[rank] || 'bg-muted text-muted-foreground'
        )}>
          {rank}
        </div>
        
        {/* Avatar with green hover */}
        <Avatar className="w-8 h-8 group-hover:scale-105 transition-transform ring-2 ring-emerald-100/50 dark:ring-emerald-800/50 group-hover:ring-emerald-300/50 dark:group-hover:ring-emerald-600/50">
          <AvatarImage src={user.avatar_url || ''} alt={user.full_name || ''} />
          <AvatarFallback className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
            {user.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <p className="flex-1 text-sm font-medium truncate text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {user.full_name || 'Anonymous'}
        </p>

        {/* Camly balance with gold-green accent */}
        <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400/15 to-emerald-400/10 px-2 py-0.5 rounded-full border border-yellow-300/20">
          <CamlyCoinIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
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
      <Card className="overflow-hidden bg-gradient-to-b from-slate-50 via-emerald-50/30 to-white dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900 shadow-xl border-0">
        <div className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-700 p-4">
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
      <Card className="overflow-hidden bg-gradient-to-b from-slate-50 via-emerald-50/30 to-white dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900 shadow-xl border-0 relative">
        {/* Pearl shimmer effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
        
        {/* Header with Green-Gold-Pearl theme */}
        <motion.div 
          className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-700 p-4 relative overflow-hidden"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: '200% 200%' }}
        >
          {/* Pearl shimmer overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ width: '50%' }}
          />
          
          {/* Pearl white sparkle pattern */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${20 + Math.floor(i / 4) * 30}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
          
          {/* Floating sparkles - Gold and White */}
          <motion.div
            className="absolute top-2 right-8"
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-yellow-300 drop-shadow-[0_0_4px_rgba(253,224,71,0.8)]" />
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
            <Leaf className="w-4 h-4 text-emerald-200" />
          </motion.div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div 
                className="bg-white/25 backdrop-blur-sm rounded-full p-2 shadow-lg ring-2 ring-yellow-400/50"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Trophy className="w-6 h-6 text-yellow-300 drop-shadow-lg" />
              </motion.div>
              <div>
                <h3 className="font-bold text-white text-lg drop-shadow-md flex items-center gap-2">
                  🌿 Top Ranking
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                </h3>
                <p className="text-emerald-100/90 text-xs flex items-center gap-1 font-medium">
                  <CamlyCoinIcon className="w-3 h-3" />
                  Bảng xếp hạng Camly Coin
                </p>
              </div>
            </div>
            <Link 
              to="/leaderboard" 
              className="text-xs text-white font-semibold flex items-center gap-1 transition-all bg-yellow-400/30 hover:bg-yellow-400/50 px-3 py-1.5 rounded-full border border-yellow-300/50 hover:border-yellow-300/70 shadow-lg hover:shadow-xl"
            >
              {t('common.viewAll', 'Xem tất cả')}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

        {/* Podium Section with green-pearl gradient */}
        <div className="px-4 pt-6 pb-2 bg-gradient-to-b from-emerald-50/60 via-yellow-50/20 to-white/80 dark:from-emerald-950/30 dark:via-yellow-950/10 dark:to-gray-900/80">
          <div className="flex items-end justify-center gap-2">
            {/* #2 - Left */}
            {top3[1] && <PodiumCard user={top3[1]} rank={2} />}
            
            {/* #1 - Center (Champion) */}
            {top3[0] && <PodiumCard user={top3[0]} rank={1} isChampion />}
            
            {/* #3 - Right */}
            {top3[2] && <PodiumCard user={top3[2]} rank={3} />}
          </div>
        </div>

        {/* Divider with green and gold accents */}
        <div className="flex items-center justify-center gap-2 py-3 px-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
          <div className="flex gap-2 items-center">
            <span className="text-lg drop-shadow-md">🥇</span>
            <motion.span 
              className="text-emerald-500 text-lg"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
            <span className="text-lg drop-shadow-md">🥈</span>
            <motion.span 
              className="text-yellow-500 text-lg"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              ✦
            </motion.span>
            <span className="text-lg drop-shadow-md">🥉</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
        </div>

        {/* Rankings List #4-#10 */}
        {rest.length > 0 && (
          <ScrollArea className="h-[200px] px-2">
            <div className="space-y-0.5">
              {rest.map((user, index) => (
                <RankingItem 
                  key={user.id} 
                  user={user} 
                  index={index}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>
    </motion.div>
  );
}

export default TopRankingWidget;
