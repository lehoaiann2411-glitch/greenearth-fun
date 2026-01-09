import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, PartyPopper, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  useTodayHabits, 
  useTodayCompletions, 
  useHabitStreak, 
  useMonthlyCalendar,
  useCompleteHabit 
} from '@/hooks/useEcoHabits';
import { HabitCard } from './HabitCard';
import { HabitStreak } from './HabitStreak';
import { HabitCalendar } from './HabitCalendar';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { CoinRain } from '@/components/rewards/CoinRain';
import { Skeleton } from '@/components/ui/skeleton';
import { CAMLY_REWARDS } from '@/lib/camlyCoin';

export function DailyHabitsTracker() {
  const { t } = useTranslation();
  const [showCelebration, setShowCelebration] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showCoinRain, setShowCoinRain] = useState(false);

  const { data: habits, isLoading: habitsLoading } = useTodayHabits();
  const { data: completions, isLoading: completionsLoading } = useTodayCompletions();
  const { data: streakData } = useHabitStreak();
  const { data: calendar } = useMonthlyCalendar();
  const completeHabit = useCompleteHabit();

  const isLoading = habitsLoading || completionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-3 w-full" />
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const completedIds = new Set(completions?.map((c) => c.habit_id) || []);
  const completedCount = completedIds.size;
  const totalHabits = habits?.length || 0;
  const progressPercent = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;
  const allComplete = completedCount === totalHabits && totalHabits > 0;

  const handleComplete = async (habitId: string) => {
    if (completedIds.has(habitId) || completeHabit.isPending) return;

    setCompletingId(habitId);
    
    try {
      const result = await completeHabit.mutateAsync({
        habitId,
        totalHabits,
        completedCount,
      });

      if (result.isComplete) {
        setShowCoinRain(true);
        setTimeout(() => {
          setShowCelebration(true);
          setShowCoinRain(false);
        }, 1000);
      }
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <>
      <CoinRain trigger={showCoinRain} />
      
      <div className="space-y-6">
        {/* Header with Streak */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <HabitStreak streak={streakData?.streak || 0} />
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t('habits.todayProgress')}</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {completedCount}/{totalHabits}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-3" />
          {allComplete && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm font-medium text-green-600 dark:text-green-400 flex items-center justify-center gap-1"
            >
              <Sparkles className="h-4 w-4" />
              {t('habits.allCompleteToday')}
              <Sparkles className="h-4 w-4" />
            </motion.p>
          )}
        </div>

        {/* Habits Grid */}
        <div className="grid gap-3 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {habits?.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <HabitCard
                  habit={habit}
                  isCompleted={completedIds.has(habit.id)}
                  isLoading={completingId === habit.id}
                  onComplete={() => handleComplete(habit.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Calendar Section */}
        {calendar && Object.keys(calendar).length > 0 && (
          <div className="pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-500" />
              {t('habits.monthlyProgress')}
            </h4>
            <HabitCalendar calendar={calendar} />
          </div>
        )}
      </div>

      {/* Celebration Modal */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="mx-auto mb-4"
            >
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto">
                <PartyPopper className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <DialogTitle className="text-2xl">
              {t('habits.celebrationTitle')} 🎉
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {t('habits.celebrationMessage')}
            </DialogDescription>
          </DialogHeader>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="py-6"
          >
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              <CamlyCoinIcon size="lg" animated />
              <span>+{CAMLY_REWARDS.COMPLETE_ALL_HABITS}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t('habits.bonusEarned')}
            </p>
          </motion.div>

          <Button 
            onClick={() => setShowCelebration(false)}
            className="w-full gradient-forest"
          >
            {t('habits.keepItUp')} 💪
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
