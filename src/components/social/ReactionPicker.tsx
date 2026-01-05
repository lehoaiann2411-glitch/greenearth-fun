import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { REACTION_EMOJIS, REACTION_TYPES } from '@/lib/camlyCoin';

interface ReactionPickerProps {
  currentReaction?: string | null;
  onReact: (reactionType: string) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

const REACTIONS = [
  { type: REACTION_TYPES.LEAF, emoji: '🍃', label: 'Leaf', color: 'text-green-500' },
  { type: REACTION_TYPES.LOVE, emoji: '❤️', label: 'Love', color: 'text-red-500' },
  { type: REACTION_TYPES.CARE, emoji: '🤗', label: 'Care', color: 'text-yellow-500' },
  { type: REACTION_TYPES.HAHA, emoji: '😂', label: 'Haha', color: 'text-yellow-400' },
  { type: REACTION_TYPES.WOW, emoji: '😮', label: 'Wow', color: 'text-yellow-500' },
  { type: REACTION_TYPES.SAD, emoji: '😢', label: 'Sad', color: 'text-blue-500' },
  { type: REACTION_TYPES.ANGRY, emoji: '😠', label: 'Angry', color: 'text-orange-500' },
];

export function ReactionPicker({ currentReaction, onReact, disabled, showLabel = true }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

  const currentReactionData = REACTIONS.find(r => r.type === currentReaction);

  const handleReact = (type: string) => {
    onReact(type);
    setIsOpen(false);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => !disabled && setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <button
        onClick={() => currentReaction ? onReact(currentReaction) : setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200",
          "hover:bg-muted/80",
          currentReaction && currentReactionData?.color,
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="text-lg">
          {currentReaction ? currentReactionData?.emoji : '🍃'}
        </span>
        {showLabel && (
          <span className={cn(
            "text-sm font-medium",
            currentReaction ? currentReactionData?.color : "text-muted-foreground"
          )}>
            {currentReaction ? currentReactionData?.label : 'Like'}
          </span>
        )}
      </button>

      {/* Reaction Picker Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute bottom-full left-0 mb-2 z-50",
              "bg-background border border-border rounded-full shadow-lg",
              "px-2 py-1.5 flex items-center gap-1"
            )}
          >
            {REACTIONS.map((reaction, index) => (
              <motion.button
                key={reaction.type}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleReact(reaction.type)}
                onMouseEnter={() => setHoveredReaction(reaction.type)}
                onMouseLeave={() => setHoveredReaction(null)}
                className={cn(
                  "relative p-1 rounded-full transition-transform duration-200",
                  "hover:scale-125",
                  currentReaction === reaction.type && "bg-muted"
                )}
              >
                <span className="text-2xl">{reaction.emoji}</span>
                
                {/* Label tooltip */}
                <AnimatePresence>
                  {hoveredReaction === reaction.type && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className={cn(
                        "absolute -top-8 left-1/2 -translate-x-1/2",
                        "bg-foreground text-background text-xs px-2 py-1 rounded-md",
                        "whitespace-nowrap"
                      )}
                    >
                      {reaction.label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for showing reaction counts
export function ReactionSummary({ 
  reactions, 
  totalCount,
  onClick 
}: { 
  reactions: { type: string; count: number }[];
  totalCount: number;
  onClick?: () => void;
}) {
  if (totalCount === 0) return null;

  // Get top 3 reactions
  const topReactions = reactions
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
    >
      <div className="flex -space-x-1">
        {topReactions.map((reaction) => (
          <span 
            key={reaction.type} 
            className="text-sm bg-background rounded-full border border-border p-0.5"
          >
            {REACTION_EMOJIS[reaction.type]}
          </span>
        ))}
      </div>
      <span>{totalCount}</span>
    </button>
  );
}
