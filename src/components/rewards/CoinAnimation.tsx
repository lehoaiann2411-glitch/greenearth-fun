import { motion } from 'framer-motion';
import { CamlyCoinIcon } from './CamlyCoinIcon';

interface CoinAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'sm' as const,
  md: 'md' as const,
  lg: 'lg' as const,
};

export function CoinAnimation({ size = 'md', animated = true, className = '' }: CoinAnimationProps) {
  return (
    <CamlyCoinIcon 
      size={sizeMap[size]} 
      animated={animated} 
      useImage={true}
      className={className} 
    />
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
      <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-white px-8 py-6 rounded-2xl shadow-2xl shadow-yellow-500/30 flex flex-col items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          <CamlyCoinIcon size="xl" animated={false} />
        </motion.div>
        <div className="text-center">
          <p className="text-2xl font-bold">+{camly.toLocaleString()} Camly Coin</p>
          {points > 0 && (
            <p className="text-lg opacity-90">+{points} Green Points</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
