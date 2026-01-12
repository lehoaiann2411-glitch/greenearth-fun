import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Flag, Waves, Info, Globe, Compass } from 'lucide-react';
import { Archipelago, REGION_COLORS } from '@/data/worldArchipelagos';

interface ArchipelagoPopupProps {
  archipelago: Archipelago;
  onClose?: () => void;
}

export function ArchipelagoPopup({ archipelago, onClose }: ArchipelagoPopupProps) {
  const { t } = useTranslation();

  const regionLabels: Record<string, string> = {
    southeast_asia: t('islands.regions.southeastAsia'),
    pacific: t('islands.regions.pacific'),
    atlantic: t('islands.regions.atlantic'),
    indian: t('islands.regions.indian'),
    europe: t('islands.regions.europe'),
    arctic: t('islands.regions.arctic'),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="min-w-[280px] max-w-[320px] p-0 overflow-hidden rounded-xl shadow-2xl"
    >
      {/* Header with gradient */}
      <div 
        className="p-4 text-white"
        style={{ 
          background: `linear-gradient(135deg, ${archipelago.color}, ${archipelago.color}dd)` 
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <div 
              className="w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: 'white' }}
            />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">
              {t(archipelago.nameKey)}
            </h3>
            {archipelago.sovereignty && (
              <p className="text-xs opacity-90">
                {archipelago.sovereignty}
              </p>
            )}
          </div>
        </div>
        
        {archipelago.highlighted && (
          <div className="flex items-center gap-1.5 mt-2">
            <Flag className="h-4 w-4" />
            <span className="font-semibold text-sm">{t('islands.sovereignty')}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 bg-white dark:bg-gray-900 space-y-3">
        {/* Region */}
        <div className="flex items-start gap-2">
          <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: archipelago.color }} />
          <div>
            <p className="text-xs text-muted-foreground">{t('islands.region')}</p>
            <p className="text-sm font-medium">{regionLabels[archipelago.region]}</p>
          </div>
        </div>

        {/* Coordinates */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: archipelago.color }} />
          <div>
            <p className="text-xs text-muted-foreground">{t('islands.coordinates')}</p>
            <p className="text-sm font-medium font-mono">
              {Math.abs(archipelago.center[1]).toFixed(1)}°{archipelago.center[1] >= 0 ? 'N' : 'S'}, {Math.abs(archipelago.center[0]).toFixed(1)}°{archipelago.center[0] >= 0 ? 'E' : 'W'}
            </p>
          </div>
        </div>

        {/* Sea Area */}
        {archipelago.seaArea && (
          <div className="flex items-start gap-2">
            <Waves className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{t('islands.seaArea')}</p>
              <p className="text-sm font-medium">{archipelago.seaArea} km²</p>
            </div>
          </div>
        )}

        {/* Island Count */}
        {archipelago.islandCount && (
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{t('islands.islandCount')}</p>
              <p className="text-sm font-medium">{archipelago.islandCount} {t('islands.features')}</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-2" />

        {/* Islands list */}
        <div className="flex items-start gap-2">
          <Compass className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: archipelago.color }} />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">{t('islands.mainIslands')}</p>
            <div className="flex flex-wrap gap-1">
              {archipelago.islands.slice(0, 5).map((island, idx) => (
                <span 
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: `${archipelago.color}20`,
                    color: archipelago.color
                  }}
                >
                  {t(island.nameKey)}
                </span>
              ))}
              {archipelago.islands.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{archipelago.islands.length - 5} {t('common.more')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Vietnam territory badge */}
        {archipelago.highlighted && (
          <div className="flex justify-center pt-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-yellow-50 dark:from-red-900/20 dark:to-yellow-900/20 rounded-full border border-red-200 dark:border-red-800"
            >
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 border border-white" />
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                {t('islands.vietnamTerritory')}
              </span>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
