import { useTranslation } from 'react-i18next';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Satellite, Map, Globe, Mountain } from 'lucide-react';

export type MapStyle = 'satellite' | 'streets' | 'hybrid' | 'terrain';

interface MapStyleSwitcherProps {
  value: MapStyle;
  onChange: (value: MapStyle) => void;
}

export const mapStyles: Record<MapStyle, { url: string; attribution: string; maxZoom: number; labelsUrl?: string }> = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
  },
  streets: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19
  },
  hybrid: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    labelsUrl: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri | Labels &copy; Esri',
    maxZoom: 19
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 17
  }
};

export function MapStyleSwitcher({ value, onChange }: MapStyleSwitcherProps) {
  const { t } = useTranslation();

  const styles: { value: MapStyle; icon: React.ReactNode; label: string }[] = [
    { value: 'satellite', icon: <Satellite className="h-4 w-4" />, label: t('impact.map.satellite', 'Vệ tinh') },
    { value: 'streets', icon: <Map className="h-4 w-4" />, label: t('impact.map.streets', 'Đường') },
    { value: 'hybrid', icon: <Globe className="h-4 w-4" />, label: t('impact.map.hybrid', 'Kết hợp') },
    { value: 'terrain', icon: <Mountain className="h-4 w-4" />, label: t('impact.map.terrain', 'Địa hình') },
  ];

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as MapStyle)}
      className="bg-muted/50 p-1 rounded-lg"
    >
      {styles.map((style) => (
        <ToggleGroupItem
          key={style.value}
          value={style.value}
          aria-label={style.label}
          className="gap-1.5 px-3 py-1.5 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {style.icon}
          <span className="hidden sm:inline">{style.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
