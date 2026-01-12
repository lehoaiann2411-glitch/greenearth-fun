import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Navigation, Eye, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TreeLocation } from '@/hooks/useTreeMapData';

const FOREST_EMOJIS: Record<string, string> = {
  'mangrove': '🌊',
  'rainforest': '🌴',
  'pine': '🌲',
  'bamboo': '🎋',
  'mixed': '🌳',
  'planted': '🌱',
  'default': '🌳'
};

interface CuteMarkerPopupProps {
  location: TreeLocation;
  onStreetView: () => void;
  onDirections: () => void;
  onViewCampaign?: () => void;
}

export function CuteMarkerPopup({
  location,
  onStreetView,
  onDirections,
  onViewCampaign
}: CuteMarkerPopupProps) {
  const { t } = useTranslation();
  
  const forestEmoji = FOREST_EMOJIS[location.forestType?.toLowerCase() || 'default'] || '🌳';
  const targetTrees = Math.max(location.treesPlanted * 2, 5000);
  const progress = Math.min((location.treesPlanted / targetTrees) * 100, 100);
  const co2Absorbed = (location.treesPlanted * 22) / 1000; // ~22kg CO2 per tree per year

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="p-4 min-w-[260px] max-w-[300px]"
    >
      {/* Header with emoji and title */}
      <div className="flex items-start gap-3 mb-4">
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, -5, 5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl"
        >
          {forestEmoji}
        </motion.div>
        <div className="flex-1">
          <h3 className="font-bold text-base leading-tight mb-1">{location.name}</h3>
          <Badge 
            variant="secondary" 
            className="text-xs bg-gradient-to-r from-primary/20 to-accent/20 border-0"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {location.forestType}
          </Badge>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl p-3 mb-4 border border-primary/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌲</span>
            <span className="font-bold text-primary">{location.treesPlanted.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">{t('impact.trees', 'cây')}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>🎯</span>
            <span>{targetTrees.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="relative">
          <Progress value={progress} className="h-3 bg-muted/50" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary-foreground"
            style={{ mixBlendMode: progress > 50 ? 'normal' : 'difference' }}
          >
            {progress.toFixed(0)}%
          </motion.div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-xl">
          <span className="text-lg">🌿</span>
          <div>
            <div className="font-semibold text-sm text-primary">{co2Absorbed.toFixed(1)} {t('common.ton', 'tấn')}</div>
            <div className="text-[10px] text-muted-foreground">CO₂/{t('common.year', 'năm')}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
          <span className="text-lg">📐</span>
          <div>
            <div className="font-semibold text-sm text-blue-600">{location.forestArea?.toFixed(1)} ha</div>
            <div className="text-[10px] text-muted-foreground">{t('impact.map.area', 'Diện tích')}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onStreetView}
          className="gap-1.5 rounded-xl h-9 text-xs hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all"
        >
          <Eye className="h-3.5 w-3.5" />
          Street View
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={onDirections}
          className="gap-1.5 rounded-xl h-9 text-xs bg-gradient-to-r from-primary to-green-600 hover:opacity-90 transition-all"
        >
          <Navigation className="h-3.5 w-3.5" />
          {t('impact.directions', 'Chỉ đường')}
        </Button>
      </div>

      {onViewCampaign && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onViewCampaign}
          className="w-full gap-1.5 rounded-xl h-8 text-xs hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 group"
        >
          <span>👀</span>
          <span>{t('impact.viewCampaign', 'Xem chiến dịch')}</span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            →
          </motion.span>
        </Button>
      )}
    </motion.div>
  );
}
