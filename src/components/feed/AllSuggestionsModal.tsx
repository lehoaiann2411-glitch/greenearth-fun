import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Check, TreePine, Users, Sparkles, X, Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSuggestedUsers, useFollowUser, useIsFollowing } from '@/hooks/useFollow';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfetti } from '@/hooks/useConfetti';
import { Link } from 'react-router-dom';

interface AllSuggestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SuggestionCardProps {
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

function SuggestionCard({ user, index }: SuggestionCardProps) {
  const { t } = useTranslation();
  const followUser = useFollowUser();
  const { data: isFollowing } = useIsFollowing(user.id);
  const { triggerConfetti } = useConfetti();

  const handleFollow = async () => {
    await followUser.mutateAsync(user.id);
    triggerConfetti('medium');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative flex items-center gap-4 p-4 rounded-2xl 
                 bg-white/60 dark:bg-gray-800/60
                 backdrop-blur-sm
                 border border-white/50 dark:border-gray-700/50
                 hover:bg-white/80 dark:hover:bg-gray-800/80
                 hover:border-emerald-300/60 dark:hover:border-emerald-600/50
                 hover:shadow-lg hover:shadow-emerald-200/30 dark:hover:shadow-emerald-900/20
                 transition-all duration-300"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      bg-gradient-to-r from-emerald-400/5 via-yellow-400/5 to-emerald-400/5" />
      
      <Link to={`/profile?id=${user.id}`} className="relative flex-shrink-0">
        <Avatar className="w-14 h-14 ring-2 ring-emerald-200/60 dark:ring-emerald-700/60 
                          group-hover:ring-yellow-400/60 transition-all duration-300
                          shadow-lg shadow-emerald-200/40">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-green-200 
                                     dark:from-emerald-800 dark:to-green-900 
                                     text-emerald-700 dark:text-emerald-300 font-bold text-lg">
            {user.full_name?.[0] || '🌱'}
          </AvatarFallback>
        </Avatar>
        <motion.div 
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 
                     bg-gradient-to-br from-emerald-400 to-green-500 
                     rounded-full border-2 border-white dark:border-gray-800
                     shadow-sm shadow-emerald-400/50"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </Link>
      
      <div className="flex-1 min-w-0 relative z-10">
        <Link 
          to={`/profile?id=${user.id}`}
          className="font-bold text-base hover:underline truncate block 
                     text-gray-800 dark:text-white
                     group-hover:text-emerald-700 dark:group-hover:text-emerald-300
                     transition-colors duration-200"
        >
          {user.full_name || t('feed.greenWarrior')}
        </Link>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm flex items-center gap-1.5 font-medium
                        text-emerald-600 dark:text-emerald-400">
            <TreePine className="w-4 h-4 text-emerald-500" />
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 
                            dark:from-emerald-400 dark:to-green-400 
                            bg-clip-text text-transparent font-bold">
              {user.trees_planted}
            </span>
            <span className="text-gray-500 dark:text-gray-400">{t('feed.treesPlanted')}</span>
          </p>
          <p className="text-sm flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Users className="w-3.5 h-3.5" />
            {user.followers_count || 0}
          </p>
        </div>
        {user.bio && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
            {user.bio}
          </p>
        )}
      </div>
      
      <Button
        variant={isFollowing ? 'secondary' : 'default'}
        size="sm"
        className={`h-10 px-4 text-sm relative z-10 transition-all duration-300 flex-shrink-0 ${
          isFollowing 
            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' 
            : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md shadow-emerald-300/50 hover:shadow-lg hover:shadow-emerald-400/50 border-0'
        }`}
        onClick={handleFollow}
        disabled={followUser.isPending || isFollowing}
      >
        {isFollowing ? (
          <>
            <Check className="w-4 h-4 mr-1.5" />
            {t('feed.following')}
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-1.5" />
            {t('feed.follow')}
          </>
        )}
      </Button>
    </motion.div>
  );
}

