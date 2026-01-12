import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MapStatsCardsProps {
  totalTrees: number;
  totalCO2: number;
  totalAreas?: number;
  className?: string;
}

export function MapStatsCards({
  totalTrees,
  totalCO2,
  totalAreas = 0,
  className
}: MapStatsCardsProps) {
  const { t } = useTranslation();

  const stats = [
    {
      emoji: '🌲',
      value: totalTrees.toLocaleString(),
      label: t('impact.map.treesPlanted', 'cây đã trồng'),
      bgColor: 'from-green-500/20 to-emerald-500/10',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      emoji: '🌿',
      value: `${(totalCO2 / 1000).toFixed(1)} ${t('common.ton', 'tấn')}`,
      label: t('impact.map.co2Absorbed', 'CO₂ hấp thụ'),
      bgColor: 'from-emerald-500/20 to-teal-500/10',
      textColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      emoji: '🗺️',
      value: totalAreas,
      label: t('impact.map.forestAreas', 'khu vực'),
      bgColor: 'from-blue-500/20 to-cyan-500/10',
      textColor: 'text-blue-600 dark:text-blue-400'
    }
  ];

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1 + index * 0.1, type: 'spring', stiffness: 200 }}
          className={cn(
            'flex items-center gap-2 px-3 py-2',
            'bg-gradient-to-r backdrop-blur-sm rounded-full',
            'shadow-lg border border-white/20',
            stat.bgColor
          )}
        >
          <motion.span 
            className="text-xl"
            animate={{ 
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3 + index 
            }}
          >
            {stat.emoji}
          </motion.span>
          <div>
            <div className={cn('font-bold text-sm leading-tight', stat.textColor)}>
              {stat.value}
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              {stat.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Compact version for mobile
export function MapStatsCompact({
  totalTrees,
  totalCO2,
  className
}: Omit<MapStatsCardsProps, 'totalAreas'>) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-3 px-3 py-2',
        'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md',
        'rounded-full shadow-lg border border-primary/10',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-base">🌲</span>
        <span className="font-bold text-xs text-primary">{totalTrees.toLocaleString()}</span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-1.5">
        <span className="text-base">🌿</span>
        <span className="font-bold text-xs text-emerald-600">{(totalCO2 / 1000).toFixed(1)}t</span>
      </div>
    </motion.div>
  );
}
