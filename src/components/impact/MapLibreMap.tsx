import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
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
import { WeatherLayerControl, WeatherLayerType } from './WeatherLayerControl';
import { AQILayerControl } from './AQILayerControl';
import { AQIStationMarker } from './AQIStationMarker';
import { AQIPopup } from './AQIPopup';
import { WorldArchipelagosLayer } from './WorldArchipelagosLayer';
import { ArchipelagoPopup } from './ArchipelagoPopup';
import { WORLD_ARCHIPELAGOS, Archipelago } from '@/data/worldArchipelagos';
import { useAQIStations, AQIStation } from '@/hooks/useAQIData';
import { WEATHER_TILE_LAYERS } from '@/hooks/useWeatherData';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Map styles - Enhanced with bright option
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
  bright: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', // Brighter, more colorful
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

// Forest type colors for gradient effect
const FOREST_COLORS: Record<string, { fill: string; stroke: string }> = {
  mangrove: { fill: '#06b6d4', stroke: '#0891b2' },
  rainforest: { fill: '#22c55e', stroke: '#16a34a' },
  pine: { fill: '#10b981', stroke: '#059669' },
  bamboo: { fill: '#84cc16', stroke: '#65a30d' },
  mixed: { fill: '#14b8a6', stroke: '#0d9488' },
  default: { fill: '#22c55e', stroke: '#15803d' }
};

