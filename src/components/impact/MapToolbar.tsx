import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapSearchBox } from './MapSearchBox';
import { motion } from 'framer-motion';

type MapStyle = 'satellite' | 'streets' | 'hybrid';

interface MapToolbarProps {
  mapStyle: MapStyle;
  onMapStyleChange: (style: MapStyle) => void;
  show3D: boolean;
  onToggle3D: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isDrawing: boolean;
  onStartDrawing: () => void;
  onLocationSelect: (lat: number, lon: number, name: string) => void;
  totalTrees?: number;
  totalCO2?: number;
  className?: string;
}

const mapStyleOptions = [
  { id: 'satellite' as const, emoji: '🛰️', label: 'Vệ tinh' },
  { id: 'streets' as const, emoji: '🗺️', label: 'Đường' },
  { id: 'hybrid' as const, emoji: '🏙️', label: 'Kết hợp' }
];

export function MapToolbar({
  mapStyle,
  onMapStyleChange,
  show3D,
  onToggle3D,
  isFullscreen,
  onToggleFullscreen,
  isDrawing,
  onStartDrawing,
  onLocationSelect,
  totalTrees = 0,
  totalCO2 = 0,
  className
}: MapToolbarProps) {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className={cn(
        'flex flex-wrap items-center gap-2 p-2.5',
        'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md',
        'rounded-2xl shadow-xl border-2 border-white/50 dark:border-gray-700/50',
        className
      )}
    >
      {/* Search - Cute style */}
      <MapSearchBox 
        onLocationSelect={onLocationSelect}
        className="flex-1 min-w-[180px] max-w-[280px]"
        placeholder={t('impact.map.searchPlaceholder', '🔍 Tìm nơi trồng cây...')}
      />

      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent" />

      {/* Map Style Pill Buttons */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
        {mapStyleOptions.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMapStyleChange(option.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              mapStyle === option.id
                ? 'bg-gradient-to-r from-primary to-green-600 text-white shadow-md'
                : 'hover:bg-white/80 dark:hover:bg-gray-800/80 text-muted-foreground'
            )}
          >
            <span>{option.emoji}</span>
            <span className="hidden lg:inline">{option.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent" />

      {/* 3D Toggle - Cute */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle3D}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
          show3D
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
            : 'bg-muted/50 hover:bg-muted text-muted-foreground'
        )}
      >
        <span>🏠</span>
        <span className="hidden md:inline">3D</span>
      </motion.button>

      {/* Draw Button - Cute */}
      {!isDrawing && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartDrawing}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium',
            'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md',
            'hover:shadow-lg transition-shadow'
          )}
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 2 }}
          >
            ✏️
          </motion.span>
          <span className="hidden md:inline">{t('impact.map.draw', 'Vẽ')}</span>
        </motion.button>
      )}

      {/* Fullscreen Toggle */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          className="h-9 w-9 rounded-xl hover:bg-muted/80"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </motion.div>

      {/* Stats - Cute bubbles on larger screens */}
      <div className="hidden xl:flex items-center gap-2 ml-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🌲
          </motion.span>
          <span className="font-bold text-sm text-green-700 dark:text-green-400">
            {totalTrees.toLocaleString()}
          </span>
          <span className="text-xs text-green-600 dark:text-green-500">
            {t('impact.map.trees', 'cây')}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full"
        >
          <span>🌿</span>
          <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
            {(totalCO2 / 1000).toFixed(1)}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-500">
            {t('common.ton', 'tấn')}/{t('common.year', 'năm')}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
