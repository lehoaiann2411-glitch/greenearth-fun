import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { CoinRain } from '@/components/rewards/CoinRain';
import { useConfetti } from '@/hooks/useConfetti';
import { formatCamly } from '@/lib/camlyCoin';
import { Gift, Sparkles } from 'lucide-react';

interface GiftReceivedAnimationProps {
  amount: number;
  senderName: string;
  senderAvatar?: string | null;
  onClose: () => void;
}

export function GiftReceivedAnimation({
  amount,
  senderName,
  senderAvatar,
  onClose,
}: GiftReceivedAnimationProps) {
  const { t } = useTranslation();
  const { triggerConfetti, triggerCoinRain } = useConfetti();
  const [showCoinRain, setShowCoinRain] = useState(false);

  useEffect(() => {
    // Trigger confetti on mount
    triggerConfetti('large');
    
    // Trigger coin rain for larger amounts
    if (amount >= 1000) {
      setShowCoinRain(true);
      triggerCoinRain();
    }

    // Auto close after animation
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [amount, triggerConfetti, triggerCoinRain, onClose]);

  return (
    <>
      <CoinRain trigger={showCoinRain} duration={3000} coinCount={30} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{ 
            scale: 1, 
            y: 0, 
            opacity: 1,
          }}
          exit={{ scale: 0.8, y: 20, opacity: 0 }}
          transition={{ 
            type: 'spring', 
            damping: 15, 
            stiffness: 300 
          }}
          className="relative p-8 rounded-3xl bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/90 dark:via-amber-950/90 dark:to-orange-950/90 border-2 border-yellow-400/50 shadow-2xl max-w-sm mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative sparkles */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2, repeat: Infinity },
            }}
            className="absolute -top-4 -left-4"
          >
            <Sparkles className="h-8 w-8 text-yellow-500" />
          </motion.div>
          
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
              scale: { duration: 1.5, repeat: Infinity },
            }}
            className="absolute -top-3 -right-3"
          >
            <Sparkles className="h-6 w-6 text-amber-500" />
          </motion.div>

          {/* Gift icon */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [-5, 5, -5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-4"
          >
            <div className="p-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg">
              <Gift className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent mb-2"
          >
            {t('messages.giftReceived', 'Gift Received!')}
          </motion.h2>

          {/* Sender info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            {senderAvatar ? (
              <img 
                src={senderAvatar} 
                alt={senderName}
                className="w-8 h-8 rounded-full border-2 border-yellow-400"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                {senderName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-muted-foreground">
              {t('messages.giftFrom', { name: senderName })}
            </span>
          </motion.div>

          {/* Amount */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', damping: 10 }}
            className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 border border-yellow-300 dark:border-yellow-700"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
            >
              <CamlyCoinIcon size="xl" animated />
            </motion.div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                +{formatCamly(amount)}
              </p>
              <p className="text-sm text-muted-foreground">Camly Coin</p>
            </div>
          </motion.div>

          {/* Close hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-xs text-muted-foreground mt-4"
          >
            {t('common.tapToClose', 'Tap anywhere to close')}
          </motion.p>
        </motion.div>
      </motion.div>
    </>
  );
}
