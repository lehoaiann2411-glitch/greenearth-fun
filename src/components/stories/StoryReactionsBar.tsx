import { motion } from 'framer-motion';
import { STORY_REACTIONS } from '@/lib/camlyCoin';

interface StoryReactionsBarProps {
  onReact: (reaction: string) => void;
  currentReaction?: string;
}

export function StoryReactionsBar({ onReact, currentReaction }: StoryReactionsBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2"
    >
      {STORY_REACTIONS.map((emoji, index) => (
        <motion.button
          key={emoji}
          onClick={() => onReact(emoji)}
          className={`text-2xl transition-transform ${
            currentReaction === emoji ? 'scale-125' : ''
          }`}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: index * 0.05 }
          }}
        >
          {emoji}
        </motion.button>
      ))}
    </motion.div>
  );
}
