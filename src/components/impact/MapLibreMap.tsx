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
import { useForestAreas, ForestArea } from '@/hooks/useForestAreas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trees, 
  MapPin, 
  Navigation, 
  Eye,
  Building2,
  Satellite,
  Map as MapIcon,
  Layers,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ForestPolygonDrawer } from './ForestPolygonDrawer';
import { StreetViewModal } from './StreetViewModal';

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
  className?: string;
}

export function MapLibreMap({ 
  locations, 
  onLocationClick,
  showDrawTools = true,
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

  // Get forest type color
  const getForestTypeColor = (forestType?: string) => {
    switch (forestType) {
      case 'mangrove': return 'rgba(6, 78, 59, 0.5)';
      case 'rainforest': return 'rgba(22, 101, 52, 0.5)';
      case 'pine': return 'rgba(34, 139, 34, 0.5)';
      case 'bamboo': return 'rgba(74, 222, 128, 0.5)';
      default: return 'rgba(34, 197, 94, 0.5)';
    }
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full w-full'} ${className}`}>
      {/* Style Switcher */}
      <div className="absolute top-3 left-3 z-10 flex gap-1 bg-background/90 backdrop-blur rounded-lg p-1 shadow-lg">
        <Button
          variant={mapStyle === 'satellite' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMapStyle('satellite')}
          className="gap-1"
        >
          <Satellite className="h-4 w-4" />
          <span className="hidden sm:inline">{t('impact.map.satellite', 'Vệ tinh')}</span>
        </Button>
        <Button
          variant={mapStyle === 'streets' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMapStyle('streets')}
          className="gap-1"
        >
          <MapIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{t('impact.map.streets', 'Đường')}</span>
        </Button>
        <Button
          variant={mapStyle === 'hybrid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMapStyle('hybrid')}
          className="gap-1"
        >
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">{t('impact.map.hybrid', 'Kết hợp')}</span>
        </Button>
      </div>

      {/* 3D & Fullscreen Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <Button
          variant={show3D ? 'default' : 'outline'}
          size="sm"
          onClick={toggle3D}
          className="gap-1 bg-background/90 backdrop-blur"
        >
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">3D</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-background/90 backdrop-blur"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

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
              'fill-color': ['get', 'forest_type'],
              'fill-opacity': 0.5
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
        {locations.map(location => (
          <Marker
            key={location.id}
            longitude={location.longitude}
            latitude={location.latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedLocation(location);
            }}
          >
            <div 
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
            </div>
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
