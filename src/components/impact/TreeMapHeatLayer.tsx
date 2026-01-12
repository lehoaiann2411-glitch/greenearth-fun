import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { TreeLocation } from '@/hooks/useTreeMapData';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Flame } from 'lucide-react';

// Extend Leaflet types for heat plugin
declare module 'leaflet' {
  function heatLayer(
    latlngs: Array<[number, number, number]>,
    options?: {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      max?: number;
      gradient?: Record<number, string>;
    }
  ): L.Layer;
}

interface HeatLayerProps {
  locations: TreeLocation[];
  mode: 'trees' | 'carbon';
}

function HeatLayer({ locations, mode }: HeatLayerProps) {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!map || locations.length === 0) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Prepare heat data
    const maxValue = Math.max(
      ...locations.map((loc) => (mode === 'trees' ? loc.treesPlanted : loc.co2Absorbed))
    );

    const heatData: [number, number, number][] = locations.map((loc) => {
      const value = mode === 'trees' ? loc.treesPlanted : loc.co2Absorbed;
      const intensity = value / maxValue;
      return [loc.latitude, loc.longitude, intensity];
    });

    // Create gradient based on mode
    const gradient =
      mode === 'trees'
        ? {
            0.2: '#86efac',
            0.4: '#22c55e',
            0.6: '#16a34a',
            0.8: '#15803d',
            1.0: '#166534',
          }
        : {
            0.2: '#bef264',
            0.4: '#a3e635',
            0.6: '#84cc16',
            0.8: '#65a30d',
            1.0: '#4d7c0f',
          };

    // Create heat layer
    const heat = L.heatLayer(heatData, {
      radius: 35,
      blur: 25,
      maxZoom: 10,
      max: 1,
      gradient,
    });

    heat.addTo(map);
    heatLayerRef.current = heat;

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, locations, mode]);

  return null;
}

interface TreeMapHeatLayerProps {
  locations: TreeLocation[];
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  mode: 'trees' | 'carbon';
  onModeChange: (mode: 'trees' | 'carbon') => void;
}

export function TreeMapHeatLayerControl({
  enabled,
  onEnabledChange,
  mode,
  onModeChange,
}: Omit<TreeMapHeatLayerProps, 'locations'>) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Switch id="heatmap-toggle" checked={enabled} onCheckedChange={onEnabledChange} />
        <Label htmlFor="heatmap-toggle" className="text-sm flex items-center gap-1.5 cursor-pointer">
          <Flame className="h-4 w-4 text-orange-500" />
          {t('impact.map.heatmap')}
        </Label>
      </div>

      {enabled && (
        <div className="flex items-center gap-2 text-xs">
          <button
            className={`px-2 py-1 rounded transition-colors ${
              mode === 'trees'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => onModeChange('trees')}
          >
            {t('impact.map.trees')}
          </button>
          <button
            className={`px-2 py-1 rounded transition-colors ${
              mode === 'carbon'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => onModeChange('carbon')}
          >
            CO₂
          </button>
        </div>
      )}
    </div>
  );
}

export function TreeMapHeatLayerLegend({ mode }: { mode: 'trees' | 'carbon' }) {
  const { t } = useTranslation();

  return (
    <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg z-[1000]">
      <p className="text-xs font-medium mb-2">
        {mode === 'trees' ? t('impact.map.treeDensity') : t('impact.map.carbonOffset')}
      </p>
      <div className="flex items-center gap-1">
        <div
          className="h-3 w-20 rounded"
          style={{
            background:
              mode === 'trees'
                ? 'linear-gradient(to right, #86efac, #22c55e, #16a34a, #15803d, #166534)'
                : 'linear-gradient(to right, #bef264, #a3e635, #84cc16, #65a30d, #4d7c0f)',
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>{t('impact.map.low')}</span>
        <span>{t('impact.map.high')}</span>
      </div>
    </div>
  );
}

export { HeatLayer };
