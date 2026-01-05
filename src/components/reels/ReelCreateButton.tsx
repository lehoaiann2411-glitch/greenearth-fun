import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReelCreateButtonProps {
  className?: string;
}

export function ReelCreateButton({ className }: ReelCreateButtonProps) {
  return (
    <Link to="/reels/create">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden ${className}`}
      >
        {/* Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-emerald-500 to-yellow-500 animate-spin-slow" style={{ animationDuration: '3s' }} />
        
        {/* Inner Circle */}
        <div className="absolute inset-[3px] rounded-full bg-black flex items-center justify-center">
          <Plus className="h-8 w-8 text-white" strokeWidth={2.5} />
        </div>

        {/* Glow Effect */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-emerald-500/30 blur-lg"
        />
      </motion.button>
    </Link>
  );
}
