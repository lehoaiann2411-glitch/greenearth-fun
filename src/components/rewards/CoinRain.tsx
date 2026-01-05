import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

interface CoinRainProps {
  trigger: boolean;
  duration?: number;
  coinCount?: number;
}

interface Coin {
  id: number;
  x: number;
  delay: number;
  size: number;
  rotation: number;
}

export function CoinRain({ trigger, duration = 3000, coinCount = 20 }: CoinRainProps) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      
      // Generate random coins
      const newCoins: Coin[] = Array.from({ length: coinCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: 16 + Math.random() * 16,
        rotation: Math.random() * 720 - 360,
      }));
      
      setCoins(newCoins);

      // Clear coins after animation
      const timer = setTimeout(() => {
        setCoins([]);
        setIsActive(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration, coinCount, isActive]);

  return (
    <AnimatePresence>
      {coins.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {coins.map((coin) => (
            <motion.div
              key={coin.id}
              initial={{
                x: `${coin.x}vw`,
                y: -50,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: '100vh',
                rotate: coin.rotation,
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2 + Math.random(),
                delay: coin.delay,
                ease: 'easeIn',
              }}
              className="absolute"
              style={{ left: 0 }}
            >
              <div
                className="relative"
                style={{
                  width: coin.size,
                  height: coin.size,
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/30" />
                <Coins 
                  className="absolute inset-0 m-auto text-yellow-700" 
                  style={{ 
                    width: coin.size * 0.6, 
                    height: coin.size * 0.6 
                  }} 
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Hook to trigger coin rain
export function useCoinRain() {
  const [trigger, setTrigger] = useState(false);

  const triggerRain = () => {
    setTrigger(true);
    setTimeout(() => setTrigger(false), 100);
  };

  return { trigger, triggerRain };
}
