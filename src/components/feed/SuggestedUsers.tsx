import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { UserPlus, Check, TreePine, Users, Sparkles, Leaf, ChevronRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSuggestedUsers, useFollowUser, useIsFollowing } from '@/hooks/useFollow';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfetti } from '@/hooks/useConfetti';
interface SuggestedUserCardProps {
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    trees_planted: number;
    followers_count: number;
  };
  index: number;
}

function SuggestedUserCard({ user, index }: SuggestedUserCardProps) {
  const { t } = useTranslation();
  const followUser = useFollowUser();
  const { data: isFollowing } = useIsFollowing(user.id);
  const { triggerConfetti } = useConfetti();

  const handleFollow = async () => {
    await followUser.mutateAsync(user.id);
    // Trigger confetti on successful follow
    triggerConfetti('medium');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="group relative flex items-center gap-3 p-3 rounded-xl 
                 bg-gradient-to-r from-white/80 via-emerald-50/30 to-white/80
                 dark:from-gray-800/80 dark:via-emerald-900/20 dark:to-gray-800/80
                 hover:from-emerald-50/80 hover:via-yellow-50/20 hover:to-emerald-50/80
                 dark:hover:from-emerald-900/30 dark:hover:via-yellow-900/10 dark:hover:to-emerald-900/30
                 border border-emerald-100/50 dark:border-emerald-800/30
                 hover:border-emerald-200/80 dark:hover:border-emerald-700/50
                 hover:shadow-md hover:shadow-emerald-200/30 dark:hover:shadow-emerald-900/20
                 transition-all duration-300"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      bg-gradient-to-r from-emerald-400/5 via-yellow-400/5 to-emerald-400/5" />
      
      <Link to={`/profile?id=${user.id}`} className="relative">
        <Avatar className="w-12 h-12 ring-2 ring-emerald-200/50 dark:ring-emerald-700/50 
                          group-hover:ring-yellow-400/60 transition-all duration-300
                          shadow-md shadow-emerald-200/30">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-green-200 
                                     dark:from-emerald-800 dark:to-green-900 
                                     text-emerald-700 dark:text-emerald-300 font-bold">
            {user.full_name?.[0] || '🌱'}
          </AvatarFallback>
        </Avatar>
        {/* Online indicator style decoration */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 
                        bg-gradient-to-br from-emerald-400 to-green-500 
                        rounded-full border-2 border-white dark:border-gray-800
                        shadow-sm shadow-emerald-400/50" />
      </Link>
      
      <div className="flex-1 min-w-0 relative z-10">
        <Link 
          to={`/profile?id=${user.id}`}
          className="font-bold text-sm hover:underline truncate block 
                     text-gray-800 dark:text-white
                     group-hover:text-emerald-700 dark:group-hover:text-emerald-300
                     transition-colors duration-200"
        >
          {user.full_name || t('feed.greenWarrior')}
        </Link>
        <p className="text-xs flex items-center gap-1.5 font-medium
                      text-emerald-600 dark:text-emerald-400">
          <TreePine className="w-3.5 h-3.5 text-emerald-500" />
          <span className="bg-gradient-to-r from-emerald-600 to-green-600 
                          dark:from-emerald-400 dark:to-green-400 
                          bg-clip-text text-transparent font-bold">
            {user.trees_planted}
          </span>
          {t('feed.treesPlanted')}
        </p>
      </div>
      
      <Button
        variant={isFollowing ? 'secondary' : 'default'}
        size="sm"
        className={`h-9 text-xs relative z-10 transition-all duration-300 ${
          isFollowing 
            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' 
            : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md shadow-emerald-300/50 hover:shadow-lg hover:shadow-emerald-400/50 border-0'
        }`}
        onClick={handleFollow}
        disabled={followUser.isPending || isFollowing}
      >
        {isFollowing ? (
          <>
            <Check className="w-3.5 h-3.5 mr-1" />
            {t('feed.following')}
          </>
        ) : (
          <>
            <UserPlus className="w-3.5 h-3.5 mr-1 text-yellow-300" />
            {t('feed.follow')}
          </>
        )}
      </Button>
    </motion.div>
  );
}

export function SuggestedUsers() {
  const { t } = useTranslation();
  const { data: users, isLoading } = useSuggestedUsers();

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/40 to-white 
                       dark:from-gray-900 dark:via-emerald-950/30 dark:to-gray-900
                       shadow-lg shadow-emerald-100/50 dark:shadow-emerald-900/20
                       border-2 border-emerald-100/50 dark:border-emerald-800/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">{t('feed.suggestedForYou')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden 
                     bg-gradient-to-br from-slate-50 via-emerald-50/40 to-white 
                     dark:from-gray-900 dark:via-emerald-950/30 dark:to-gray-900
                     shadow-xl shadow-emerald-200/40 dark:shadow-emerald-900/30
                     border-2 border-emerald-200/60 dark:border-emerald-800/40
                     ring-2 ring-emerald-400/20 hover:ring-emerald-400/40
                     hover:shadow-2xl hover:shadow-emerald-300/50 dark:hover:shadow-emerald-800/40
                     transition-all duration-500">
      
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-100/30 via-yellow-50/20 to-emerald-100/30 dark:from-emerald-900/15 dark:via-yellow-900/10 dark:to-emerald-900/15"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(253,224,71,0.08) 50%, rgba(16,185,129,0.12) 100%)',
            'linear-gradient(135deg, rgba(253,224,71,0.08) 0%, rgba(16,185,129,0.12) 50%, rgba(253,224,71,0.08) 100%)',
            'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(253,224,71,0.08) 50%, rgba(16,185,129,0.12) 100%)'
          ]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-16 right-6 w-20 h-20 rounded-full pointer-events-none bg-gradient-to-br from-emerald-400/15 to-green-300/10 blur-2xl"
        animate={{ 
          x: [0, 10, 0], 
          y: [0, -8, 0],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-24 left-4 w-16 h-16 rounded-full pointer-events-none bg-gradient-to-br from-yellow-400/15 to-amber-300/10 blur-2xl"
        animate={{ 
          x: [0, -8, 0], 
          y: [0, 10, 0],
          opacity: [0.15, 0.4, 0.15]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full pointer-events-none bg-gradient-to-br from-emerald-300/10 to-teal-300/5 blur-2xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Sparkle grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 bg-gradient-to-br from-white to-yellow-200 rounded-full"
            style={{
              left: `${8 + (i * 9) % 85}%`,
              top: `${15 + (i * 13) % 70}%`,
            }}
            animate={{
              opacity: [0.1, 0.7, 0.1],
              scale: [0.5, 1.1, 0.5],
            }}
            transition={{
              duration: 2.5 + (i % 3),
              repeat: Infinity,
              delay: i * 0.25,
            }}
          />
        ))}
      </div>

      {/* Aurora shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/8 to-transparent pointer-events-none"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={{ width: '200%' }}
      />
      
      {/* Floating decorations */}
      <div className="absolute top-20 right-3 opacity-25 dark:opacity-15 z-10">
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf className="w-6 h-6 text-emerald-400" />
        </motion.div>
      </div>
      <div className="absolute bottom-16 left-3 opacity-25 dark:opacity-15 z-10">
        <motion.div
          animate={{ y: [0, 8, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Leaf className="w-5 h-5 text-green-400" />
        </motion.div>
      </div>
      
      {/* Header with gradient */}
      <CardHeader className="relative p-0 overflow-hidden">
        <div className="relative bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-700 
                        dark:from-emerald-700 dark:via-green-600 dark:to-emerald-800
                        px-4 py-3">
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
            />
          </div>
          
          {/* Sparkles */}
          <motion.div 
            className="absolute top-2 right-4"
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </motion.div>
          <motion.div 
            className="absolute bottom-2 right-12"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <span className="text-white/80 text-xs">✦</span>
          </motion.div>
          <motion.div 
            className="absolute top-3 right-20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          >
            <span className="text-yellow-200/70 text-[10px]">★</span>
          </motion.div>
          
          <CardTitle className="relative z-10 text-sm font-bold flex items-center gap-2.5 text-white">
            <div className="p-1.5 bg-white/20 rounded-lg ring-2 ring-yellow-400/50 shadow-md">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="drop-shadow-md">{t('feed.suggestedForYou')}</span>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="relative p-4 space-y-3">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-4 left-8 w-2 h-2 rounded-full bg-emerald-500" />
          <div className="absolute top-12 right-12 w-1.5 h-1.5 rounded-full bg-yellow-500" />
          <div className="absolute bottom-20 left-16 w-1 h-1 rounded-full bg-green-500" />
        </div>
        
        {/* Scrollable user list */}
        <ScrollArea className="max-h-[280px] pr-1">
          <div className="space-y-3">
            {users.map((user, index) => (
              <SuggestedUserCard key={user.id} user={user} index={index} />
            ))}
          </div>
        </ScrollArea>
        
        {/* Divider */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
          <div className="relative flex items-center gap-2 px-3 bg-gradient-to-r from-white via-emerald-50/80 to-white dark:from-gray-900 dark:via-emerald-950/50 dark:to-gray-900">
            <span className="text-emerald-400 text-xs">✦</span>
            <Leaf className="w-3 h-3 text-emerald-500" />
            <span className="text-yellow-500 text-xs">✦</span>
          </div>
        </div>
        
        {/* View all button */}
        <Link to="/leaderboard" className="block">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="ghost" 
              className="w-full h-10 text-sm font-semibold
                         bg-gradient-to-r from-emerald-100/80 via-yellow-50/50 to-emerald-100/80
                         dark:from-emerald-900/40 dark:via-yellow-900/20 dark:to-emerald-900/40
                         hover:from-emerald-200/90 hover:via-yellow-100/60 hover:to-emerald-200/90
                         dark:hover:from-emerald-800/50 dark:hover:via-yellow-800/30 dark:hover:to-emerald-800/50
                         text-emerald-700 dark:text-emerald-300
                         border border-emerald-200/60 dark:border-emerald-700/40
                         hover:border-emerald-300/80 dark:hover:border-emerald-600/60
                         rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-200/30
                         transition-all duration-300"
            >
              {t('feed.seeAll')}
              <ChevronRight className="w-4 h-4 ml-1 text-emerald-500" />
            </Button>
          </motion.div>
        </Link>
      </CardContent>
      
      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 
                      bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent 
                      blur-sm" />
    </Card>
  );
}
