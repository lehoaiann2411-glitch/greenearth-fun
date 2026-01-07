import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface EmojiPickerFullProps {
  onSelectEmoji: (emoji: string) => void;
}

const emojiCategories = {
  smileys: {
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮', '🥱', '😴', '🤤', '😷', '🤒', '🤕', '🤢', '🤮', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
  },
  gestures: {
    icon: '👍',
    emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '💪', '🦾', '🙋', '🙆', '🙅', '🤷', '💃', '🕺'],
  },
  hearts: {
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '😍', '🥰', '😘', '💋', '💏', '💑', '🫶'],
  },
  nature: {
    icon: '🌿',
    emojis: ['🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🍃', '🍂', '🍁', '🌾', '🌵', '🌍', '🌎', '🌏', '🌊', '⛰️', '🏔️', '🌋', '🏝️', '🌈', '☀️', '🌤️', '⛅', '🌦️', '🌧️', '💧', '❄️', '🌸', '🌺', '🌻', '🌼', '🌷', '🪴', '🌹', '🥀', '🪻', '🪷', '💐'],
  },
  animals: {
    icon: '🐾',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🐢', '🐍', '🦎', '🐠', '🐟', '🐬', '🐳', '🦈', '🐙', '🦑'],
  },
  food: {
    icon: '🍎',
    emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🍜', '🍝', '🍱', '🍣', '🍦', '🎂', '🍰', '🧁', '🍩', '🍪'],
  },
  objects: {
    icon: '🎁',
    emojis: ['🎁', '🎈', '🎉', '🎊', '🎂', '🍰', '🧁', '🎮', '🎯', '🎲', '🎭', '🎨', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺', '🎻', '📱', '💻', '⌨️', '🖥️', '📷', '📸', '📹', '🎥', '📺', '📻', '⏰', '⌚', '💡', '🔦', '🕯️', '💰', '💵', '💎', '🔑', '🗝️', '🔒', '📦', '✉️', '📝', '📚', '📖', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐'],
  },
  symbols: {
    icon: '✨',
    emojis: ['✨', '💫', '⭐', '🌟', '✡️', '❌', '⭕', '❗', '❓', '❔', '❕', '💯', '🔥', '💥', '💢', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🎵', '🎶', '🔔', '🔕', '📣', '📢', '💡', '🔍', '🔎', '♻️', '⚡', '🌀', '💠', '🔷', '🔶', '🟢', '🟡', '🔴', '🟣', '⚫', '⚪'],
  },
};

type CategoryKey = keyof typeof emojiCategories;

export function EmojiPickerFull({ onSelectEmoji }: EmojiPickerFullProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('smileys');

  return (
    <div className="w-72">
      {/* Category tabs */}
      <div className="flex gap-0.5 p-1 bg-muted/50 rounded-lg mb-2">
        {(Object.keys(emojiCategories) as CategoryKey[]).map((key) => (
          <Button
            key={key}
            variant="ghost"
            size="sm"
            className={cn(
              'flex-1 h-8 px-1 text-lg',
              activeCategory === key && 'bg-background shadow-sm'
            )}
            onClick={() => setActiveCategory(key)}
          >
            {emojiCategories[key].icon}
          </Button>
        ))}
      </div>

      {/* Emoji grid */}
      <ScrollArea className="h-48">
        <div className="grid grid-cols-8 gap-0.5">
          {emojiCategories[activeCategory].emojis.map((emoji, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-xl hover:bg-primary/10"
              onClick={() => onSelectEmoji(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
