import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface EcoStickersProps {
  onSelectSticker: (sticker: string) => void;
}

const stickerCategories = {
  nature: {
    label: '🌿 Nature',
    stickers: ['🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🍃', '🍂', '🍁', '🌾', '🌵'],
  },
  earth: {
    label: '🌍 Earth',
    stickers: ['🌍', '🌎', '🌏', '🌐', '🗺️', '🧭', '⛰️', '🏔️', '🌋', '🏝️', '🏖️', '🌊'],
  },
  animals: {
    label: '🦋 Animals',
    stickers: ['🦋', '🐝', '🐛', '🦎', '🐢', '🐠', '🐬', '🦜', '🦉', '🐿️', '🦔', '🐸'],
  },
  weather: {
    label: '☀️ Weather',
    stickers: ['☀️', '🌤️', '⛅', '🌈', '🌧️', '💧', '❄️', '🌸', '🌺', '🌻', '🌼', '🌷'],
  },
  eco: {
    label: '♻️ Eco',
    stickers: ['♻️', '🔋', '💡', '🚲', '🚶', '🏃', '🧺', '🪴', '🌡️', '💚', '✨', '🎋'],
  },
};

export function EcoStickers({ onSelectSticker }: EcoStickersProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('nature');

  return (
    <div className="w-72">
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full grid grid-cols-5 h-auto p-1">
          {Object.entries(stickerCategories).map(([key, category]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="text-lg p-2 data-[state=active]:bg-primary/10"
            >
              {category.stickers[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(stickerCategories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="mt-2">
            <ScrollArea className="h-40">
              <div className="grid grid-cols-6 gap-1 p-2">
                {category.stickers.map((sticker, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'text-2xl h-10 w-10 p-0 hover:bg-primary/10 hover:scale-110 transition-all duration-200',
                      'active:scale-95'
                    )}
                    onClick={() => onSelectSticker(sticker)}
                  >
                    {sticker}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
