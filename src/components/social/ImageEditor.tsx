import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper, { Area, Point } from 'react-easy-crop';
import { 
  X, Check, Crop, RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  Sparkles, Sticker, Undo2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { 
  FILTER_PRESETS, 
  CROP_RATIOS, 
  processEditedImage,
  type StickerOverlay,
  type CropArea
} from '@/lib/imageProcessing';
import { StoryStickerPicker } from '@/components/stories/StoryStickerPicker';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

type EditorTool = 'crop' | 'rotate' | 'filter' | 'sticker';

interface ImageEditorProps {
  image: string;
  onApply: (editedFile: File, editedPreview: string) => void;
  onClose: () => void;
}

export function ImageEditor({ image, onApply, onClose }: ImageEditorProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  
  const [activeTool, setActiveTool] = useState<EditorTool>('crop');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<Area | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  
  // Rotate state
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  // Filter state
  const [selectedFilter, setSelectedFilter] = useState(FILTER_PRESETS[0]);
  
  // Sticker state
  const [stickers, setStickers] = useState<StickerOverlay[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCropArea(croppedAreaPixels);
  }, []);

  const handleAddSticker = useCallback((sticker: { id: string; emoji: string; text?: string }) => {
    const newSticker: StickerOverlay = {
      ...sticker,
      id: `sticker-${Date.now()}`,
      x: 50,
      y: 50,
      scale: 1,
    };
    setStickers(prev => [...prev, newSticker]);
    setShowStickerPicker(false);
  }, []);

  const handleRemoveSticker = useCallback((id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropArea(null);
    setAspectRatio(undefined);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setSelectedFilter(FILTER_PRESETS[0]);
    setStickers([]);
  }, []);

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      const result = await processEditedImage(image, {
        cropArea: cropArea as CropArea | undefined,
        rotation,
        flipH,
        flipV,
        filter: selectedFilter.css,
        stickers,
      });
      
      onApply(result.file, result.previewUrl);
      toast.success(isVi ? 'Đã áp dụng chỉnh sửa!' : 'Edits applied!');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error(isVi ? 'Lỗi xử lý ảnh' : 'Error processing image');
    } finally {
      setIsProcessing(false);
    }
  };

  const tools = [
    { id: 'crop' as const, icon: Crop, label: isVi ? 'Cắt' : 'Crop' },
    { id: 'rotate' as const, icon: RotateCw, label: isVi ? 'Xoay' : 'Rotate' },
    { id: 'filter' as const, icon: Sparkles, label: isVi ? 'Bộ lọc' : 'Filter' },
    { id: 'sticker' as const, icon: Sticker, label: isVi ? 'Nhãn dán' : 'Sticker' },
  ];

  // Calculate preview transform
  const previewStyle = {
    filter: selectedFilter.css !== 'none' ? selectedFilter.css : undefined,
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
        
        <h2 className="text-white font-semibold">
          {isVi ? 'Chỉnh sửa ảnh' : 'Edit Image'}
        </h2>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={handleReset}
            title={isVi ? 'Hoàn tác' : 'Reset'}
          >
            <Undo2 className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={handleApply}
            disabled={isProcessing}
            className="bg-primary hover:bg-primary/90"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5 mr-1" />
                {isVi ? 'Áp dụng' : 'Apply'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
      >
        {activeTool === 'crop' ? (
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            rotation={rotation}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { background: '#000' },
              cropAreaStyle: { border: '2px solid #22c55e' },
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="relative max-w-full max-h-full">
              <img
                src={image}
                alt="Preview"
                className="max-w-full max-h-[60vh] object-contain"
                style={previewStyle}
              />
              
              {/* Stickers overlay */}
              {stickers.map((sticker) => (
                <motion.div
                  key={sticker.id}
                  className="absolute cursor-move select-none"
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    transform: `translate(-50%, -50%) scale(${sticker.scale})`,
                  }}
                  drag
                  dragMomentum={false}
                  onDrag={(_, info) => {
                    const container = containerRef.current;
                    if (container) {
                      const rect = container.getBoundingClientRect();
                      const x = Math.max(0, Math.min(100, ((info.point.x - rect.left) / rect.width) * 100));
                      const y = Math.max(0, Math.min(100, ((info.point.y - rect.top) / rect.height) * 100));
                      setStickers(prev => prev.map(s =>
                        s.id === sticker.id ? { ...s, x, y } : s
                      ));
                    }
                  }}
                  whileTap={{ scale: 1.2 }}
                  onDoubleClick={() => handleRemoveSticker(sticker.id)}
                >
                  {sticker.text ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/80 rounded-full text-white text-sm font-bold whitespace-nowrap">
                      <span className="text-lg">{sticker.emoji}</span>
                      <span>{sticker.text}</span>
                    </div>
                  ) : (
                    <span className="text-4xl drop-shadow-lg">{sticker.emoji}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tool Tabs */}
      <div className="flex items-center justify-center gap-2 p-3 border-t border-white/10 bg-black/50">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
              activeTool === tool.id
                ? "bg-primary/20 text-primary"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <tool.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Tool Options */}
      <div className="p-4 bg-black/80 border-t border-white/10 min-h-[120px]">
        <AnimatePresence mode="wait">
          {/* Crop Options */}
          {activeTool === 'crop' && (
            <motion.div
              key="crop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {CROP_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.ratio ?? undefined)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                      aspectRatio === ratio.ratio || (ratio.ratio === null && aspectRatio === undefined)
                        ? "bg-primary text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    )}
                  >
                    {isVi ? ratio.name_vi : ratio.name}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-white/60 text-sm w-16">Zoom</span>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={([value]) => setZoom(value)}
                  className="flex-1"
                />
                <span className="text-white text-sm w-12">{zoom.toFixed(1)}x</span>
              </div>
            </motion.div>
          )}

          {/* Rotate Options */}
          {activeTool === 'rotate' && (
            <motion.div
              key="rotate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => setRotation(r => r - 90)}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => setRotation(r => r + 90)}
                >
                  <RotateCw className="w-5 h-5" />
                </Button>
                <div className="w-px h-8 bg-white/20" />
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "bg-white/10 border-white/20 text-white hover:bg-white/20",
                    flipH && "bg-primary/30 border-primary"
                  )}
                  onClick={() => setFlipH(f => !f)}
                >
                  <FlipHorizontal className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "bg-white/10 border-white/20 text-white hover:bg-white/20",
                    flipV && "bg-primary/30 border-primary"
                  )}
                  onClick={() => setFlipV(f => !f)}
                >
                  <FlipVertical className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-white/60 text-sm w-16">{isVi ? 'Góc' : 'Angle'}</span>
                <Slider
                  value={[rotation]}
                  min={-180}
                  max={180}
                  step={1}
                  onValueChange={([value]) => setRotation(value)}
                  className="flex-1"
                />
                <span className="text-white text-sm w-12">{rotation}°</span>
              </div>
            </motion.div>
          )}

          {/* Filter Options */}
          {activeTool === 'filter' && (
            <motion.div
              key="filter"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex gap-3 overflow-x-auto pb-2">
                {FILTER_PRESETS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter)}
                    className={cn(
                      "flex flex-col items-center gap-1 shrink-0 transition-all",
                      selectedFilter.id === filter.id && "scale-105"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                        selectedFilter.id === filter.id 
                          ? "border-primary" 
                          : "border-transparent"
                      )}
                    >
                      <img
                        src={image}
                        alt={filter.name}
                        className="w-full h-full object-cover"
                        style={{ filter: filter.css !== 'none' ? filter.css : undefined }}
                      />
                    </div>
                    <span className={cn(
                      "text-xs",
                      selectedFilter.id === filter.id ? "text-primary" : "text-white/60"
                    )}>
                      {isVi ? filter.name_vi : filter.name}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Sticker Options */}
          {activeTool === 'sticker' && (
            <motion.div
              key="sticker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {showStickerPicker ? (
                <StoryStickerPicker
                  onSelectSticker={handleAddSticker}
                  onClose={() => setShowStickerPicker(false)}
                />
              ) : (
                <div className="text-center">
                  <Button
                    onClick={() => setShowStickerPicker(true)}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    <Sticker className="w-5 h-5 mr-2" />
                    {isVi ? 'Thêm nhãn dán' : 'Add Sticker'}
                  </Button>
                  
                  {stickers.length > 0 && (
                    <p className="text-white/40 text-xs mt-2">
                      {isVi 
                        ? `${stickers.length} sticker • Double-tap để xóa`
                        : `${stickers.length} sticker(s) • Double-tap to remove`
                      }
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
