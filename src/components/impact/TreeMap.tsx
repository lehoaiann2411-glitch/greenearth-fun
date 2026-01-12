import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TreePine, MapPin, Loader2, Map as MapIcon, Globe } from 'lucide-react';

import { useTreeMapData, useTreeMapStats, TreeMapFilters as FiltersType, TreeLocation } from '@/hooks/useTreeMapData';
import { TreeMapFilters } from './TreeMapFilters';
import { TreeMapTimeline } from './TreeMapTimeline';
import { NearestLocationFinder } from './NearestLocationFinder';
import { MapLibreMap } from './MapLibreMap';
import { formatCO2 } from '@/lib/carbonCalculations';

// Legacy Leaflet imports for fallback
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { GlowingTreeMarker } from './GlowingTreeMarker';
import { TreeMapHeatLayerControl, TreeMapHeatLayerLegend, HeatLayer } from './TreeMapHeatLayer';
import { MapStyleSwitcher, MapStyle, mapStyles } from './MapStyleSwitcher';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Component to fly to location (Leaflet)
function FlyToLocation({ location }: { location: TreeLocation | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.flyTo([location.latitude, location.longitude], 15, {
        duration: 1.5,
      });
    }
  }, [location, map]);
  
  return null;
}

type MapEngine = 'maplibre' | 'leaflet';

export function TreeMap() {
  const { t } = useTranslation();
  const [mapReady, setMapReady] = useState(false);
  const [filters, setFilters] = useState<FiltersType>({ region: null, forestType: null });
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [timelineLocations, setTimelineLocations] = useState<TreeLocation[]>([]);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState<'trees' | 'carbon'>('trees');
  const [selectedLocation, setSelectedLocation] = useState<TreeLocation | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>(() => {
    const saved = localStorage.getItem('treeMapStyle');
    return (saved as MapStyle) || 'satellite';
  });
  const [mapEngine, setMapEngine] = useState<MapEngine>(() => {
    const saved = localStorage.getItem('treeMapEngine');
    return (saved as MapEngine) || 'maplibre';
  });

  // Fetch data with filters
  const { data: locations = [], isLoading, error } = useTreeMapData(filters);
  
  // Calculate stats
  const displayLocations = timelineLocations.length > 0 ? timelineLocations : locations;
  const stats = useTreeMapStats(displayLocations);

  // Default center: Vietnam
  const defaultCenter: [number, number] = [16.0, 108.0];
  const defaultZoom = 6;

  useEffect(() => {
    setMapReady(true);
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('treeMapStyle', mapStyle);
  }, [mapStyle]);

  useEffect(() => {
    localStorage.setItem('treeMapEngine', mapEngine);
  }, [mapEngine]);

  const handleTimelineChange = useCallback((filtered: TreeLocation[]) => {
    setTimelineLocations(filtered);
  }, []);

  const handleLocationSelect = useCallback((location: TreeLocation) => {
    setSelectedLocation(location);
  }, []);

  const currentStyle = mapStyles[mapStyle];

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            {t('common.error')}: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t('impact.map.title')}
              </CardTitle>
              <CardDescription className="mt-1">
                {t('impact.map.description')}
              </CardDescription>
            </div>
            
            {/* Stats badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <TreePine className="h-3.5 w-3.5" />
                {stats.totalTrees.toLocaleString()} {t('impact.map.trees')}
              </Badge>
              <Badge variant="outline" className="gap-1">
                {formatCO2(stats.totalCO2)}/năm
              </Badge>
              <Badge variant="outline">
                {stats.campaignsCount} {t('impact.map.campaigns')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Map Engine Tabs */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Tabs value={mapEngine} onValueChange={(v) => setMapEngine(v as MapEngine)}>
                <TabsList className="grid w-full max-w-[300px] grid-cols-2">
                  <TabsTrigger value="maplibre" className="gap-2">
                    <Globe className="h-4 w-4" />
                    MapLibre 3D
                  </TabsTrigger>
                  <TabsTrigger value="leaflet" className="gap-2">
                    <MapIcon className="h-4 w-4" />
                    Leaflet
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Heatmap controls (only for Leaflet) */}
              {mapEngine === 'leaflet' && (
                <TreeMapHeatLayerControl
                  enabled={heatmapEnabled}
                  onEnabledChange={setHeatmapEnabled}
                  mode={heatmapMode}
                  onModeChange={setHeatmapMode}
                />
              )}
            </div>

            {/* Map Style Switcher (only for Leaflet) */}
            {mapEngine === 'leaflet' && (
              <MapStyleSwitcher value={mapStyle} onChange={setMapStyle} />
            )}

            <TreeMapFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Map Container */}
          {isLoading ? (
            <Skeleton className="w-full h-[500px] rounded-lg" />
          ) : mapReady ? (
            <div className="relative rounded-lg overflow-hidden border shadow-lg h-[500px]">
              {mapEngine === 'maplibre' ? (
                <MapLibreMap
                  locations={displayLocations}
                  onLocationClick={handleLocationSelect}
                  showDrawTools={true}
                />
              ) : (
                <>
                  <MapContainer
                    center={defaultCenter}
                    zoom={defaultZoom}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    className="z-0"
                    maxZoom={currentStyle.maxZoom}
                  >
                    {/* Main tile layer */}
                    <TileLayer
                      key={`main-${mapStyle}`}
                      attribution={currentStyle.attribution}
                      url={currentStyle.url}
                      maxZoom={currentStyle.maxZoom}
                    />
                    
                    {/* Labels layer for hybrid mode */}
                    {mapStyle === 'hybrid' && currentStyle.labelsUrl && (
                      <TileLayer
                        key="labels"
                        url={currentStyle.labelsUrl}
                        maxZoom={currentStyle.maxZoom}
                        opacity={0.9}
                      />
                    )}
                    
                    {/* Heatmap Layer */}
                    {heatmapEnabled && (
                      <HeatLayer locations={displayLocations} mode={heatmapMode} />
                    )}

                    {/* Glowing Tree Markers */}
                    {!heatmapEnabled && displayLocations.map((location) => (
                      <GlowingTreeMarker key={location.id} location={location} />
                    ))}

                    {/* Fly to selected location */}
                    <FlyToLocation location={selectedLocation} />
                  </MapContainer>

                  {/* Heatmap Legend */}
                  {heatmapEnabled && <TreeMapHeatLayerLegend mode={heatmapMode} />}
                  
                  {/* Map style indicator */}
                  <div className="absolute bottom-3 left-3 z-[1000]">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm shadow-md text-xs">
                      {mapStyle === 'satellite' && '🛰️ HD Satellite'}
                      {mapStyle === 'streets' && '🗺️ Streets'}
                      {mapStyle === 'hybrid' && '🌍 Hybrid'}
                      {mapStyle === 'terrain' && '⛰️ Terrain'}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center bg-muted rounded-lg h-[500px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && locations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <TreePine className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t('impact.map.emptyMessage')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('impact.map.emptySubMessage')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Animation */}
      {locations.length > 0 && (
        <TreeMapTimeline
          locations={locations}
          onTimeChange={handleTimelineChange}
          isPlaying={isTimelinePlaying}
          onPlayingChange={setIsTimelinePlaying}
        />
      )}

      {/* Nearest Location Finder */}
      <NearestLocationFinder
        locations={locations}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
}
