import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapSearchBox } from './MapSearchBox';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type MapStyle = 'satellite' | 'streets' | 'hybrid' | 'bright';

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
  // Weather & AQI controls
  showWeather?: boolean;
  onToggleWeather?: () => void;
  showAQI?: boolean;
  onToggleAQI?: () => void;
  // Vietnam Islands controls
  onFlyToHoangSa?: () => void;
  onFlyToTruongSa?: () => void;
  onFlyToAllIslands?: () => void;
}

const mapStyleOptions = [
  { id: 'satellite' as const, emoji: '🛰️', label: 'Vệ tinh', labelEn: 'Satellite' },
  { id: 'streets' as const, emoji: '🗺️', label: 'Đường', labelEn: 'Streets' },
  { id: 'bright' as const, emoji: '🌈', label: 'Tươi sáng', labelEn: 'Bright' },
  { id: 'hybrid' as const, emoji: '🏙️', label: 'Kết hợp', labelEn: 'Hybrid' }
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
  className,
  showWeather = false,
  onToggleWeather,
  showAQI = false,
  onToggleAQI,
  onFlyToHoangSa,
  onFlyToTruongSa,
  onFlyToAllIslands
}: MapToolbarProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className={cn(
        'flex flex-wrap items-center gap-2 p-2.5',
        'bg-gradient-to-r from-white/95 via-emerald-50/90 to-cyan-50/90 dark:from-gray-900/95 dark:via-emerald-950/90 dark:to-cyan-950/90 backdrop-blur-xl',
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
      <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-emerald-300/50 to-transparent" />

      {/* Map Style Pill Buttons */}
      <div className="flex gap-1 p-1 bg-gradient-to-r from-emerald-100/50 to-cyan-100/50 dark:from-emerald-900/30 dark:to-cyan-900/30 rounded-xl">
        {mapStyleOptions.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMapStyleChange(option.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              mapStyle === option.id
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-md'
                : 'hover:bg-white/80 dark:hover:bg-gray-800/80 text-muted-foreground'
            )}
          >
            <span>{option.emoji}</span>
            <span className="hidden lg:inline">{isVi ? option.label : option.labelEn}</span>
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-emerald-300/50 to-transparent" />

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

      {/* Weather Toggle */}
      {onToggleWeather && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleWeather}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
            showWeather
              ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md'
              : 'bg-muted/50 hover:bg-muted text-muted-foreground'
          )}
        >
          <motion.span
            animate={showWeather ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            ⛅
          </motion.span>
          <span className="hidden md:inline">{isVi ? 'Thời tiết' : 'Weather'}</span>
        </motion.button>
      )}

      {/* AQI Toggle */}
      {onToggleAQI && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleAQI}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
            showAQI
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
              : 'bg-muted/50 hover:bg-muted text-muted-foreground'
          )}
        >
          <motion.span
            animate={showAQI ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            💨
          </motion.span>
          <span className="hidden md:inline">AQI</span>
        </motion.button>
      )}

      {/* Vietnam Islands Dropdown */}
      {(onFlyToHoangSa || onFlyToTruongSa || onFlyToAllIslands) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium',
                'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md',
                'hover:shadow-lg transition-shadow'
              )}
            >
              <span>🏝️</span>
              <span className="hidden md:inline">{t('islands.title')}</span>
              <ChevronDown className="h-3 w-3" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px]">
            <DropdownMenuItem onClick={onFlyToHoangSa} className="gap-2">
              <span>🇻🇳</span>
              {t('islands.hoangSa')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onFlyToTruongSa} className="gap-2">
              <span>🇻🇳</span>
              {t('islands.truongSa')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onFlyToAllIslands} className="gap-2">
              <span>🌊</span>
              {t('islands.viewAll')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Draw Button - Cute */}
      {!isDrawing && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartDrawing}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium',
            'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 text-white shadow-md',
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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-full border border-emerald-200/50"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🌲
          </motion.span>
          <span className="font-bold text-sm bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30 rounded-full border border-teal-200/50"
        >
          <span>🌿</span>
          <span className="font-bold text-sm bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
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