export function AllSuggestionsModal({ open, onOpenChange }: AllSuggestionsModalProps) {
  const { t } = useTranslation();
  const { data: users, isLoading } = useSuggestedUsers();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-lg p-0 overflow-hidden border-0 bg-transparent shadow-2xl"
        hideClose
      >
        {/* Aurora animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-cyan-50/80 to-purple-50/60 
                        dark:from-gray-900 dark:via-emerald-950/50 dark:to-gray-900 rounded-2xl" />
        
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Aurora effect layer 1 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-cyan-300/15 to-purple-400/20"
            animate={{
              background: [
                'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.15) 50%, rgba(168,85,247,0.2) 100%)',
                'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(16,185,129,0.15) 50%, rgba(6,182,212,0.2) 100%)',
                'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(168,85,247,0.15) 50%, rgba(16,185,129,0.2) 100%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating orbs */}
          <motion.div
            className="absolute top-20 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400/30 to-cyan-400/20 blur-3xl"
            animate={{ 
              x: [0, 20, 0], 
              y: [0, -15, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 left-5 w-24 h-24 rounded-full bg-gradient-to-br from-purple-400/25 to-pink-400/20 blur-3xl"
            animate={{ 
              x: [0, -15, 0], 
              y: [0, 20, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/3 w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-400/15 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          {/* Sparkles */}
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${5 + (i * 4) % 90}%`,
                top: `${10 + (i * 7) % 80}%`,
                width: i % 3 === 0 ? '3px' : '2px',
                height: i % 3 === 0 ? '3px' : '2px',
                background: i % 2 === 0 
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                  : 'linear-gradient(135deg, #10b981, #34d399)',
              }}
              animate={{
                opacity: [0.2, 0.9, 0.2],
                scale: [0.5, 1.3, 0.5],
                y: [0, -10, 0]
              }}
              transition={{
                duration: 2 + (i % 3),
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}

          {/* Shimmer wave */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
            style={{ width: '200%' }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10">
          {/* Glass header */}
          <DialogHeader className="relative overflow-hidden rounded-t-2xl">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 
                           dark:from-emerald-700 dark:via-teal-600 dark:to-cyan-700
                           px-6 py-5">
              {/* Header shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
              />
              
              {/* Stars */}
              <motion.div 
                className="absolute top-3 right-6"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              </motion.div>
              <motion.div 
                className="absolute top-5 right-16"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              >
                <Sparkles className="w-5 h-5 text-yellow-200" />
              </motion.div>
              <motion.div 
                className="absolute bottom-4 right-24"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <span className="text-white/80 text-sm">✦</span>
              </motion.div>

              <div className="flex items-center justify-between relative z-10">
                <DialogTitle className="text-xl font-bold flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-xl ring-2 ring-yellow-400/50 shadow-lg backdrop-blur-sm">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="drop-shadow-lg">{t('feed.suggestedForYou')}</span>
                    <p className="text-xs font-normal text-white/80 mt-0.5">
                      {filteredUsers.length} {t('feed.people') || 'người'}
                    </p>
                  </div>
                </DialogTitle>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Search */}
          <div className="px-5 pt-5 pb-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
              <Input
                placeholder={t('common.search') || 'Tìm kiếm...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl border-2 border-emerald-200/60 dark:border-emerald-700/50
                          bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm
                          focus:border-emerald-400 focus:ring-emerald-400/30
                          placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* User list */}
          <ScrollArea className="h-[400px] px-5 pb-5">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50">
                      <Skeleton className="w-14 h-14 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-10 w-24 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 
                                  dark:from-emerald-900/50 dark:to-green-900/50 
                                  flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {searchQuery ? t('common.noResults') || 'Không tìm thấy' : t('feed.noSuggestions') || 'Chưa có gợi ý'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchQuery 
                      ? t('common.tryDifferentSearch') || 'Thử từ khóa khác'
                      : t('feed.checkBackLater') || 'Hãy quay lại sau nhé!'}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user, index) => (
                    <SuggestionCard key={user.id} user={user} index={index} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