type MapStyle = 'satellite' | 'streets' | 'hybrid' | 'bright';

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
    longitude: 110.0,
    latitude: 14.0,
    zoom: 4.5,
    pitch: 0,
    bearing: 0
  });
  
  const [mapStyle, setMapStyle] = useState<MapStyle>('bright');
  const [show3D, setShow3D] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<TreeLocation | null>(null);
  const [streetViewLocation, setStreetViewLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showTour, setShowTour] = useState(true);
  
  // Weather & AQI states
  const [showWeatherPanel, setShowWeatherPanel] = useState(false);
  const [activeWeatherLayer, setActiveWeatherLayer] = useState<WeatherLayerType>(null);
  const [showAQIPanel, setShowAQIPanel] = useState(false);
  const [showAQI, setShowAQI] = useState(false);
  const [showAQIStations, setShowAQIStations] = useState(true);
  const [selectedAQIStation, setSelectedAQIStation] = useState<AQIStation | null>(null);
  
  // World Archipelagos state
  const [selectedArchipelago, setSelectedArchipelago] = useState<{ id: string; data: Archipelago } | null>(null);

  const { data: forestAreas = [] } = useForestAreas();
  
  // Get map bounds for AQI stations
  const mapBounds = useMemo(() => {
    if (!mapRef.current) return undefined;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return undefined;
    return {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };
  }, [viewState]);
  
  const { data: aqiStations = [], refetch: refetchAQI, isLoading: isLoadingAQI } = useAQIStations(mapBounds, showAQI);

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

  // Resize map when fullscreen changes
  useEffect(() => {
    if (mapRef.current) {
      // Delay để CSS transition hoàn thành trước khi resize
      const timer = setTimeout(() => {
        mapRef.current?.resize();
      }, 100);
      return () => clearTimeout(timer);
    }
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
        center: [110.0, 14.0],
        zoom: 4.5,
        duration: 1500
      });
    }
  }, []);

  // Zoom in
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.flyTo({
        zoom: Math.min(currentZoom + 1, 20),
        duration: 300
      });
    }
  }, []);

  // Zoom out
  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.flyTo({
        zoom: Math.max(currentZoom - 1, 1),
        duration: 300
      });
    }
  }, []);

  // Fly to Hoang Sa
  const handleFlyToHoangSa = useCallback(() => {
    if (mapRef.current) {
      const hoangSa = WORLD_ARCHIPELAGOS.hoangSa;
      mapRef.current.flyTo({
        center: hoangSa.center,
        zoom: 7,
        duration: 2000
      });
      toast.success(t('islands.flyTo') + ' ' + t('islands.hoangSa'));
    }
  }, [t]);

  // Fly to Truong Sa
  const handleFlyToTruongSa = useCallback(() => {
    if (mapRef.current) {
      const truongSa = WORLD_ARCHIPELAGOS.truongSa;
      mapRef.current.flyTo({
        center: truongSa.center,
        zoom: 6,
        duration: 2000
      });
      toast.success(t('islands.flyTo') + ' ' + t('islands.truongSa'));
    }
  }, [t]);

  // Fly to all Vietnam islands (East Sea view)
  const handleFlyToAllIslands = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [113.0, 12.0],
        zoom: 5,
        duration: 2000
      });
      toast.success(t('islands.viewAll'));
    }
  }, [t]);

  // Fly to any archipelago
  const handleFlyToArchipelago = useCallback((archipelagoId: string) => {
    const archipelago = WORLD_ARCHIPELAGOS[archipelagoId];
    if (mapRef.current && archipelago) {
      mapRef.current.flyTo({
        center: archipelago.center,
        zoom: archipelago.highlighted ? 7 : 6,
        duration: 2000
      });
      toast.success(t('islands.flyTo') + ' ' + t(archipelago.nameKey));
    }
  }, [t]);

  // Handle archipelago click
  const handleArchipelagoClick = useCallback((archipelagoId: string, archipelago: Archipelago) => {
    setSelectedArchipelago({ id: archipelagoId, data: archipelago });
  }, []);

  // Start drawing
  const handleStartDrawing = useCallback(() => {
    setIsDrawing(true);
  }, []);

  // Get forest emoji based on type
  const getForestEmoji = (forestType?: string) => {
    const emojis: Record<string, string> = {
      'mangrove': '🌊',
      'rainforest': '🌴',
      'pine': '🌲',
      'bamboo': '🎋',
      'mixed': '🌳',
      'planted': '🌱'
    };
    return emojis[forestType?.toLowerCase() || ''] || '🌳';
  };

  // Get marker size based on trees
  const getMarkerSize = (treesPlanted: number) => {
    if (treesPlanted >= 10000) return 48;
    if (treesPlanted >= 5000) return 42;
    if (treesPlanted >= 1000) return 36;
    return 32;
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

      {/* Floating Exit Fullscreen Button - Chỉ hiện khi fullscreen */}
      {isFullscreen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-20 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl font-medium text-sm border-2 border-white/20 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
          <span>Thoát</span>
        </motion.button>
      )}

      {/* Weather Layer Control Panel */}
      <WeatherLayerControl
        isOpen={showWeatherPanel}
        onClose={() => setShowWeatherPanel(false)}
        activeLayer={activeWeatherLayer}
        onLayerChange={setActiveWeatherLayer}
        lastUpdated={new Date()}
      />

      {/* AQI Layer Control Panel */}
      <AQILayerControl
        isOpen={showAQIPanel}
        onClose={() => setShowAQIPanel(false)}
        isEnabled={showAQI}
        onToggle={() => setShowAQI(!showAQI)}
        showStations={showAQIStations}
        onToggleStations={() => setShowAQIStations(!showAQIStations)}
        isLoading={isLoadingAQI}
        onRefresh={() => refetchAQI()}
      />

      {/* Quick Action Buttons */}
      <MapQuickActions
        onMyLocation={handleMyLocation}
        onZoomHome={handleZoomHome}
        onZoomOverview={handleZoomOverview}
        onFlyToIslands={handleFlyToAllIslands}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isLoadingLocation={isLoadingLocation}
        currentZoom={viewState.zoom}
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

        {/* Weather Layer */}
        {activeWeatherLayer && import.meta.env.VITE_OPENWEATHERMAP_API_KEY && (
          <Source
            id="weather-layer"
            type="raster"
            tiles={[WEATHER_TILE_LAYERS[activeWeatherLayer]]}
            tileSize={256}
          >
            <Layer
              id="weather-overlay"
              type="raster"
              paint={{ 'raster-opacity': 0.6 }}
            />
          </Source>
        )}

        {/* AQI Station Markers */}
        {showAQI && showAQIStations && aqiStations.map((station) => (
          <Marker
            key={station.uid}
            longitude={station.lon}
            latitude={station.lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedAQIStation(station);
            }}
          >
            <AQIStationMarker aqi={station.aqi as number} name={station.station.name} />
          </Marker>
        ))}

        {/* AQI Station Popup */}
        {selectedAQIStation && (
          <Popup
            longitude={selectedAQIStation.lon}
            latitude={selectedAQIStation.lat}
            anchor="bottom"
            onClose={() => setSelectedAQIStation(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <AQIPopup station={selectedAQIStation as any} />
          </Popup>
        )}

        {/* World Archipelagos Layer */}
        <WorldArchipelagosLayer 
          onArchipelagoClick={handleArchipelagoClick}
          selectedArchipelago={selectedArchipelago?.id}
        />

        {/* Archipelago Popup - Dynamic anchor to avoid toolbar overlap */}
        {selectedArchipelago && (
          <Popup
            longitude={selectedArchipelago.data.center[0]}
            latitude={selectedArchipelago.data.center[1]}
            anchor={selectedArchipelago.data.center[1] > viewState.latitude ? 'top' : 'bottom'}
            offset={15}
            onClose={() => setSelectedArchipelago(null)}
            closeButton={true}
            closeOnClick={false}
            maxWidth="320px"
          >
            <ArchipelagoPopup archipelago={selectedArchipelago.data} />
          </Popup>
        )}

        {/* Cute Emoji Markers */}
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
              transition={{ delay: index * 0.03, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.2 }}
              className="relative cursor-pointer"
              style={{
                width: getMarkerSize(location.treesPlanted),
                height: getMarkerSize(location.treesPlanted)
              }}
            >
              {/* Glow effect */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-primary/30 blur-md"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, delay: index * 0.1 }}
              />
              
              {/* Main emoji */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center text-2xl drop-shadow-lg"
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
              >
                {getForestEmoji(location.forestType)}
              </motion.div>
              
              {/* Tree count badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.03, type: 'spring' }}
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center bg-white dark:bg-gray-900 rounded-full text-[10px] font-bold text-primary shadow-lg border-2 border-primary/20"
              >
                {location.treesPlanted >= 1000 
                  ? `${(location.treesPlanted / 1000).toFixed(0)}k` 
                  : location.treesPlanted}
              </motion.div>
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
