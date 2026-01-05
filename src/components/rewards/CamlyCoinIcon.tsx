import { motion } from 'framer-motion';
import camlyCoinImage from '@/assets/camly-coin.png';

interface CamlyCoinIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  useImage?: boolean;
  className?: string;
}

const sizes = {
  xs: { container: 'w-4 h-4', icon: 8 },
  sm: { container: 'w-6 h-6', icon: 12 },
  md: { container: 'w-10 h-10', icon: 20 },
  lg: { container: 'w-14 h-14', icon: 28 },
  xl: { container: 'w-20 h-20', icon: 40 },
};

export function CamlyCoinIcon({ 
  size = 'md', 
  animated = false, 
  useImage = true,
  className = '' 
}: CamlyCoinIconProps) {
  const sizeConfig = sizes[size];

  const coinContent = useImage ? (
    <img 
      src={camlyCoinImage} 
      alt="Camly Coin" 
      className="w-full h-full object-contain rounded-full"
    />
  ) : (
    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 flex items-center justify-center border-2 border-yellow-600/50 shadow-lg shadow-yellow-500/40">
      {/* Shine overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent" />
      {/* C symbol with Bitcoin-style lines */}
      <div className="relative flex flex-col items-center justify-center text-white font-bold" style={{ fontSize: sizeConfig.icon * 0.7 }}>
        <div className="absolute -top-0.5 w-0.5 h-1 bg-white/80" style={{ height: sizeConfig.icon * 0.15 }} />
        <span className="text-shadow-sm">C</span>
        <div className="absolute -bottom-0.5 w-0.5 h-1 bg-white/80" style={{ height: sizeConfig.icon * 0.15 }} />
      </div>
    </div>
  );

  if (!animated) {
    return (
      <div className={`${sizeConfig.container} ${className}`}>
        {coinContent}
      </div>
    );
  }

  return (
    <motion.div
      className={`${sizeConfig.container} ${className}`}
      animate={{
        rotateY: [0, 360],
      }}
      transition={{
        rotateY: {
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        },
      }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="w-full h-full"
        animate={{
          boxShadow: [
            '0 0 10px rgba(255, 215, 0, 0.5)',
            '0 0 25px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.4)',
            '0 0 10px rgba(255, 215, 0, 0.5)',
          ],
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        style={{ borderRadius: '50%' }}
      >
        {coinContent}
      </motion.div>
    </motion.div>
  );
}

// Sparkle effect component for celebrations
export function CoinSparkles({ active = false }: { active?: boolean }) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            x: [0, (Math.random() - 0.5) * 40],
            y: [0, (Math.random() - 0.5) * 40],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeOut',
          }}
          style={{
            left: '50%',
            top: '50%',
          }}
        />
      ))}
    </div>
  );
}

// Inline coin icon for text (replaces 🪙 emoji)
interface CamlyCoinInlineProps {
  className?: string;
}

export function CamlyCoinInline({ className = '' }: CamlyCoinInlineProps) {
  return (
    <img 
      src={camlyCoinImage} 
      alt="Camly" 
      className={`inline-block w-4 h-4 align-text-bottom ${className}`}
    />
  );
}
