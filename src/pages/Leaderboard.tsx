import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard, LeaderboardPeriod } from '@/hooks/useLeaderboard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Medal, ExternalLink } from 'lucide-react';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { formatCamly } from '@/lib/camlyCoin';
import { motion, AnimatePresence } from 'framer-motion';

// Golden particles component for loading animation
function GoldenParticles({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400"
          initial={{ 
            opacity: 0, 
            scale: 0, 
            x: `${Math.random() * 100}%`, 
            y: -20 
          }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 1, 0.5], 
            y: [0, 150 + Math.random() * 200],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 2.5, 
            delay: i * 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}

// Confetti particles for champion card
function ChampionConfetti() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FFA500' : '#FFEC8B',
            left: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [-10, 80],
            opacity: [1, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeIn"
          }}
        />
      ))}
    </div>
  );
}

export default function Leaderboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const { data: leaderboard, isLoading } = useLeaderboard(period);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: Crown,
          iconColor: 'text-yellow-500',
          ringClass: 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-500/50',
        };
      case 2:
        return {
          icon: Medal,
          iconColor: 'text-gray-400',
          ringClass: 'ring-4 ring-gray-300 shadow-lg shadow-gray-400/30',
        };
      case 3:
        return {
          icon: Medal,
          iconColor: 'text-orange-500',
          ringClass: 'ring-4 ring-orange-400 shadow-lg shadow-orange-500/30',
        };
      default:
        return null;
    }
  };

  return (
    <Layout>
      {/* Custom Full-Screen Background */}
      <div className="fixed inset-0 z-0">
        {/* Vibrant Green Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#228B22] via-[#2E8B57] to-[#32CD32]" />
        
        {/* Forest Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23000' fill-opacity='0.1' d='M50 0L60 30H40L50 0zM30 20L40 50H20L30 20zM70 20L80 50H60L70 20zM50 40L60 70H40L50 40zM20 50L30 80H10L20 50zM80 50L90 80H70L80 50z'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
          }}
        />
        
        {/* Light Rays */}
        <motion.div 
          className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-yellow-200/20 to-transparent rotate-12 blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-0 right-1/3 w-24 h-full bg-gradient-to-b from-white/10 to-transparent -rotate-6 blur-lg"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        {/* Floating Birds */}
        <motion.div 
          className="absolute top-20 left-[10%] text-2xl opacity-60"
          animate={{ y: [-5, 5, -5], x: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🕊️
        </motion.div>
        <motion.div 
          className="absolute top-32 right-[15%] text-xl opacity-50"
          animate={{ y: [5, -5, 5], x: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          🕊️
        </motion.div>
      </div>

      {/* Golden Particles on Load */}
      <GoldenParticles active={isLoading} />

      <div className="relative z-10 container py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Header with Golden Trophy */}
          <div className="mb-8 text-center">
            <motion.div 
              className="mb-6 flex justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 glow-gold-lg">
                  <Trophy className="h-10 w-10 text-white drop-shadow-lg" />
                </div>
                {/* Sparkle effects around trophy */}
                <motion.div 
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-yellow-300"
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                />
                <motion.div 
                  className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-amber-400"
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div 
                  className="absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-yellow-200"
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 text-glow-gold drop-shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t('leaderboard.title')}
            </motion.h1>
            <motion.p 
              className="mt-3 text-lg text-white/90 font-medium drop-shadow-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t('leaderboard.description')}
            </motion.p>
          </div>

          {/* Glassmorphism Period Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)} className="mb-8">
              <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border border-white/20 p-1.5 rounded-full shadow-xl">
                <TabsTrigger 
                  value="week"
                  className="rounded-full px-4 py-2.5 text-white/80 font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/30"
                >
                  {t('leaderboard.thisWeek')}
                </TabsTrigger>
                <TabsTrigger 
                  value="month"
                  className="rounded-full px-4 py-2.5 text-white/80 font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/30"
                >
                  {t('leaderboard.thisMonth')}
                </TabsTrigger>
                <TabsTrigger 
                  value="all"
                  className="rounded-full px-4 py-2.5 text-white/80 font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/30"
                >
                  {t('leaderboard.allTime')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Leaderboard Content */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-6 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <CamlyCoinIcon size="md" animated />
              <h2 className="text-2xl font-bold text-white">{t('leaderboard.topRanking')}</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="h-20 rounded-xl bg-gradient-to-r from-yellow-200/10 via-yellow-300/20 to-yellow-200/10 animate-shimmer border border-yellow-300/20" 
                  />
                ))}
              </div>
            ) : leaderboard?.length === 0 ? (
              <div className="py-16 text-center text-white/70">
                <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t('leaderboard.noData')}</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={period}
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {leaderboard?.map((entry, index) => {
                    const rankStyle = getRankStyle(entry.rank);
                    const isCurrentUser = user?.id === entry.id;
                    const camlyBalance = entry.camly_balance || 0;
                    const isChampion = entry.rank === 1;
                    const isTopThree = entry.rank <= 3;
                    const isTopTen = entry.rank <= 10;

                      return (
                      <Link 
                        key={entry.id}
                        to={`/profile/${entry.id}`}
                        className="block"
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ 
                            y: -4, 
                            scale: 1.01,
                            transition: { duration: 0.2 }
                          }}
                          className={`group relative rounded-2xl p-4 transition-all cursor-pointer ${
                            isChampion
                              ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-4 glow-gold-lg scale-[1.02]'
                              : isTopThree
                              ? 'bg-white border-2 border-yellow-400/50 glow-gold'
                              : isTopTen
                              ? 'bg-white border-2 border-yellow-300/30 hover:glow-gold'
                              : 'bg-white/90 border border-gray-200 hover:border-yellow-300/50'
                          } ${isCurrentUser ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                          style={isChampion ? {
                            borderImage: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700) 1',
                            borderStyle: 'solid'
                          } : {}}
                        >
                          {/* Champion Crown & Confetti */}
                          {isChampion && (
                            <>
                              <ChampionConfetti />
                              <motion.div 
                                className="absolute -top-5 left-1/2 -translate-x-1/2 z-10"
                                animate={{ y: [0, -3, 0], rotate: [-5, 5, -5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Crown className="h-10 w-10 text-yellow-500 drop-shadow-lg" />
                              </motion.div>
                            </>
                          )}

                          <div className={`flex items-center gap-4 ${isChampion ? 'pt-4' : ''}`}>
                            {/* Rank Number */}
                            <div className="flex w-14 justify-center">
                              {rankStyle ? (
                                <motion.div 
                                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${
                                    entry.rank === 1 ? 'from-yellow-400 to-amber-500' :
                                    entry.rank === 2 ? 'from-gray-300 to-gray-400' :
                                    'from-orange-400 to-orange-500'
                                  } shadow-lg`}
                                  whileHover={{ scale: 1.1, rotate: 10 }}
                                >
                                  <rankStyle.icon className="h-6 w-6 text-white" />
                                </motion.div>
                              ) : (
                                <span className="text-xl font-bold text-gray-500">
                                  #{entry.rank}
                                </span>
                              )}
                            </div>

                            {/* Avatar */}
                            <Avatar className={`h-14 w-14 group-hover:ring-4 group-hover:ring-emerald-400/50 transition-all ${
                              isTopTen 
                                ? rankStyle?.ringClass || 'ring-2 ring-yellow-300'
                                : ''
                            }`}>
                              <AvatarImage src={entry.avatar_url || ''} alt={entry.full_name || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-green-100 to-emerald-200 text-green-700 font-bold">
                                {entry.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`font-bold truncate group-hover:underline ${isChampion ? 'text-xl text-gray-900' : 'text-lg text-gray-800'}`}>
                                  {entry.full_name || t('leaderboard.anonymousUser')}
                                </p>
                                {isCurrentUser && (
                                  <Badge className="shrink-0 bg-green-500 text-white">{t('leaderboard.you')}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-500">
                                  {entry.trees_planted} {t('leaderboard.treesPlanted')}
                                </p>
                                <span className="text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  {t('leaderboard.viewProfile')}
                                </span>
                              </div>
                            </div>

                            {/* Camly Balance */}
                            <div className="flex items-center gap-2">
                              <CamlyCoinIcon size={isChampion ? 'md' : 'sm'} animated={isTopThree} />
                              <p className={`font-bold ${
                                isChampion 
                                  ? 'text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600' 
                                  : isTopThree
                                  ? 'text-xl text-yellow-600'
                                  : 'text-lg text-yellow-600'
                              }`}>
                                {formatCamly(camlyBalance)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
