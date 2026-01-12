import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AQILayerControlProps {
  isOpen: boolean;
  onClose: () => void;
  isEnabled: boolean;
  onToggle: () => void;
  showStations?: boolean;
  onToggleStations?: () => void;
  lastUpdated?: Date;
  isLoading?: boolean;
  onRefresh?: () => void;
}

// AQI levels based on US EPA standard
const AQI_LEVELS = [
  { min: 0, max: 50, color: '#00e400', bgColor: 'bg-green-500', emoji: '😊', label: 'Tốt', labelEn: 'Good' },
  { min: 51, max: 100, color: '#ffff00', bgColor: 'bg-yellow-400', emoji: '🙂', label: 'TB', labelEn: 'Moderate' },
  { min: 101, max: 150, color: '#ff7e00', bgColor: 'bg-orange-500', emoji: '😐', label: 'Kém', labelEn: 'Unhealthy for Sensitive' },
  { min: 151, max: 200, color: '#ff0000', bgColor: 'bg-red-500', emoji: '😷', label: 'Xấu', labelEn: 'Unhealthy' },
  { min: 201, max: 300, color: '#8f3f97', bgColor: 'bg-purple-600', emoji: '🤢', label: 'Rất xấu', labelEn: 'Very Unhealthy' },
  { min: 301, max: 500, color: '#7e0023', bgColor: 'bg-rose-900', emoji: '☠️', label: 'Nguy hại', labelEn: 'Hazardous' },
];

export function AQILayerControl({
  isOpen,
  onClose,
  isEnabled,
  onToggle,
  showStations = true,
  onToggleStations,
  lastUpdated,
  isLoading = false,
  onRefresh
}: AQILayerControlProps) {
  const { i18n } = useTranslation();
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
            'w-64 p-3 rounded-2xl',
            'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl',
            'border-2 border-purple-200/50 dark:border-purple-800/50',
            'shadow-xl shadow-purple-500/10'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-xl"
              >
                💨
              </motion.span>
              <span className="font-semibold text-sm">
                {isVi ? 'Chất lượng Không khí' : 'Air Quality'}
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

          {/* Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggle}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-3',
              isEnabled
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <span>🗺️</span>
              <span>{isVi ? 'Hiển thị AQI' : 'Show AQI'}</span>
            </div>
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
              {isEnabled ? 'ON' : 'OFF'}
            </span>
          </motion.button>

          {/* Stations Toggle */}
          {onToggleStations && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggleStations}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all mb-3',
                showStations
                  ? 'bg-gradient-to-r from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 text-cyan-700 dark:text-cyan-400'
                  : 'bg-muted/30 text-muted-foreground'
              )}
            >
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{isVi ? 'Trạm đo' : 'Stations'}</span>
              </div>
              <span className="text-xs">{showStations ? '✓' : '○'}</span>
            </motion.button>
          )}

          {/* AQI Legend */}
          <div className="space-y-1 mb-3">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">
              {isVi ? 'Chú thích AQI' : 'AQI Legend'}
            </div>
            {AQI_LEVELS.map((level) => (
              <div 
                key={level.min}
                className="flex items-center gap-2 text-xs"
              >
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                  style={{ backgroundColor: level.color }}
                >
                  {level.emoji}
                </div>
                <span className="text-muted-foreground">
                  {level.min}-{level.max}
                </span>
                <span className="font-medium">
                  {isVi ? level.label : level.labelEn}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <span>🔄</span>
                <span>
                  {lastUpdated 
                    ? formatTimeAgo(lastUpdated)
                    : (isVi ? 'Cập nhật mỗi 10 phút' : 'Updates every 10 min')
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

            {/* Data source */}
            <a
              href="https://aqicn.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              <span>{isVi ? 'Nguồn: WAQI' : 'Source: WAQI'}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          {/* No API Key Warning */}
          {!import.meta.env.VITE_WAQI_TOKEN && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200/50 text-xs text-amber-700 dark:text-amber-400"
            >
              <span className="mr-1">⚠️</span>
              {isVi ? 'Cần WAQI token để xem dữ liệu' : 'WAQI token required'}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { AQI_LEVELS };
