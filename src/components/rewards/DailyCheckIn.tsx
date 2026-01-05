import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Flame, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCheckInStatus, useDailyCheckIn } from '@/hooks/useDailyCheckIn';
import { CAMLY_REWARDS, formatCamly } from '@/lib/camlyCoin';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function DailyCheckIn() {
  const { t } = useTranslation();
  const { data: status, isLoading: statusLoading } = useCheckInStatus();
  const checkIn = useDailyCheckIn();

  const currentStreak = status?.currentStreak || 0;
  const hasCheckedIn = status?.hasCheckedInToday || false;

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayNumber = i + 1;
    const isCompleted = currentStreak >= dayNumber;
    const isCurrent = currentStreak === dayNumber - 1 && !hasCheckedIn;
    const isStreakBonus = dayNumber === 7;
    
    return { dayNumber, isCompleted, isCurrent, isStreakBonus };
  });

  const handleCheckIn = () => {
    if (!hasCheckedIn) {
      checkIn.mutate();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 border-emerald-200 dark:border-emerald-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">
              {t('rewards.dailyCheckIn', 'Daily Check-in')}
            </h3>
          </div>
          {currentStreak > 0 && (
            <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {currentStreak} {t('rewards.dayStreak', 'day streak')}
              </span>
            </div>
          )}
        </div>

        {/* Week Calendar */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(({ dayNumber, isCompleted, isCurrent, isStreakBonus }) => (
            <motion.div
              key={dayNumber}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: dayNumber * 0.05 }}
              className={cn(
                'relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-colors',
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : isCurrent
                  ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400'
                  : 'bg-white/50 dark:bg-white/10 text-muted-foreground',
                isStreakBonus && !isCompleted && 'ring-2 ring-yellow-400 ring-offset-1'
              )}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span>{dayNumber}</span>
              )}
              {isStreakBonus && (
                <div className="absolute -top-1 -right-1 text-xs">🎁</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Rewards Info */}
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-muted-foreground">
            {t('rewards.dailyReward', 'Daily reward')}:
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            +{formatCamly(CAMLY_REWARDS.DAILY_CHECK_IN)} 🪙
          </span>
        </div>

        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-muted-foreground">
            {t('rewards.streakBonus', '7-day bonus')}:
          </span>
          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
            +{formatCamly(CAMLY_REWARDS.STREAK_7_DAY_BONUS)} 🎁
          </span>
        </div>

        {/* Check-in Button */}
        <Button
          onClick={handleCheckIn}
          disabled={hasCheckedIn || checkIn.isPending || statusLoading}
          className={cn(
            'w-full',
            hasCheckedIn
              ? 'bg-muted text-muted-foreground'
              : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
          )}
        >
          {checkIn.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.loading', 'Loading...')}
            </>
          ) : hasCheckedIn ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('rewards.checkedIn', 'Checked In Today!')}
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              {t('rewards.checkInNow', 'Check In Now!')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
