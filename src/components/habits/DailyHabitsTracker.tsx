import { motion } from 'framer-motion';
import { Leaf, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useEcoHabits } from '@/hooks/useEcoHabits';
import { HabitCard } from './HabitCard';
import { HabitStreak } from './HabitStreak';
import { HabitCalendar } from './HabitCalendar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { cn } from '@/lib/utils';

export function DailyHabitsTracker() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isVi = i18n.language === 'vi';
  const [showCalendar, setShowCalendar] = useState(false);
  
  const { habits, stats, calendar, isLoading, completeHabit } = useEcoHabits();

  if (!user) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Leaf className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p>{isVi ? 'Đăng nhập để theo dõi thói quen xanh' : 'Login to track your eco habits'}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const progress = stats.totalToday > 0 
    ? (stats.completedToday / stats.totalToday) * 100 
    : 0;

  const allComplete = stats.completedToday >= stats.totalToday;

  return (
    <div className="space-y-6">
      {/* Header with streak and progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <HabitStreak streak={stats.habitStreak} />
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {stats.completedToday}/{stats.totalToday}
          </span>
          {allComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-green-500"
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">
                {isVi ? 'Hoàn thành!' : 'Complete!'}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{isVi ? 'Tiến độ hôm nay' : 'Today\'s progress'}</span>
          <div className="flex items-center gap-1">
            <CamlyCoinIcon size="xs" />
            <span>+{stats.completedToday * 30} / {stats.totalToday * 30 + 100}</span>
          </div>
        </div>
      </div>

      {/* All complete celebration */}
      {allComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4 text-center"
        >
          <p className="text-lg font-medium text-green-600 dark:text-green-400">
            🌍 {isVi 
              ? 'Tuyệt vời! Bạn đã góp phần cứu Trái Đất hôm nay!' 
              : 'Amazing! You helped save the Earth today!'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isVi ? 'Quay lại vào ngày mai để tiếp tục streak!' : 'Come back tomorrow to continue your streak!'}
          </p>
        </motion.div>
      )}

      {/* Habits grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {habits.map((habit, index) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <HabitCard
              habit={habit}
              onComplete={() => completeHabit.mutate({ 
                habitId: habit.id, 
                camlyReward: habit.camly_reward 
              })}
              isPending={completeHabit.isPending}
            />
          </motion.div>
        ))}
      </div>

      {/* Calendar toggle */}
      <div className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full justify-center gap-2"
        >
          {showCalendar ? (
            <>
              <ChevronUp className="h-4 w-4" />
              {isVi ? 'Ẩn lịch' : 'Hide calendar'}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              {isVi ? 'Xem lịch tháng' : 'View monthly calendar'}
            </>
          )}
        </Button>

        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <HabitCalendar data={calendar} />
          </motion.div>
        )}
      </div>

      {/* Rewards info */}
      <div className="rounded-xl bg-muted/30 p-4 space-y-2 text-sm">
        <p className="font-medium flex items-center gap-2">
          <CamlyCoinIcon size="sm" />
          {isVi ? 'Phần thưởng' : 'Rewards'}
        </p>
        <ul className="space-y-1 text-muted-foreground text-xs">
          <li>• {isVi ? 'Mỗi thói quen: +30 Camly' : 'Each habit: +30 Camly'}</li>
          <li>• {isVi ? 'Hoàn thành tất cả: +100 Bonus' : 'Complete all: +100 Bonus'}</li>
          <li>• {isVi ? 'Streak 7 ngày: +200 Bonus' : '7-day streak: +200 Bonus'}</li>
          <li>• {isVi ? 'Streak 30 ngày: +500 Bonus' : '30-day streak: +500 Bonus'}</li>
        </ul>
      </div>
    </div>
  );
}
