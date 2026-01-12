import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TreeLocation } from '@/hooks/useTreeMapData';
import { Play, Pause, RotateCcw, TreePine, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface TreeMapTimelineProps {
  locations: TreeLocation[];
  onTimeChange: (filteredLocations: TreeLocation[]) => void;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
}

export function TreeMapTimeline({
  locations,
  onTimeChange,
  isPlaying,
  onPlayingChange,
}: TreeMapTimelineProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'vi' ? vi : enUS;

  // Calculate date range
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (locations.length === 0) {
      return { minDate: new Date(), maxDate: new Date(), totalDays: 0 };
    }

    const dates = locations.map((loc) => loc.startDate.getTime());
    const min = new Date(Math.min(...dates));
    const max = new Date(); // Current date

    return {
      minDate: min,
      maxDate: max,
      totalDays: Math.ceil((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24)),
    };
  }, [locations]);

  const [currentDay, setCurrentDay] = useState(totalDays);

  // Calculate current date from slider position
  const currentDate = useMemo(() => {
    return new Date(minDate.getTime() + currentDay * 24 * 60 * 60 * 1000);
  }, [minDate, currentDay]);

  // Filter locations based on current date
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => loc.startDate <= currentDate);
  }, [locations, currentDate]);

  // Calculate stats at current time
  const stats = useMemo(() => {
    const totalTrees = filteredLocations.reduce((sum, loc) => {
      // Simulate growth over time
      const daysSinceStart = Math.ceil(
        (currentDate.getTime() - loc.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalDaysForCampaign = Math.ceil(
        (new Date().getTime() - loc.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const progress = Math.min(1, daysSinceStart / Math.max(totalDaysForCampaign, 1));
      return sum + Math.floor(loc.treesPlanted * progress);
    }, 0);

    return {
      totalTrees,
      campaigns: filteredLocations.length,
    };
  }, [filteredLocations, currentDate]);

  // Notify parent of filtered locations
  useEffect(() => {
    onTimeChange(filteredLocations);
  }, [filteredLocations, onTimeChange]);

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying || totalDays === 0) return;

    const interval = setInterval(() => {
      setCurrentDay((prev) => {
        if (prev >= totalDays) {
          onPlayingChange(false);
          return totalDays;
        }
        return prev + 1;
      });
    }, 100); // Speed of animation

    return () => clearInterval(interval);
  }, [isPlaying, totalDays, onPlayingChange]);

  const handleSliderChange = useCallback((value: number[]) => {
    setCurrentDay(value[0]);
    if (isPlaying) {
      onPlayingChange(false);
    }
  }, [isPlaying, onPlayingChange]);

  const handlePlayPause = useCallback(() => {
    if (currentDay >= totalDays) {
      setCurrentDay(0);
    }
    onPlayingChange(!isPlaying);
  }, [isPlaying, currentDay, totalDays, onPlayingChange]);

  const handleReset = useCallback(() => {
    setCurrentDay(0);
    onPlayingChange(false);
  }, [onPlayingChange]);

  if (totalDays === 0) return null;

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          {t('impact.map.timeline')}
        </h4>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleReset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant={isPlaying ? 'secondary' : 'default'}
            className="h-8 px-3"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 mr-1" />
                {t('impact.map.pause')}
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1" />
                {t('impact.map.play')}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <Slider
            value={[currentDay]}
            min={0}
            max={totalDays}
            step={1}
            onValueChange={handleSliderChange}
            className="flex-1"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{format(minDate, 'MMM yyyy', { locale: dateLocale })}</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentDate.toISOString()}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="font-medium text-foreground"
            >
              {format(currentDate, 'dd MMM yyyy', { locale: dateLocale })}
            </motion.span>
          </AnimatePresence>
          <span>{t('common.now')}</span>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2 border-t">
          <Badge variant="secondary" className="gap-1.5">
            <TreePine className="h-3.5 w-3.5" />
            <AnimatePresence mode="wait">
              <motion.span
                key={stats.totalTrees}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {stats.totalTrees.toLocaleString()} {t('impact.map.trees')}
              </motion.span>
            </AnimatePresence>
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {stats.campaigns} {t('impact.map.campaigns')}
          </Badge>
        </div>
      </div>
    </div>
  );
}
