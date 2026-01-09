import { motion } from 'framer-motion';
import { Flame, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface HabitStreakProps {
  streak: number;
  className?: string;
}

export function HabitStreak({ streak, className }: HabitStreakProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  const getStreakMessage = () => {
    if (streak === 0) return isVi ? 'Bắt đầu streak hôm nay!' : 'Start your streak today!';
    if (streak >= 30) return isVi ? `🏆 ${streak} ngày - Huyền thoại!` : `🏆 ${streak} days - Legend!`;
    if (streak >= 7) return isVi ? `🔥 ${streak} ngày liên tục!` : `🔥 ${streak} day streak!`;
    return isVi ? `${streak} ngày liên tục` : `${streak} day streak`;
  };

  const getStreakColor = () => {
    if (streak >= 30) return 'text-purple-500';
    if (streak >= 7) return 'text-orange-500';
    if (streak >= 3) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  const showBonusMessage = streak === 6;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20',
        className
      )}
    >
      {streak >= 7 ? (
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <Flame className={cn('h-5 w-5', getStreakColor())} />
        </motion.div>
      ) : streak > 0 ? (
        <Flame className={cn('h-5 w-5', getStreakColor())} />
      ) : (
        <Award className="h-5 w-5 text-muted-foreground" />
      )}
      
      <span className={cn('font-medium text-sm', getStreakColor())}>
        {getStreakMessage()}
      </span>

      {showBonusMessage && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs text-green-500 font-medium"
        >
          {isVi ? '1 ngày nữa = +200 Bonus!' : '1 more day = +200 Bonus!'}
        </motion.span>
      )}
    </motion.div>
  );
}
