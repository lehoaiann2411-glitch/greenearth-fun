import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type WeatherLayerType = 'clouds' | 'precipitation' | 'temp' | 'wind' | null;

interface WeatherLayerControlProps {
  isOpen: boolean;
  onClose: () => void;
  activeLayer: WeatherLayerType;
  onLayerChange: (layer: WeatherLayerType) => void;
  lastUpdated?: Date;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const WEATHER_LAYERS = [
  { id: 'clouds' as const, emoji: '☁️', label: 'Mây', labelEn: 'Clouds', color: 'from-gray-400 to-slate-500' },
  { id: 'precipitation' as const, emoji: '🌧️', label: 'Mưa', labelEn: 'Rain', color: 'from-blue-400 to-cyan-500' },
  { id: 'temp' as const, emoji: '🌡️', label: 'Nhiệt độ', labelEn: 'Temp', color: 'from-orange-400 to-red-500' },
  { id: 'wind' as const, emoji: '💨', label: 'Gió', labelEn: 'Wind', color: 'from-teal-400 to-emerald-500' },
];

export function WeatherLayerControl({
  isOpen,
  onClose,
  activeLayer,
  onLayerChange,
  lastUpdated,
  isLoading = false,
  onRefresh
}: WeatherLayerControlProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return isVi ? 'Vừa xong' : 'Just now';
    if (diffMins < 60) return isVi ? `${diffMins} phút trước` : `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return isVi ? `${diffHours} giờ trước` : `${diffHours}h ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'absolute left-3 bottom-24 z-20',
            'w-56 p-3 rounded-2xl',
            'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl',
            'border-2 border-sky-200/50 dark:border-sky-800/50',
            'shadow-xl shadow-sky-500/10'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-xl"
              >
                ⛅
              </motion.span>
              <span className="font-semibold text-sm">
                {isVi ? 'Thời tiết' : 'Weather'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Layer Options */}
          <div className="space-y-1.5">
            {WEATHER_LAYERS.map((layer) => (
              <motion.button
                key={layer.id}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onLayerChange(activeLayer === layer.id ? null : layer.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                  activeLayer === layer.id
                    ? `bg-gradient-to-r ${layer.color} text-white shadow-md`
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="text-lg">{layer.emoji}</span>
                <span>{isVi ? layer.label : layer.labelEn}</span>
                {activeLayer === layer.id && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto text-xs bg-white/20 px-1.5 py-0.5 rounded-full"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>🔄</span>
              <span>
                {lastUpdated 
                  ? formatTimeAgo(lastUpdated)
                  : (isVi ? 'Chưa cập nhật' : 'Not updated')
                }
              </span>
            </div>
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
              </Button>
            )}
          </div>

          {/* No API Key Warning */}
          {!import.meta.env.VITE_OPENWEATHERMAP_API_KEY && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200/50 text-xs text-amber-700 dark:text-amber-400"
            >
              <span className="mr-1">⚠️</span>
              {isVi ? 'Cần API key để xem dữ liệu' : 'API key required'}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
