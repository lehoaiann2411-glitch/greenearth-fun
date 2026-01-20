import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface VideoFilter {
  id: string;
  name: string;
  nameVi: string;
  css: string;
  icon: string;
}

export const VIDEO_FILTERS: VideoFilter[] = [
  { id: 'original', name: 'Original', nameVi: 'Gốc', css: 'none', icon: '✨' },
  { id: 'vivid', name: 'Vivid', nameVi: 'Sống động', css: 'brightness(1.1) saturate(1.3)', icon: '🌈' },
  { id: 'cool', name: 'Cool', nameVi: 'Lạnh', css: 'sepia(0.1) hue-rotate(-20deg) saturate(1.1)', icon: '❄️' },
  { id: 'warm', name: 'Warm', nameVi: 'Ấm', css: 'sepia(0.2) brightness(1.05) saturate(1.1)', icon: '🔥' },
  { id: 'bw', name: 'B&W', nameVi: 'Đen trắng', css: 'grayscale(1)', icon: '🎬' },
  { id: 'vintage', name: 'Vintage', nameVi: 'Cổ điển', css: 'sepia(0.4) contrast(0.9) brightness(1.05)', icon: '📷' },
  { id: 'beauty', name: 'Beauty', nameVi: 'Làm đẹp', css: 'brightness(1.08) contrast(0.95) saturate(1.05)', icon: '💄' },
  { id: 'drama', name: 'Drama', nameVi: 'Kịch tính', css: 'contrast(1.3) brightness(0.95) saturate(1.1)', icon: '🎭' },
  { id: 'fade', name: 'Fade', nameVi: 'Mờ nhạt', css: 'brightness(1.1) contrast(0.85) saturate(0.9)', icon: '🌫️' },
  { id: 'eco', name: 'Eco Green', nameVi: 'Xanh Eco', css: 'saturate(1.3) hue-rotate(25deg) brightness(1.05)', icon: '🌿' },
  { id: 'sunset', name: 'Sunset', nameVi: 'Hoàng hôn', css: 'sepia(0.3) hue-rotate(-10deg) saturate(1.4)', icon: '🌅' },
  { id: 'ocean', name: 'Ocean', nameVi: 'Đại dương', css: 'hue-rotate(-30deg) saturate(1.2) brightness(1.05)', icon: '🌊' },
];

interface VideoFilterPickerProps {
  mediaUrl: string;
  mediaType: 'video' | 'image';
  selectedFilter: VideoFilter;
  onSelect: (filter: VideoFilter) => void;
  onClose: () => void;
}

export function VideoFilterPicker({
  mediaUrl,
  mediaType,
  selectedFilter,
  onSelect,
  onClose,
}: VideoFilterPickerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewFilter, setPreviewFilter] = useState<VideoFilter>(selectedFilter);

  useEffect(() => {
    if (videoRef.current && mediaType === 'video') {
      videoRef.current.play().catch(() => {});
    }
  }, [mediaType]);

  const handleConfirm = () => {
    onSelect(previewFilter);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onClose} className="text-white p-2">
          <X className="h-6 w-6" />
        </button>
        <h1 className="text-white font-bold text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Hiệu ứng
        </h1>
        <Button
          onClick={handleConfirm}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6"
        >
          <Check className="h-4 w-4 mr-1" />
          Áp dụng
        </Button>
      </div>

      {/* Media Preview with Filter */}
      <div className="flex-1 flex items-center justify-center px-4 py-2" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="relative w-full max-w-md aspect-[9/16] mx-auto rounded-2xl overflow-hidden bg-black">
          {mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              className="w-full h-full object-contain"
              style={{ filter: previewFilter.css }}
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Preview"
              className="w-full h-full object-contain"
              style={{ filter: previewFilter.css }}
            />
          )}

          {/* Current filter badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm flex items-center gap-2">
            <span>{previewFilter.icon}</span>
            <span>{previewFilter.nameVi}</span>
          </div>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-6 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {VIDEO_FILTERS.map((filter) => (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreviewFilter(filter)}
              className={`flex-shrink-0 flex flex-col items-center ${
                previewFilter.id === filter.id ? 'opacity-100' : 'opacity-70'
              }`}
            >
              {/* Filter Preview Thumbnail */}
              <div
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  previewFilter.id === filter.id
                    ? 'border-emerald-500 ring-2 ring-emerald-500/50'
                    : 'border-white/20'
                }`}
              >
                {mediaType === 'video' ? (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    style={{ filter: filter.css }}
                    muted
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={filter.name}
                    className="w-full h-full object-cover"
                    style={{ filter: filter.css }}
                  />
                )}
              </div>
              {/* Filter Name */}
              <span className="text-white text-xs mt-1.5 font-medium">
                {filter.icon} {filter.nameVi}
              </span>
              {previewFilter.id === filter.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
