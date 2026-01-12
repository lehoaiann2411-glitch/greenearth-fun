import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Flag, History, Waves, Info } from 'lucide-react';
import { VIETNAM_ISLANDS } from './VietnamIslandsLayer';

interface IslandPopupProps {
  archipelago: 'hoangSa' | 'truongSa';
  islandKey?: string;
  onClose?: () => void;
}

const ARCHIPELAGO_INFO = {
  hoangSa: {
    coords: '16°30\'N - 112°00\'E',
    seaArea: '~15,000',
    islandCount: '130+'
  },
  truongSa: {
    coords: '8°38\'N - 111°55\'E',
    seaArea: '~160,000',
    islandCount: '100+'
  }
};

export function IslandPopup({ archipelago, islandKey, onClose }: IslandPopupProps) {
  const { t } = useTranslation();
  const info = ARCHIPELAGO_INFO[archipelago];
  const archipelagoData = VIETNAM_ISLANDS[archipelago];
  
  // Get specific island name if provided
  const islandName = islandKey ? t(islandKey) : null;
  const archipelagoName = t(archipelagoData.nameKey);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="min-w-[280px] max-w-[320px] p-0 overflow-hidden"
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-4 text-white">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 border-2 border-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">
              {islandName || archipelagoName}
            </h3>
            {islandName && (
              <p className="text-xs text-red-100 opacity-90">{archipelagoName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <Flag className="h-4 w-4" />
          <span className="font-semibold text-sm">{t('islands.sovereignty')}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-white dark:bg-gray-900 space-y-3">
        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">{t('islands.coordinates')}</p>
            <p className="text-sm font-medium">{info.coords}</p>
          </div>
        </div>

        {/* Sea Area */}
        <div className="flex items-start gap-2">
          <Waves className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">{t('islands.seaArea')}</p>
            <p className="text-sm font-medium">{info.seaArea} km²</p>
          </div>
        </div>

        {/* Island Count */}
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">{t('islands.islandCount')}</p>
            <p className="text-sm font-medium">{info.islandCount} {t('islands.features')}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-2" />

        {/* History */}
        <div className="flex items-start gap-2">
          <History className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('islands.historyTitle')}</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {t('islands.history')}
            </p>
          </div>
        </div>

        {/* Vietnam badge */}
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
      </div>
    </motion.div>
  );
}
