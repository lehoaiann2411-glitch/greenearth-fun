import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AQIStationMarkerProps {
  aqi: number;
  name?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

// Get AQI color and info based on value
function getAQIInfo(aqi: number) {
  if (aqi <= 50) return { color: '#00e400', textColor: 'text-gray-800', emoji: '😊', level: 'Good' };
  if (aqi <= 100) return { color: '#ffff00', textColor: 'text-gray-800', emoji: '🙂', level: 'Moderate' };
  if (aqi <= 150) return { color: '#ff7e00', textColor: 'text-white', emoji: '😐', level: 'Unhealthy for Sensitive' };
  if (aqi <= 200) return { color: '#ff0000', textColor: 'text-white', emoji: '😷', level: 'Unhealthy' };
  if (aqi <= 300) return { color: '#8f3f97', textColor: 'text-white', emoji: '🤢', level: 'Very Unhealthy' };
  return { color: '#7e0023', textColor: 'text-white', emoji: '☠️', level: 'Hazardous' };
}

export function AQIStationMarker({ 
  aqi, 
  name,
  onClick,
  size = 'md' 
}: AQIStationMarkerProps) {
  const info = getAQIInfo(aqi);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const glowSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.15, zIndex: 100 }}
      onClick={onClick}
      className="relative cursor-pointer"
      title={name}
    >
      {/* Pulsing glow effect */}
      <motion.div
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-sm',
          glowSizes[size]
        )}
        style={{ backgroundColor: info.color }}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: 'easeInOut'
        }}
      />

      {/* Main circle with AQI value */}
      <motion.div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-full font-bold shadow-lg border-2 border-white/50',
          sizeClasses[size],
          info.textColor
        )}
        style={{ backgroundColor: info.color }}
      >
        <span className="leading-none">{aqi}</span>
      </motion.div>

      {/* Emoji badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="absolute -top-1 -right-1 text-sm drop-shadow-md"
      >
        {info.emoji}
      </motion.div>
    </motion.div>
  );
}

export { getAQIInfo };
