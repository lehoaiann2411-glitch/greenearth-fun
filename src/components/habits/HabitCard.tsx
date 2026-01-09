import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';

interface HabitCardProps {
  habit: {
    id: string;
    title: string;
    title_vi: string;
    icon_emoji: string;
    camly_reward: number;
    isCompleted: boolean;
  };
  onComplete: () => void;
  isPending?: boolean;
}

export function HabitCard({ habit, onComplete, isPending }: HabitCardProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const title = isVi ? habit.title_vi : habit.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: habit.isCompleted ? 1 : 1.02 }}
      whileTap={{ scale: habit.isCompleted ? 1 : 0.98 }}
      className={cn(
        'relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 cursor-pointer',
        habit.isCompleted
          ? 'bg-green-500/20 border-green-500/40 dark:bg-green-500/10'
          : 'bg-white/10 border-white/20 hover:border-green-500/50 hover:bg-white/20 dark:bg-white/5'
      )}
      onClick={() => !habit.isCompleted && !isPending && onComplete()}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Icon */}
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all',
          habit.isCompleted 
            ? 'bg-green-500/30' 
            : 'bg-muted'
        )}>
          {habit.icon_emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium text-sm line-clamp-2 transition-colors',
            habit.isCompleted && 'text-green-600 dark:text-green-400'
          )}>
            {title}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <CamlyCoinIcon size="xs" />
            <span className={cn(
              'text-xs font-medium',
              habit.isCompleted 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-yellow-600 dark:text-yellow-400'
            )}>
              +{habit.camly_reward}
            </span>
          </div>
        </div>

        {/* Checkbox */}
        <div className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
          habit.isCompleted
            ? 'bg-green-500 border-green-500'
            : 'border-muted-foreground/30 hover:border-green-500',
          isPending && 'opacity-50'
        )}>
          {habit.isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <Check className="h-5 w-5 text-white" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Completed overlay effect */}
      {habit.isCompleted && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        />
      )}
    </motion.div>
  );
}
