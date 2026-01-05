import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const EMOJI_CATEGORIES = {
  eco: ['🌍', '🌎', '🌏', '🌳', '🌲', '🌴', '🌱', '🌿', '🍃', '🍀', '🌻', '🌺', '🌸', '🌷', '🌹', '💐', '🌾', '🌵', '🏔️', '⛰️', '🏕️', '🏞️', '🌅', '🌄', '♻️', '💚', '💧', '🌊', '☀️', '🌤️', '🌈', '🐝', '🦋', '🐦', '🐢', '🐬', '🐋', '🦎', '🐸', '🐘'],
  faces: ['😊', '😄', '🥰', '😍', '🤩', '😎', '🙌', '👏', '💪', '✨', '🎉', '🙏', '❤️', '💕', '💗', '🤝', '👍', '🌟', '⭐', '🔥'],
  objects: ['📷', '📸', '🎥', '📍', '📌', '🏷️', '🎁', '🏆', '🥇', '🎯', '💡', '📱', '💻', '🎨', '✏️', '📝', '🗓️', '⏰', '🔔', '📣'],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('eco');

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Smile className="w-4 h-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        {/* Category tabs */}
        <div className="flex gap-1 mb-2 pb-2 border-b">
          <Button
            variant={activeCategory === 'eco' ? 'secondary' : 'ghost'}
            size="sm"
            className="text-xs px-2 h-7"
            onClick={() => setActiveCategory('eco')}
          >
            🌍 Eco
          </Button>
          <Button
            variant={activeCategory === 'faces' ? 'secondary' : 'ghost'}
            size="sm"
            className="text-xs px-2 h-7"
            onClick={() => setActiveCategory('faces')}
          >
            😊 Faces
          </Button>
          <Button
            variant={activeCategory === 'objects' ? 'secondary' : 'ghost'}
            size="sm"
            className="text-xs px-2 h-7"
            onClick={() => setActiveCategory('objects')}
          >
            📷 Objects
          </Button>
        </div>

        {/* Emoji grid */}
        <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
              <motion.button
                key={emoji}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleSelect(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded transition-colors"
              >
                {emoji}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick eco emojis */}
        <div className="mt-2 pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-1">Frequently used</p>
          <div className="flex gap-1">
            {['🌳', '🌱', '🌍', '💚', '♻️', '🌿'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSelect(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
