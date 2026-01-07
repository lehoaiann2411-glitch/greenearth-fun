import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Smile } from 'lucide-react';

interface MessageReactionsProps {
  messageId: string;
  reactions?: { emoji: string; count: number; hasReacted: boolean }[];
  onReact: (messageId: string, emoji: string) => void;
  compact?: boolean;
}

const quickReactions = ['❤️', '🌿', '🌍', '👏', '🔥', '😊'];

export function MessageReactions({
  messageId,
  reactions = [],
  onReact,
  compact = false,
}: MessageReactionsProps) {
  const [open, setOpen] = useState(false);

  const handleReact = (emoji: string) => {
    onReact(messageId, emoji);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Existing Reactions */}
      {reactions.length > 0 && (
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-muted/50 text-xs">
          {reactions.slice(0, 3).map((r, i) => (
            <button
              key={i}
              onClick={() => handleReact(r.emoji)}
              className={cn(
                'hover:scale-125 transition-transform',
                r.hasReacted && 'opacity-100',
                !r.hasReacted && 'opacity-70'
              )}
            >
              {r.emoji}
            </button>
          ))}
          {reactions.length > 0 && (
            <span className="text-muted-foreground ml-0.5">
              {reactions.reduce((acc, r) => acc + r.count, 0)}
            </span>
          )}
        </div>
      )}

      {/* Add Reaction Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
              compact && 'h-5 w-5'
            )}
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex items-center gap-1">
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-xl hover:scale-125 transition-transform p-1 hover:bg-muted rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
