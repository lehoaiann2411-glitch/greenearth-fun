import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TreePine, MapPin, Loader2, Leaf, Plus, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

import { useTreeMapData, useTreeMapStats, TreeMapFilters as FiltersType, TreeLocation } from '@/hooks/useTreeMapData';
import { TreeMapFilters } from './TreeMapFilters';
import { TreeMapTimeline } from './TreeMapTimeline';
import { NearestLocationFinder } from './NearestLocationFinder';
import { MapLibreMap } from './MapLibreMap';
import { formatCO2 } from '@/lib/carbonCalculations';

export function TreeMap() {
  const { t } = useTranslation();
  const [mapReady, setMapReady] = useState(false);
  const [filters, setFilters] = useState<FiltersType>({ region: null, forestType: null });
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [timelineLocations, setTimelineLocations] = useState<TreeLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<TreeLocation | null>(null);

  // Fetch data with filters
  const { data: locations = [], isLoading, error } = useTreeMapData(filters);
  
  // Calculate stats
  const displayLocations = timelineLocations.length > 0 ? timelineLocations : locations;
  const stats = useTreeMapStats(displayLocations);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const handleTimelineChange = useCallback((filtered: TreeLocation[]) => {
    setTimelineLocations(filtered);
  }, []);

  const handleLocationSelect = useCallback((location: TreeLocation) => {
    setSelectedLocation(location);
  }, []);

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
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                {t('impact.map.title')}
              </CardTitle>
              <CardDescription className="mt-1">
                {t('impact.map.description')}
              </CardDescription>
            </div>
            
            {/* Stats badges */}
            <div className="flex flex-wrap gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge variant="default" className="gap-1 py-1.5 px-3">
                  <TreePine className="h-3.5 w-3.5" />
                  {stats.totalTrees.toLocaleString()} {t('impact.map.trees')}
                </Badge>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge variant="secondary" className="gap-1 py-1.5 px-3">
                  <Leaf className="h-3.5 w-3.5" />
                  {formatCO2(stats.totalCO2)}/{t('common.year', 'năm')}
                </Badge>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge variant="outline" className="gap-1 py-1.5 px-3">
                  <Compass className="h-3.5 w-3.5" />
                  {stats.campaignsCount} {t('impact.map.campaigns')}
                </Badge>
              </motion.div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 p-4">
          {/* Filters */}
          <TreeMapFilters filters={filters} onFiltersChange={setFilters} />

          {/* Map Container */}
          {isLoading ? (
            <Skeleton className="w-full h-[550px] rounded-xl" />
          ) : mapReady ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-xl overflow-hidden border shadow-lg h-[550px]"
            >
              <MapLibreMap
                locations={displayLocations}
                onLocationClick={handleLocationSelect}
                showDrawTools={true}
                totalTrees={stats.totalTrees}
                totalCO2={stats.totalCO2}
              />
            </motion.div>
          ) : (
            <div className="flex items-center justify-center bg-muted rounded-xl h-[550px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Enhanced Empty State */}
          {!isLoading && locations.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center bg-gradient-to-b from-primary/5 to-transparent rounded-xl"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <TreePine className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t('impact.map.emptyTitle', 'Chưa có chiến dịch nào')}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {t('impact.map.emptyMessage')}
              </p>
              <div className="flex gap-3">
                <Button variant="default" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('impact.map.createCampaign', 'Tạo chiến dịch')}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Compass className="h-4 w-4" />
                  {t('impact.map.explore', 'Khám phá')}
                </Button>
              </div>
            </motion.div>
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
