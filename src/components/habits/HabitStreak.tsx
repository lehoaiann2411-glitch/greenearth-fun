import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Flame, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { CAMLY_REWARDS } from '@/lib/camlyCoin';

interface HabitStreakProps {
  streak: number;
}

export function HabitStreak({ streak }: HabitStreakProps) {
  const { t } = useTranslation();

  if (streak === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Flame className="h-5 w-5" />
        <span className="text-sm">{t('habits.noStreak')}</span>
      </div>
    );
  }

  // Determine milestone
  let milestoneBonus = 0;
  let nextMilestone = 7;
  
  if (streak >= 30) {
    milestoneBonus = CAMLY_REWARDS.HABIT_STREAK_30_DAY;
    nextMilestone = 0;
  } else if (streak >= 7) {
    milestoneBonus = CAMLY_REWARDS.HABIT_STREAK_7_DAY;
    nextMilestone = 30;
  }

  const isAtMilestone = streak === 7 || streak === 30;
  const daysToNext = nextMilestone > 0 ? nextMilestone - streak : 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Streak Counter */}
      <motion.div
        className="flex items-center gap-2"
        animate={isAtMilestone ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 0.5,
            repeatDelay: 2,
          }}
        >
          <Flame className="h-6 w-6 text-orange-500" />
        </motion.div>
        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
          {t('habits.streak', { count: streak })}
        </span>
      </motion.div>

      {/* Milestone Badge */}
      {milestoneBonus > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 gap-1"
          >
            <Zap className="h-3 w-3" />
            +{milestoneBonus}
            <CamlyCoinIcon size="xs" />
          </Badge>
        </motion.div>
      )}

      {/* Next Milestone */}
      {daysToNext > 0 && (
        <span className="text-xs text-muted-foreground">
          {t('habits.nextMilestone', { days: daysToNext })}
        </span>
      )}
    </div>
  );
}
