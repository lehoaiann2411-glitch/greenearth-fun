import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { formatCamly } from '@/lib/camlyCoin';
import { Gift, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CamlyGiftMessageProps {
  amount: number;
  isSender: boolean;
  senderName?: string;
}

export function CamlyGiftMessage({ amount, isSender, senderName }: CamlyGiftMessageProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      className={cn(
        'relative p-4 rounded-2xl overflow-hidden max-w-[280px]',
        'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100',
        'dark:from-yellow-900/80 dark:via-amber-900/80 dark:to-orange-900/80',
        'border-2 border-yellow-300/50 dark:border-yellow-600/50',
        'shadow-lg shadow-yellow-500/20'
      )}
    >
      {/* Background sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-2 left-2"
        >
          <Sparkles className="h-4 w-4 text-yellow-500/50" />
        </motion.div>
        <motion.div
          animate={{ 
            x: [0, -50, 0],
            y: [0, 50, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          className="absolute bottom-2 right-2"
        >
          <Sparkles className="h-3 w-3 text-amber-500/50" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Gift className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </motion.div>
          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
            {isSender 
              ? t('messages.youSentGift', 'You sent a gift') 
              : t('messages.receivedGift', 'Gift received!')}
          </span>
        </div>

        {/* Coin and amount */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              rotateY: { duration: 3, repeat: Infinity, ease: 'linear' },
              scale: { duration: 1.5, repeat: Infinity },
            }}
            style={{ perspective: 100 }}
          >
            <CamlyCoinIcon size="lg" animated />
          </motion.div>
          <div>
            <motion.p 
              className="text-2xl font-bold text-yellow-600 dark:text-yellow-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              {isSender ? '-' : '+'}{formatCamly(amount)}
            </motion.p>
            <p className="text-xs text-muted-foreground">Camly Coin</p>
          </div>
        </div>

        {/* Decorative line */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />

        {/* Footer text */}
        <p className="text-xs text-center text-yellow-700/70 dark:text-yellow-300/70">
          {isSender 
            ? t('messages.giftSentSuccess', 'Gift sent successfully! 🎉')
            : t('messages.thankYouGift', 'Thank you for the gift! 💛')}
        </p>
      </div>
    </motion.div>
  );
}
