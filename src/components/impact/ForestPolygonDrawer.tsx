import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import maplibregl from 'maplibre-gl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Pencil, 
  Save, 
  Undo2,
  X,
  MousePointer,
  Check
} from 'lucide-react';
import { useCreateForestArea, calculatePolygonArea } from '@/hooks/useForestAreas';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ForestPolygonDrawerProps {
  mapRef: React.MutableRefObject<maplibregl.Map | null>;
  isDrawing: boolean;
  setIsDrawing: (value: boolean) => void;
}

const FOREST_TYPES = [
  { value: 'mangrove', label: 'Rừng ngập mặn', emoji: '🌊' },
  { value: 'rainforest', label: 'Rừng mưa nhiệt đới', emoji: '🌴' },
  { value: 'pine', label: 'Rừng thông', emoji: '🌲' },
  { value: 'bamboo', label: 'Rừng tre', emoji: '🎋' },
  { value: 'mixed', label: 'Rừng hỗn hợp', emoji: '🌳' },
  { value: 'planted', label: 'Rừng trồng', emoji: '🌱' }
];

const STEPS = [
  { min: 0, label: 'Chọn điểm đầu tiên' },
  { min: 1, label: 'Chọn điểm thứ 2' },
  { min: 2, label: 'Thêm điểm để tạo hình' },
  { min: 3, label: 'Có thể lưu hoặc thêm điểm' }
];

