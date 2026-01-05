import { motion } from 'framer-motion';
import { TrendingUp, Sparkles } from 'lucide-react';
import { TRENDING_HASHTAGS } from '@/hooks/useReels';

interface TrendingHashtagsProps {
  onHashtagClick?: (hashtag: string) => void;
}

export function TrendingHashtags({ onHashtagClick }: TrendingHashtagsProps) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-emerald-500" />
        <h3 className="font-bold text-lg">Hashtag thịnh hành</h3>
        <Sparkles className="h-4 w-4 text-yellow-500" />
      </div>

      <div className="flex flex-wrap gap-2">
        {TRENDING_HASHTAGS.map((tag, index) => (
          <motion.button
            key={tag}
            onClick={() => onHashtagClick?.(tag)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:from-emerald-500/20 hover:to-green-500/20 transition-colors"
          >
            {tag}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
