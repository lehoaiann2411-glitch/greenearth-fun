import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Satellite,
  Map as MapIcon,
  Layers,
  Building2,
  Pencil,
  Maximize2,
  Minimize2,
  TreePine
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapSearchBox } from './MapSearchBox';

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
    <div className={cn(
      'flex flex-wrap items-center gap-2 p-2 bg-background/95 backdrop-blur rounded-lg shadow-lg',
      className
    )}>
      {/* Search */}
      <MapSearchBox 
        onLocationSelect={onLocationSelect}
        className="flex-1 min-w-[200px] max-w-[300px]"
      />

      <Separator orientation="vertical" className="h-8 hidden sm:block" />

      {/* Map Style Buttons */}
      <div className="flex gap-1">
        <Button
          variant={mapStyle === 'satellite' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onMapStyleChange('satellite')}
          className="gap-1 h-9"
          title={t('impact.map.satellite', 'Vệ tinh')}
        >
          <Satellite className="h-4 w-4" />
          <span className="hidden lg:inline">{t('impact.map.satellite', 'Vệ tinh')}</span>
        </Button>
        <Button
          variant={mapStyle === 'streets' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onMapStyleChange('streets')}
          className="gap-1 h-9"
          title={t('impact.map.streets', 'Đường')}
        >
          <MapIcon className="h-4 w-4" />
          <span className="hidden lg:inline">{t('impact.map.streets', 'Đường')}</span>
        </Button>
        <Button
          variant={mapStyle === 'hybrid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onMapStyleChange('hybrid')}
          className="gap-1 h-9"
          title={t('impact.map.hybrid', 'Kết hợp')}
        >
          <Layers className="h-4 w-4" />
          <span className="hidden lg:inline">{t('impact.map.hybrid', 'Kết hợp')}</span>
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8 hidden sm:block" />

      {/* 3D Toggle */}
      <Button
        variant={show3D ? 'default' : 'ghost'}
        size="sm"
        onClick={onToggle3D}
        className="gap-1 h-9"
        title="3D View"
      >
        <Building2 className="h-4 w-4" />
        <span className="hidden md:inline">3D</span>
      </Button>

      {/* Draw Button */}
      {!isDrawing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onStartDrawing}
          className="gap-1 h-9"
          title={t('impact.map.drawPolygon', 'Vẽ khu vực')}
        >
          <Pencil className="h-4 w-4" />
          <span className="hidden md:inline">{t('impact.map.draw', 'Vẽ')}</span>
        </Button>
      )}

      {/* Fullscreen Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleFullscreen}
        className="h-9 w-9"
        title={t('impact.map.fullscreen', 'Toàn màn hình')}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>

      {/* Stats Badges - Show on larger screens */}
      <div className="hidden xl:flex items-center gap-2 ml-auto">
        <Badge variant="secondary" className="gap-1">
          <TreePine className="h-3.5 w-3.5" />
          {totalTrees.toLocaleString()} {t('impact.map.trees', 'cây')}
        </Badge>
        <Badge variant="outline" className="gap-1">
          🌿 {(totalCO2 / 1000).toFixed(1)} {t('common.ton', 'tấn')}/{t('common.year', 'năm')}
        </Badge>
      </div>
    </div>
  );
}
