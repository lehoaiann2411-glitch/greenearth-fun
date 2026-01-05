import { motion, AnimatePresence } from 'framer-motion';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';

interface CamlyEarnedAnimationProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
}

export function CamlyEarnedAnimation({ amount, show, onComplete }: CamlyEarnedAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -50, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.5 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          onAnimationComplete={onComplete}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30">
            <CamlyCoinIcon size="sm" animated />
            <span className="text-white font-bold text-lg">
              +{amount.toLocaleString()}
            </span>
          </div>

          {/* Floating coins */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                x: (Math.random() - 0.5) * 100,
                y: -80 - Math.random() * 50,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className="absolute top-0 left-1/2"
            >
              <CamlyCoinIcon size="xs" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
