import { motion } from 'framer-motion';
import { STORY_STICKERS } from '@/lib/camlyCoin';

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  text?: string;
}

interface StoryStickerPickerProps {
  onSelectSticker: (sticker: Omit<Sticker, 'x' | 'y' | 'scale'>) => void;
  onClose: () => void;
}

export function StoryStickerPicker({ onSelectSticker, onClose }: StoryStickerPickerProps) {
  const emojis = STORY_STICKERS.filter(s => !('isBadge' in s));
  const badges = STORY_STICKERS.filter(s => 'isBadge' in s && s.isBadge);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-lg rounded-2xl p-4 z-20"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-white font-semibold text-sm">Stickers</h4>
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm">
          Done
        </button>
      </div>

      {/* Emoji Stickers */}
      <div className="grid grid-cols-8 gap-2 mb-4">
        {emojis.map((sticker) => (
          <motion.button
            key={sticker.id}
            onClick={() => onSelectSticker({ id: sticker.id, emoji: sticker.emoji })}
            className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-white/10 rounded-lg"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {sticker.emoji}
          </motion.button>
        ))}
      </div>

      {/* Badge Stickers */}
      <div className="border-t border-white/10 pt-3">
        <p className="text-white/60 text-xs mb-2">Badges</p>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <motion.button
              key={badge.id}
              onClick={() => onSelectSticker({ 
                id: badge.id, 
                emoji: badge.emoji, 
                text: 'text' in badge ? badge.text : undefined 
              })}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-full text-white text-xs font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{badge.emoji}</span>
              {'text' in badge && <span>{badge.text}</span>}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
