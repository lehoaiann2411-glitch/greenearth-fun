import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import maplibregl from 'maplibre-gl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Trash2, 
  Undo2,
  X
} from 'lucide-react';
import { useCreateForestArea, calculatePolygonArea } from '@/hooks/useForestAreas';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ForestPolygonDrawerProps {
  mapRef: React.MutableRefObject<maplibregl.Map | null>;
  isDrawing: boolean;
  setIsDrawing: (value: boolean) => void;
}

const FOREST_TYPES = [
  { value: 'mangrove', label: 'Rừng ngập mặn' },
  { value: 'rainforest', label: 'Rừng mưa nhiệt đới' },
  { value: 'pine', label: 'Rừng thông' },
  { value: 'bamboo', label: 'Rừng tre' },
  { value: 'mixed', label: 'Rừng hỗn hợp' },
  { value: 'planted', label: 'Rừng trồng' }
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
  const [polygon, setPolygon] = useState<maplibregl.GeoJSONSource | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [forestType, setForestType] = useState('');
  const [treesCount, setTreesCount] = useState(0);

  // Calculate area
  const calculatedArea = calculatePolygonArea(points);

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
      
      // Add marker
      const marker = new maplibregl.Marker({ 
        color: '#22c55e',
        scale: 0.7
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
    return (
      <div className="absolute bottom-20 left-3 z-10">
        <Button
          onClick={startDrawing}
          className="gap-2 bg-primary shadow-lg"
        >
          <Pencil className="h-4 w-4" />
          {t('impact.map.drawPolygon', 'Vẽ khu vực')}
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Drawing Controls */}
      <div className="absolute bottom-20 left-3 z-10 bg-background/95 backdrop-blur rounded-lg p-3 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">
            {t('impact.map.drawMode', 'Chế độ vẽ')}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {t('impact.map.drawInstructions', 'Click trên bản đồ để đánh dấu khu vực rừng')}
        </p>

        {points.length > 0 && (
          <div className="text-xs space-y-1">
            <p>
              <span className="font-medium">{t('impact.map.points', 'Điểm')}:</span> {points.length}
            </p>
            {points.length >= 3 && (
              <p>
                <span className="font-medium">{t('impact.map.area', 'Diện tích')}:</span>{' '}
                {calculatedArea.toFixed(2)} ha
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={undoLastPoint}
            disabled={points.length === 0}
            className="gap-1"
          >
            <Undo2 className="h-3 w-3" />
            {t('impact.map.undo', 'Hoàn tác')}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={stopDrawing}
            className="gap-1"
          >
            <X className="h-3 w-3" />
            {t('common.cancel', 'Hủy')}
          </Button>
        </div>

        {points.length >= 3 && (
          <Button
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            className="w-full gap-1"
          >
            <Save className="h-3 w-3" />
            {t('impact.map.saveArea', 'Lưu khu vực')}
          </Button>
        )}
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('impact.map.saveForestArea', 'Lưu khu vực rừng')}</DialogTitle>
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
                      {type.label}
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

            <div className="bg-muted p-3 rounded-lg text-sm">
              <p>
                <span className="font-medium">{t('impact.map.calculatedArea', 'Diện tích tính được')}:</span>{' '}
                <span className="text-primary font-bold">{calculatedArea.toFixed(2)} ha</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ({points.length} {t('impact.map.points', 'điểm')})
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
            >
              {createForestArea.isPending ? (
                t('common.loading', 'Đang tải...')
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
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
