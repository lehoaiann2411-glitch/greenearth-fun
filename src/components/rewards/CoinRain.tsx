import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import camlyCoinImage from '@/assets/camly-coin.png';

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

interface Sparkle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export function CoinRain({ trigger, duration = 3000, coinCount = 25 }: CoinRainProps) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      
      // Generate random coins
      const newCoins: Coin[] = Array.from({ length: coinCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        size: 24 + Math.random() * 24,
        rotation: Math.random() * 720 - 360,
      }));
      
      // Generate sparkles
      const newSparkles: Sparkle[] = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1.5,
      }));
      
      setCoins(newCoins);
      setSparkles(newSparkles);

      // Clear coins after animation
      const timer = setTimeout(() => {
        setCoins([]);
        setSparkles([]);
        setIsActive(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration, coinCount, isActive]);

  return (
    <AnimatePresence>
      {(coins.length > 0 || sparkles.length > 0) && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Sparkles */}
          {sparkles.map((sparkle) => (
            <motion.div
              key={`sparkle-${sparkle.id}`}
              initial={{
                x: `${sparkle.x}vw`,
                y: `${sparkle.y}vh`,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 0.8,
                delay: sparkle.delay,
                ease: 'easeOut',
              }}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full"
              style={{
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.4)',
              }}
            />
          ))}

          {/* Coins */}
          {coins.map((coin) => (
            <motion.div
              key={coin.id}
              initial={{
                x: `${coin.x}vw`,
                y: -80,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: coin.rotation,
                opacity: [1, 1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.5 + Math.random() * 0.5,
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
                {/* Golden glow effect */}
                <div 
                  className="absolute inset-0 rounded-full blur-sm"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)',
                    transform: 'scale(1.3)',
                  }}
                />
                {/* Coin image */}
                <img 
                  src={camlyCoinImage} 
                  alt="" 
                  className="w-full h-full object-contain rounded-full"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.4))',
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
