import React, { useRef, useCallback, useState, useEffect } from 'react';
import Map, { 
  NavigationControl, 
  GeolocateControl,
  Marker,
  Popup,
  Source,
  Layer
} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslation } from 'react-i18next';
import { TreeLocation } from '@/hooks/useTreeMapData';
import { useForestAreas } from '@/hooks/useForestAreas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trees, 
  MapPin, 
  Navigation, 
  Eye
} from 'lucide-react';
import { ForestPolygonDrawer } from './ForestPolygonDrawer';
import { StreetViewModal } from './StreetViewModal';
import { MapToolbar } from './MapToolbar';
import { MapQuickActions } from './MapQuickActions';
import { MapTour } from './MapTour';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Map styles
const MAP_STYLES = {
  satellite: {
    version: 8 as const,
    sources: {
      'esri-satellite': {
        type: 'raster' as const,
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: 'Esri, Maxar, Earthstar Geographics'
      }
    },
    layers: [
      {
        id: 'satellite-layer',
        type: 'raster' as const,
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  },
  streets: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  hybrid: {
    version: 8 as const,
    sources: {
      'esri-satellite': {
        type: 'raster' as const,
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        maxzoom: 19
      },
      'carto-labels': {
        type: 'raster' as const,
        tiles: [
          'https://basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        maxzoom: 19
      }
    },
    layers: [
      {
        id: 'satellite-layer',
        type: 'raster' as const,
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 22
      },
      {
        id: 'labels-layer',
        type: 'raster' as const,
        source: 'carto-labels',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  }
};

type MapStyle = 'satellite' | 'streets' | 'hybrid';

interface MapLibreMapProps {
  locations: TreeLocation[];
  onLocationClick?: (location: TreeLocation) => void;
  showDrawTools?: boolean;
  totalTrees?: number;
  totalCO2?: number;
  className?: string;
}

export function MapLibreMap({ 
  locations, 
  onLocationClick,
  showDrawTools = true,
  totalTrees = 0,
  totalCO2 = 0,
  className = ''
}: MapLibreMapProps) {
  const { t } = useTranslation();
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const [viewState, setViewState] = useState({
    longitude: 106.6297,
    latitude: 16.4637,
    zoom: 5.5,
    pitch: 0,
    bearing: 0
  });
  
  const [mapStyle, setMapStyle] = useState<MapStyle>('satellite');
  const [show3D, setShow3D] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<TreeLocation | null>(null);
  const [streetViewLocation, setStreetViewLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showTour, setShowTour] = useState(true);

  const { data: forestAreas = [] } = useForestAreas();

  // Fit bounds to locations
  useEffect(() => {
    if (locations.length > 0 && mapRef.current) {
      const bounds = new maplibregl.LngLatBounds();
      locations.forEach(loc => {
        bounds.extend([loc.longitude, loc.latitude]);
      });
      
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 10
      });
    }
  }, [locations]);

  // Get current style
  const getCurrentStyle = () => {
    return MAP_STYLES[mapStyle];
  };

  // Handle 3D toggle
  const toggle3D = useCallback(() => {
    setShow3D(!show3D);
    if (!show3D) {
      setViewState(prev => ({ ...prev, pitch: 60 }));
    } else {
      setViewState(prev => ({ ...prev, pitch: 0 }));
    }
  }, [show3D]);

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Fly to location (search)
  const flyToLocation = useCallback((lat: number, lon: number, name: string) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lon, lat],
        zoom: 15,
        duration: 2000
      });
      toast.success(t('impact.map.flyingTo', 'Đang bay đến {{name}}', { name: name.split(',')[0] }));
    }
  }, [t]);

  // Get user location
  const handleMyLocation = useCallback(() => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [position.coords.longitude, position.coords.latitude],
              zoom: 14,
              duration: 1500
            });
          }
          setIsLoadingLocation(false);
        },
        (error) => {
          toast.error(t('impact.map.locationError', 'Không thể lấy vị trí'));
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error(t('impact.map.geolocationNotSupported', 'Trình duyệt không hỗ trợ định vị'));
      setIsLoadingLocation(false);
    }
  }, [t]);

  // Zoom home (level 14)
  const handleZoomHome = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        zoom: 17,
        duration: 1000
      });
    }
  }, []);

  // Zoom overview (level 6)
  const handleZoomOverview = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [106.6297, 16.4637],
        zoom: 5.5,
        duration: 1500
      });
    }
  }, []);

  // Start drawing
  const handleStartDrawing = useCallback(() => {
    setIsDrawing(true);
  }, []);

  // Get marker color based on trees planted
  const getMarkerColor = (treesPlanted: number) => {
    if (treesPlanted >= 10000) return '#15803d'; // green-700
    if (treesPlanted >= 5000) return '#22c55e'; // green-500
    if (treesPlanted >= 1000) return '#4ade80'; // green-400
    return '#86efac'; // green-300
  };

  // Get marker size
  const getMarkerSize = (treesPlanted: number) => {
    if (treesPlanted >= 10000) return 24;
    if (treesPlanted >= 5000) return 20;
    if (treesPlanted >= 1000) return 16;
    return 14;
  };

  // Convert forest areas to GeoJSON
  const forestAreasGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: forestAreas.map(area => ({
      type: 'Feature',
      properties: {
        id: area.id,
        name: area.name,
        forest_type: area.forest_type,
        area_hectares: area.area_hectares,
        trees_count: area.trees_count
      },
      geometry: {
        type: 'Polygon',
        coordinates: [area.coordinates.map(coord => [coord[0], coord[1]])]
      }
    }))
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full w-full'} ${className}`}>
      {/* Unified Toolbar */}
      <MapToolbar
        mapStyle={mapStyle}
        onMapStyleChange={setMapStyle}
        show3D={show3D}
        onToggle3D={toggle3D}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isDrawing={isDrawing}
        onStartDrawing={handleStartDrawing}
        onLocationSelect={flyToLocation}
        totalTrees={totalTrees}
        totalCO2={totalCO2}
        className="absolute top-3 left-3 right-3 z-10"
      />

      {/* Quick Action Buttons */}
      <MapQuickActions
        onMyLocation={handleMyLocation}
        onZoomHome={handleZoomHome}
        onZoomOverview={handleZoomOverview}
        isLoadingLocation={isLoadingLocation}
        className="absolute top-20 right-3 z-10"
      />

      {/* Draw Tools */}
      {showDrawTools && (
        <ForestPolygonDrawer
          mapRef={mapRef}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
        />
      )}

      {/* Map */}
      <Map
        ref={(ref) => {
          if (ref) {
            mapRef.current = ref.getMap();
          }
        }}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={getCurrentStyle()}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        mapLib={maplibregl}
      >
        <NavigationControl position="bottom-right" showCompass showZoom />
        <GeolocateControl position="bottom-right" />

        {/* Forest Areas Layer */}
        <Source id="forest-areas" type="geojson" data={forestAreasGeoJSON}>
          <Layer
            id="forest-areas-fill"
            type="fill"
            paint={{
              'fill-color': '#22c55e',
              'fill-opacity': 0.4
            }}
          />
          <Layer
            id="forest-areas-outline"
            type="line"
            paint={{
              'line-color': '#15803d',
              'line-width': 2
            }}
          />
        </Source>

        {/* Location Markers */}
        {locations.map((location, index) => (
          <Marker
            key={location.id}
            longitude={location.longitude}
            latitude={location.latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedLocation(location);
            }}
          >
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
              className="relative cursor-pointer transition-transform hover:scale-110"
              style={{
                width: getMarkerSize(location.treesPlanted),
                height: getMarkerSize(location.treesPlanted)
              }}
            >
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: getMarkerColor(location.treesPlanted) }}
              />
              <div 
                className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{ backgroundColor: getMarkerColor(location.treesPlanted) }}
              >
                <Trees className="h-3 w-3 text-white" />
              </div>
            </motion.div>
          </Marker>
        ))}

        {/* Selected Location Popup */}
        {selectedLocation && (
          <Popup
            longitude={selectedLocation.longitude}
            latitude={selectedLocation.latitude}
            anchor="bottom"
            onClose={() => setSelectedLocation(null)}
            closeButton={true}
            closeOnClick={false}
            className="rounded-lg"
          >
            <div className="p-3 min-w-[200px]">
              <h3 className="font-semibold text-sm mb-2">{selectedLocation.name}</h3>
              
              <div className="space-y-1 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Trees className="h-3 w-3" />
                  <span>{selectedLocation.treesPlanted.toLocaleString()} {t('impact.trees', 'cây')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{selectedLocation.forestArea?.toFixed(1)} ha</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {selectedLocation.forestType}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => {
                    setStreetViewLocation({
                      lat: selectedLocation.latitude,
                      lng: selectedLocation.longitude
                    });
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Street View
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1 text-xs"
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`,
                      '_blank'
                    );
                  }}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  {t('impact.directions', 'Chỉ đường')}
                </Button>
              </div>

              {onLocationClick && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2 text-xs"
                  onClick={() => onLocationClick(selectedLocation)}
                >
                  {t('impact.viewCampaign', 'Xem chiến dịch')}
                </Button>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* Onboarding Tour */}
      {showTour && (
        <MapTour onComplete={() => setShowTour(false)} />
      )}

      {/* Street View Modal */}
      <StreetViewModal
        isOpen={!!streetViewLocation}
        onClose={() => setStreetViewLocation(null)}
        latitude={streetViewLocation?.lat || 0}
        longitude={streetViewLocation?.lng || 0}
      />
    </div>
  );
}
