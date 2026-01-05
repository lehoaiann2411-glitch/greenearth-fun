import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';

interface CoinAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function CoinAnimation({ size = 'md', animated = true, className = '' }: CoinAnimationProps) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 12,
    md: 20,
    lg: 32,
  };

  if (!animated) {
    return (
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg ${className}`}>
        <Coins size={iconSizes[size]} className="text-white" />
      </div>
    );
  }

  return (
    <motion.div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg ${className}`}
      animate={{
        rotateY: [0, 360],
        boxShadow: [
          '0 0 5px rgba(34, 197, 94, 0.5)',
          '0 0 20px rgba(34, 197, 94, 0.8)',
          '0 0 5px rgba(34, 197, 94, 0.5)',
        ],
      }}
      transition={{
        rotateY: {
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        },
        boxShadow: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
    >
      <Coins size={iconSizes[size]} className="text-white" />
    </motion.div>
  );
}

interface PointsPopupProps {
  points: number;
  camly: number;
  show: boolean;
}

export function PointsPopup({ points, camly, show }: PointsPopupProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          <CoinAnimation size="lg" animated={false} />
        </motion.div>
        <div className="text-center">
          <p className="text-2xl font-bold">+{points} Green Points</p>
          <p className="text-lg opacity-90">≈ {camly} CAMLY</p>
        </div>
      </div>
    </motion.div>
  );
}
