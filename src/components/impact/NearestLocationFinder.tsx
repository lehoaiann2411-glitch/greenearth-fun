import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreeLocation, findNearestLocations } from '@/hooks/useTreeMapData';
import { MapPin, Navigation, Loader2, TreePine, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NearestLocationFinderProps {
  locations: TreeLocation[];
  onLocationSelect?: (location: TreeLocation) => void;
}

interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

export function NearestLocationFinder({ locations, onLocationSelect }: NearestLocationFinderProps) {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearestLocations, setNearestLocations] = useState<
    (TreeLocation & { distance: number })[]
  >([]);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t('impact.map.geolocationNotSupported'));
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Find nearest locations
        const nearest = findNearestLocations(latitude, longitude, locations, 3);
        setNearestLocations(nearest);
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(t('impact.map.locationPermissionDenied'));
            break;
          case err.POSITION_UNAVAILABLE:
            setError(t('impact.map.locationUnavailable'));
            break;
          case err.TIMEOUT:
            setError(t('impact.map.locationTimeout'));
            break;
          default:
            setError(t('impact.map.locationError'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [locations, t]);

  const handleGetDirections = (location: TreeLocation) => {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    const destination = `${location.latitude},${location.longitude}`;
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  const getForestTypeEmoji = (type: string): string => {
    switch (type) {
      case 'mangrove':
        return '🌊';
      case 'pine':
        return '🌲';
      case 'tropical':
        return '🌴';
      default:
        return '🌳';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {t('impact.map.nearestLocations')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!userLocation && !isLoading && (
          <Button
            onClick={handleGetLocation}
            className="w-full"
            variant="outline"
            disabled={locations.length === 0}
          >
            <Navigation className="h-4 w-4 mr-2" />
            {t('impact.map.allowLocation')}
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            {t('impact.map.findingLocation')}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm py-4">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {nearestLocations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {nearestLocations.map((location, index) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="text-2xl">{getForestTypeEmoji(location.forestType)}</div>

                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onLocationSelect?.(location)}
                      className="font-medium text-sm hover:text-primary transition-colors text-left truncate block w-full"
                    >
                      {location.name}
                    </button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <TreePine className="h-3 w-3" />
                        {location.treesPlanted.toLocaleString()}
                      </span>
                      <span>•</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {formatDistance(location.distance)}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() => handleGetDirections(location)}
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={handleGetLocation}
              >
                <Navigation className="h-3.5 w-3.5 mr-1" />
                {t('impact.map.refreshLocation')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
