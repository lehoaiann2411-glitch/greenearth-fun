import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { TreeLocation } from '@/hooks/useTreeMapData';
import { formatCO2, formatArea } from '@/lib/carbonCalculations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, TreePine, Users, Leaf, ExternalLink, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GlowingTreeMarkerProps {
  location: TreeLocation;
  onGetDirections?: (lat: number, lng: number) => void;
}

function getMarkerColor(treesPlanted: number): string {
  if (treesPlanted >= 5000) return '#ef4444'; // Red - hotspot
  if (treesPlanted >= 3000) return '#f59e0b'; // Orange
  if (treesPlanted >= 1000) return '#22c55e'; // Green
  return '#86efac'; // Light green
}

function getMarkerSize(treesPlanted: number): number {
  if (treesPlanted >= 5000) return 40;
  if (treesPlanted >= 3000) return 35;
  if (treesPlanted >= 1000) return 30;
  return 24;
}

function getForestTypeLabel(forestType: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    mangrove: t('impact.map.mangrove'),
    pine: t('impact.map.pine'),
    tropical: t('impact.map.tropical'),
  };
  return labels[forestType] || forestType;
}

function getRegionLabel(region: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    north: t('impact.map.north'),
    central: t('impact.map.central'),
    south: t('impact.map.south'),
  };
  return labels[region] || region;
}

function createGlowingIcon(color: string, size: number): L.DivIcon {
  const pulseSize = size + 20;
  
  return L.divIcon({
    className: 'custom-tree-marker',
    html: `
      <div class="relative flex items-center justify-center" style="width: ${pulseSize}px; height: ${pulseSize}px;">
        <div class="absolute inset-0 rounded-full animate-ping opacity-30" style="background-color: ${color};"></div>
        <div class="absolute rounded-full tree-marker-glow" style="width: ${size}px; height: ${size}px; background-color: ${color}; box-shadow: 0 0 ${size/2}px ${color}, 0 0 ${size}px ${color}40;"></div>
        <div class="absolute flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1" class="drop-shadow-lg" style="width: ${size * 0.6}px; height: ${size * 0.6}px;">
            <path d="M12 2L8 8h2v4H8l4 6 4-6h-2V8h2L12 2z"/>
            <path d="M12 18v4"/>
            <path d="M10 22h4"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [pulseSize, pulseSize],
    iconAnchor: [pulseSize / 2, pulseSize / 2],
    popupAnchor: [0, -pulseSize / 2],
  });
}

export function GlowingTreeMarker({ location, onGetDirections }: GlowingTreeMarkerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const icon = useMemo(() => {
    const color = getMarkerColor(location.treesPlanted);
    const size = getMarkerSize(location.treesPlanted);
    return createGlowingIcon(color, size);
  }, [location.treesPlanted]);

  const handleViewCampaign = () => {
    navigate(`/campaigns/${location.id}`);
  };

  const handleGetDirections = () => {
    if (onGetDirections) {
      onGetDirections(location.latitude, location.longitude);
    } else {
      // Open Google Maps directions
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=driving`,
        '_blank'
      );
    }
  };

  return (
    <Marker position={[location.latitude, location.longitude]} icon={icon}>
      <Popup className="tree-popup" minWidth={280} maxWidth={320}>
        <div className="p-1">
          <div className="flex items-start gap-2 mb-3">
            <TreePine className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-base leading-tight">{location.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {location.location}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge variant="secondary" className="text-xs">
              {getRegionLabel(location.region, t)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getForestTypeLabel(location.forestType, t)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-primary/10 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-primary">
                {location.treesPlanted.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">{t('impact.map.treesPlanted')}</div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCO2(location.co2Absorbed)}
              </div>
              <div className="text-xs text-muted-foreground">CO₂/{t('common.year')}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {location.participants} {t('impact.map.participants')}
            </span>
            <span className="flex items-center gap-1">
              <Leaf className="h-4 w-4" />
              {formatArea(location.forestArea)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="default" className="flex-1" onClick={handleViewCampaign}>
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              {t('impact.map.viewCampaign')}
            </Button>
            <Button size="sm" variant="outline" onClick={handleGetDirections}>
              <Navigation className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
