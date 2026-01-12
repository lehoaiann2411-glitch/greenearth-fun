import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingLeaf {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

interface MapDecorationsProps {
  showLeaves?: boolean;
  showClouds?: boolean;
  showGradient?: boolean;
  className?: string;
}

const LEAF_EMOJIS = ['🍃', '🌿', '☘️', '🌱', '🍀'];

export function MapDecorations({
  showLeaves = true,
  showClouds = true,
  showGradient = true,
  className
}: MapDecorationsProps) {
  const [leaves, setLeaves] = useState<FloatingLeaf[]>([]);

  useEffect(() => {
    if (!showLeaves) return;

    // Generate initial leaves
    const initialLeaves: FloatingLeaf[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      emoji: LEAF_EMOJIS[Math.floor(Math.random() * LEAF_EMOJIS.length)],
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
      size: 12 + Math.random() * 8
    }));
    setLeaves(initialLeaves);

    // Add new leaves periodically
    const interval = setInterval(() => {
      setLeaves(prev => {
        if (prev.length > 10) return prev.slice(1);
        return [
          ...prev,
          {
            id: Date.now(),
            emoji: LEAF_EMOJIS[Math.floor(Math.random() * LEAF_EMOJIS.length)],
            left: Math.random() * 100,
            delay: 0,
            duration: 8 + Math.random() * 6,
            size: 12 + Math.random() * 8
          }
        ];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [showLeaves]);

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
      {/* Gradient Overlays */}
      {showGradient && (
        <>
          {/* Top gradient - softer */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/5 to-transparent" />
          
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-br-full" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full" />
          
          {/* Bottom vignette */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/30 to-transparent" />
        </>
      )}

      {/* Floating Clouds */}
      {showClouds && (
        <div className="absolute top-4 left-0 right-0 h-20 overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '100%'] }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute top-2 left-0 text-2xl opacity-20"
          >
            ☁️
          </motion.div>
          <motion.div
            animate={{ x: ['20%', '120%'] }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            className="absolute top-6 left-0 text-3xl opacity-15"
          >
            ☁️
          </motion.div>
          <motion.div
            animate={{ x: ['-20%', '100%'] }}
            transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 text-xl opacity-20"
          >
            🌤️
          </motion.div>
        </div>
      )}

      {/* Floating Leaves */}
      <AnimatePresence>
        {showLeaves && leaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{ 
              y: '110vh', 
              opacity: [0, 1, 1, 0],
              rotate: [0, 360, 720, 1080],
              x: [0, 20, -20, 10, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: leaf.duration, 
              delay: leaf.delay,
              ease: 'linear'
            }}
            style={{ 
              left: `${leaf.left}%`,
              fontSize: leaf.size,
              position: 'absolute'
            }}
          >
            {leaf.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sparkle effects at corners */}
      <motion.div
        animate={{ 
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-20 right-10 text-lg"
      >
        ✨
      </motion.div>
      <motion.div
        animate={{ 
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        className="absolute top-32 left-8 text-sm"
      >
        ✨
      </motion.div>
    </div>
  );
}

// Stats floating bubbles component
interface StatBubbleProps {
  emoji: string;
  value: string | number;
  label: string;
  delay?: number;
}

export function StatBubble({ emoji, value, label, delay = 0 }: StatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className="flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg border border-primary/10"
    >
      <span className="text-lg">{emoji}</span>
      <div>
        <div className="font-bold text-sm text-primary">{value}</div>
        <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
      </div>
    </motion.div>
  );
}
