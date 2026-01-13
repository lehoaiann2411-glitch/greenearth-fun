import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';

interface FlyingCoinAnimationProps {
  trigger: boolean;
  amount: number;
  onComplete?: () => void;
}

interface Coin {
  id: number;
  delay: number;
}

export function FlyingCoinAnimation({ trigger, amount, onComplete }: FlyingCoinAnimationProps) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      
      // Create coins based on amount (max 10)
      const coinCount = Math.min(Math.ceil(amount / 500), 10);
      const newCoins = Array.from({ length: coinCount }, (_, i) => ({
        id: i,
        delay: i * 0.1,
      }));
      
      setCoins(newCoins);

      // Clear after animation
      const timer = setTimeout(() => {
        setCoins([]);
        setIsActive(false);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger, amount, isActive, onComplete]);

  return (
    <AnimatePresence>
      {coins.map((coin) => (
        <motion.div
          key={coin.id}
          initial={{ 
            opacity: 1, 
            scale: 0.5,
            x: 0,
            y: 0,
          }}
          animate={{ 
            opacity: [1, 1, 0],
            scale: [0.5, 1.2, 0.8],
            x: [0, 50, 150],
            y: [0, -100, -50],
            rotate: [0, 180, 360],
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{
            duration: 1.2,
            delay: coin.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="fixed z-50 pointer-events-none"
          style={{ 
            bottom: '50%',
            left: '50%',
          }}
        >
          <div className="relative">
            <CamlyCoinIcon size="lg" animated />
            {/* Sparkle trail */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, delay: coin.delay + 0.2 }}
              className="absolute -top-2 -right-2"
            >
              <span className="text-yellow-400">✨</span>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
