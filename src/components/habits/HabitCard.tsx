import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import type { EcoHabit } from '@/hooks/useEcoHabits';

interface HabitCardProps {
  habit: EcoHabit;
  isCompleted: boolean;
  isLoading: boolean;
  onComplete: () => void;
}

export function HabitCard({ habit, isCompleted, isLoading, onComplete }: HabitCardProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  
  const title = isVi ? habit.title_vi : habit.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`
          relative overflow-hidden transition-all duration-300
          ${isCompleted 
            ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800' 
            : 'bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-green-400/50'
          }
        `}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Emoji Icon */}
            <div 
              className={`
                flex h-12 w-12 items-center justify-center rounded-xl text-2xl
                transition-all duration-300
                ${isCompleted 
                  ? 'bg-green-200 dark:bg-green-900' 
                  : 'bg-muted'
                }
              `}
            >
              {habit.icon_emoji || '🌱'}
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <p 
                className={`
                  font-medium text-sm leading-tight
                  ${isCompleted ? 'text-green-700 dark:text-green-400 line-through' : ''}
                `}
              >
                {title}
              </p>
            </div>

            {/* Reward Badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <CamlyCoinIcon size="xs" />
              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                +{habit.camly_reward}
              </span>
            </div>

            {/* Checkbox */}
            <div className="flex items-center">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-green-500" />
              ) : isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500"
                >
                  <Check className="h-4 w-4 text-white" />
                </motion.div>
              ) : (
                <Checkbox
                  checked={false}
                  onCheckedChange={onComplete}
                  className="h-6 w-6 rounded-full border-2 border-green-400 data-[state=checked]:bg-green-500"
                />
              )}
            </div>
          </div>
        </CardContent>

        {/* Completed overlay shine effect */}
        {isCompleted && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}
      </Card>
    </motion.div>
  );
}