export function ForestPolygonDrawer({ 
  mapRef, 
  isDrawing, 
  setIsDrawing 
}: ForestPolygonDrawerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const createForestArea = useCreateForestArea();
  
  const [points, setPoints] = useState<[number, number][]>([]);
  const [markers, setMarkers] = useState<maplibregl.Marker[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [forestType, setForestType] = useState('');
  const [treesCount, setTreesCount] = useState(0);

  // Calculate area
  const calculatedArea = calculatePolygonArea(points);

  // Get current step
  const getCurrentStep = () => {
    if (points.length === 0) return 0;
    if (points.length === 1) return 1;
    if (points.length === 2) return 2;
    return 3;
  };

  const currentStep = getCurrentStep();
  const progress = Math.min((points.length / 3) * 100, 100);

  // Clean up markers and polygon
  const cleanup = useCallback(() => {
    markers.forEach(marker => marker.remove());
    setMarkers([]);
    setPoints([]);
    
    if (mapRef.current?.getSource('draw-polygon')) {
      mapRef.current.removeLayer('draw-polygon-fill');
      mapRef.current.removeLayer('draw-polygon-line');
      mapRef.current.removeSource('draw-polygon');
    }
  }, [markers, mapRef]);

  // Start drawing mode
  const startDrawing = useCallback(() => {
    if (!user) {
      toast.error(t('common.loginRequired', 'Cần đăng nhập'));
      return;
    }
    setIsDrawing(true);
    cleanup();
  }, [user, cleanup, setIsDrawing, t]);

  // Stop drawing mode
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    cleanup();
  }, [cleanup, setIsDrawing]);

  // Undo last point
  const undoLastPoint = useCallback(() => {
    if (points.length === 0) return;
    
    const newPoints = points.slice(0, -1);
    setPoints(newPoints);
    
    // Remove last marker
    if (markers.length > 0) {
      markers[markers.length - 1].remove();
      setMarkers(markers.slice(0, -1));
    }
    
    // Update polygon
    updatePolygon(newPoints);
  }, [points, markers]);

  // Update polygon on map
  const updatePolygon = useCallback((coords: [number, number][]) => {
    const map = mapRef.current;
    if (!map || coords.length < 2) return;

    const geojson: GeoJSON.Feature<GeoJSON.Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [coords.length >= 3 ? [...coords, coords[0]] : coords]
      }
    };

    if (map.getSource('draw-polygon')) {
      (map.getSource('draw-polygon') as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource('draw-polygon', {
        type: 'geojson',
        data: geojson
      });

      map.addLayer({
        id: 'draw-polygon-fill',
        type: 'fill',
        source: 'draw-polygon',
        paint: {
          'fill-color': '#22c55e',
          'fill-opacity': 0.3
        }
      });

      map.addLayer({
        id: 'draw-polygon-line',
        type: 'line',
        source: 'draw-polygon',
        paint: {
          'line-color': '#15803d',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });
    }
  }, [mapRef]);

  // Handle map click for drawing
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isDrawing) return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      // Create marker element with animation
      const el = document.createElement('div');
      el.className = 'w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-bounce';
      el.style.animation = 'bounce 0.5s ease-out';
      
      // Add marker
      const marker = new maplibregl.Marker({ 
        element: el,
        anchor: 'center'
      })
        .setLngLat(lngLat)
        .addTo(map);
      
      setMarkers(prev => [...prev, marker]);
      setPoints(prev => {
        const newPoints = [...prev, lngLat];
        updatePolygon(newPoints);
        return newPoints;
      });
    };

    map.on('click', handleClick);
    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleClick);
      map.getCanvas().style.cursor = '';
    };
  }, [isDrawing, mapRef, updatePolygon]);

  // Save polygon
  const handleSave = async () => {
    if (points.length < 3) {
      toast.error(t('impact.map.needMorePoints', 'Cần ít nhất 3 điểm'));
      return;
    }

    if (!areaName.trim()) {
      toast.error(t('impact.map.nameRequired', 'Vui lòng nhập tên khu vực'));
      return;
    }

    try {
      await createForestArea.mutateAsync({
        name: areaName,
        coordinates: points,
        area_hectares: calculatedArea,
        forest_type: forestType || undefined,
        trees_count: treesCount
      });

      toast.success(t('impact.map.areaSaved', 'Đã lưu khu vực rừng'));
      setShowSaveDialog(false);
      stopDrawing();
      
      // Reset form
      setAreaName('');
      setForestType('');
      setTreesCount(0);
    } catch (error) {
      toast.error(t('common.error', 'Có lỗi xảy ra'));
    }
  };

  if (!isDrawing) {
    return null; // Draw button is now in MapToolbar
  }

  return (
    <>
      {/* Drawing Controls with Step Guidance */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-20 left-3 z-10 bg-background/95 backdrop-blur rounded-xl p-4 shadow-2xl border space-y-4 max-w-[280px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Pencil className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{t('impact.map.drawMode', 'Chế độ vẽ')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('impact.map.step', 'Bước')} {currentStep + 1}/4
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={stopDrawing}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="h-2" />

          {/* Step Guidance */}
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg"
          >
            <MousePointer className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">{STEPS[currentStep].label}</span>
          </motion.div>

          {/* Stats */}
          {points.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 p-2 bg-muted rounded-lg">
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {points.length}
                </Badge>
                <span className="text-muted-foreground">{t('impact.map.points', 'điểm')}</span>
              </div>
              {points.length >= 3 && (
                <div className="flex items-center gap-1.5 p-2 bg-muted rounded-lg">
                  <span className="font-semibold text-primary">{calculatedArea.toFixed(2)}</span>
                  <span className="text-muted-foreground">ha</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={undoLastPoint}
              disabled={points.length === 0}
              className="flex-1 gap-1"
            >
              <Undo2 className="h-3 w-3" />
              {t('impact.map.undo', 'Hoàn tác')}
            </Button>
            
            {points.length >= 3 && (
              <Button
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="flex-1 gap-1"
              >
                <Check className="h-3 w-3" />
                {t('common.done', 'Hoàn tất')}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🌳 {t('impact.map.saveForestArea', 'Lưu khu vực rừng')}
            </DialogTitle>
            <DialogDescription>
              {t('impact.map.saveDescription', 'Nhập thông tin về khu vực rừng bạn vừa vẽ')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="area-name">{t('impact.map.areaName', 'Tên khu vực')} *</Label>
              <Input
                id="area-name"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder={t('impact.map.areaNamePlaceholder', 'VD: Khu rừng A, Đồi thông B...')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('impact.map.forestType', 'Loại rừng')}</Label>
              <Select value={forestType} onValueChange={setForestType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('impact.map.selectForestType', 'Chọn loại rừng')} />
                </SelectTrigger>
                <SelectContent>
                  {FOREST_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.emoji}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trees-count">{t('impact.map.treesCount', 'Số cây đã trồng')}</Label>
              <Input
                id="trees-count"
                type="number"
                min={0}
                value={treesCount}
                onChange={(e) => setTreesCount(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="bg-primary/5 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('impact.map.calculatedArea', 'Diện tích')}</span>
                <span className="text-lg font-bold text-primary">{calculatedArea.toFixed(2)} ha</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('impact.map.basedOnPoints', 'Dựa trên {{count}} điểm đã chọn', { count: points.length })}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createForestArea.isPending}
              className="gap-2"
            >
              {createForestArea.isPending ? (
                t('common.loading', 'Đang tải...')
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t('common.save', 'Lưu')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
