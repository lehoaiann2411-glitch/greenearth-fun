import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isGreenMessage } from '@/lib/camlyCoin';

interface StoryReplyInputProps {
  onSendReply: (message: string, isGreen: boolean) => void;
  disabled?: boolean;
}

export function StoryReplyInput({ onSendReply, disabled }: StoryReplyInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiHint, setShowEmojiHint] = useState(false);

  const isGreen = isGreenMessage(message);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendReply(message.trim(), isGreen);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickEmojis = ['🌱', '💚', '🌳', '🔥', '❤️', '👏'];

  return (
    <div className="relative">
      {/* Quick emoji buttons */}
      {showEmojiHint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-0 flex gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5"
        >
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setMessage(prev => prev + emoji);
                setShowEmojiHint(false);
              }}
              className="text-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowEmojiHint(true)}
            onBlur={() => setTimeout(() => setShowEmojiHint(false), 200)}
            placeholder="Send a message..."
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10 ${
              isGreen ? 'border-primary ring-1 ring-primary/50' : ''
            }`}
            disabled={disabled}
          />
          <button
            onClick={() => setShowEmojiHint(!showEmojiHint)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="bg-primary hover:bg-primary/90 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Green reply hint */}
      {isGreen && message.trim() && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-primary mt-1 flex items-center gap-1"
        >
          🌱 Green message! +500 bonus Camly Coin
        </motion.p>
      )}
    </div>
  );
}
