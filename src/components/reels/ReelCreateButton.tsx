import { motion } from 'framer-motion';
import { Plus, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReelCreateButtonProps {
  className?: string;
}

export function ReelCreateButton({ className }: ReelCreateButtonProps) {
  return (
    <Link to="/reels/create">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center ${className}`}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 animate-pulse opacity-50" />
        
        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center">
          <Plus className="h-7 w-7 text-white" strokeWidth={3} />
        </div>

        {/* Leaf accent */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1"
        >
          <Leaf className="h-4 w-4 text-white drop-shadow-md" />
        </motion.div>
      </motion.button>
    </Link>
  );
}
