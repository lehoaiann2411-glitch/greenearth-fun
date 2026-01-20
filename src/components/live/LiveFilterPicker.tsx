import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

export interface LiveFilter {
  id: string;
  name: string;
  nameVi: string;
  css: string;
  icon: string;
}

export const LIVE_FILTERS: LiveFilter[] = [
  { id: 'original', name: 'Original', nameVi: 'Gốc', css: 'none', icon: '✨' },
  { id: 'beauty', name: 'Beauty', nameVi: 'Làm đẹp', css: 'brightness(1.1) contrast(0.95) saturate(1.05)', icon: '💄' },
  { id: 'smooth', name: 'Smooth', nameVi: 'Da mịn', css: 'brightness(1.08) contrast(0.92) blur(0.3px)', icon: '🌸' },
  { id: 'glow', name: 'Glow', nameVi: 'Rạng rỡ', css: 'brightness(1.15) contrast(0.9)', icon: '☀️' },
  { id: 'vivid', name: 'Vivid', nameVi: 'Sống động', css: 'saturate(1.3) brightness(1.05)', icon: '🌈' },
  { id: 'warm', name: 'Warm', nameVi: 'Ấm áp', css: 'sepia(0.15) saturate(1.1) brightness(1.05)', icon: '🔥' },
  { id: 'cool', name: 'Cool', nameVi: 'Lạnh', css: 'hue-rotate(-10deg) saturate(0.9) brightness(1.05)', icon: '❄️' },
  { id: 'vintage', name: 'Vintage', nameVi: 'Cổ điển', css: 'sepia(0.3) contrast(1.1) brightness(0.95)', icon: '📷' },
  { id: 'bw', name: 'B&W', nameVi: 'Đen trắng', css: 'grayscale(1) contrast(1.1)', icon: '🖤' },
  { id: 'dreamy', name: 'Dreamy', nameVi: 'Mơ màng', css: 'brightness(1.1) saturate(0.8) contrast(0.85)', icon: '🌙' },
];

interface LiveFilterPickerProps {
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
  onClose: () => void;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

export function LiveFilterPicker({ 
  selectedFilter, 
  onSelectFilter, 
  onClose,
  videoRef 
}: LiveFilterPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl rounded-t-3xl p-4 pb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Bộ lọc làm đẹp</h3>
        <button onClick={onClose} className="text-white/60 p-1">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-5 gap-3">
        {LIVE_FILTERS.map((filter) => {
          const isSelected = selectedFilter === filter.id;
          
          return (
            <motion.button
              key={filter.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectFilter(filter.id)}
              className="flex flex-col items-center"
            >
              {/* Filter Preview */}
              <div 
                className={`relative w-14 h-14 rounded-full overflow-hidden mb-1.5 ${
                  isSelected ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-black' : ''
                }`}
              >
                <div 
                  className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl"
                  style={{ filter: filter.css !== 'none' ? filter.css : undefined }}
                >
                  {filter.icon}
                </div>
                
                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-pink-500/30 flex items-center justify-center"
                  >
                    <Check className="h-5 w-5 text-white" />
                  </motion.div>
                )}
              </div>
              
              {/* Filter Name */}
              <span className={`text-xs ${isSelected ? 'text-pink-400 font-medium' : 'text-white/70'}`}>
                {filter.nameVi}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
