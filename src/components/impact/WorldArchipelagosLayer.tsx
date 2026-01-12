import React from 'react';
import { Marker, Source, Layer } from 'react-map-gl/maplibre';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { WORLD_ARCHIPELAGOS, Archipelago } from '@/data/worldArchipelagos';

interface WorldArchipelagosLayerProps {
  onArchipelagoClick?: (archipelagoId: string, archipelago: Archipelago) => void;
  selectedArchipelago?: string | null;
  showLabels?: boolean;
  highlightedOnly?: boolean;
}

export function WorldArchipelagosLayer({
  onArchipelagoClick,
  selectedArchipelago,
  showLabels = true,
  highlightedOnly = false,
}: WorldArchipelagosLayerProps) {
  const { t } = useTranslation();

  const archipelagos = Object.entries(WORLD_ARCHIPELAGOS).filter(([_, arch]) => 
    highlightedOnly ? arch.highlighted : true
  );

  return (
    <>
      {archipelagos.map(([key, archipelago]) => (
        <React.Fragment key={key}>
          {/* Individual island markers */}
          {archipelago.islands.map((island, idx) => (
            <Marker
              key={`${key}-island-${idx}`}
              longitude={island.coords[0]}
              latitude={island.coords[1]}
              anchor="center"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300 }}
                className="cursor-pointer relative group"
                onClick={() => onArchipelagoClick?.(key, archipelago)}
              >
                {/* Glow effect for highlighted (Vietnam) islands */}
                {archipelago.highlighted && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: archipelago.color }}
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
                
                {/* Island marker */}
                <div
                  className="relative w-3 h-3 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-150"
                  style={{ 
                    backgroundColor: archipelago.color,
                    boxShadow: archipelago.highlighted 
                      ? `0 0 10px ${archipelago.color}, 0 0 20px ${archipelago.color}` 
                      : `0 2px 4px rgba(0,0,0,0.3)`
                  }}
                >
                  {/* Center dot */}
                  <div className="absolute inset-1 rounded-full bg-white/80" />
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <div 
                    className="px-2 py-1 rounded text-[10px] font-medium text-white shadow-lg"
                    style={{ backgroundColor: archipelago.color }}
                  >
                    {t(island.nameKey)}
                  </div>
                </div>
              </motion.div>
            </Marker>
          ))}

          {/* Archipelago center label */}
          {showLabels && (
            <Marker
              longitude={archipelago.center[0]}
              latitude={archipelago.center[1]}
              anchor="center"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="cursor-pointer"
                onClick={() => onArchipelagoClick?.(key, archipelago)}
              >
                <div
                  className={`
                    px-3 py-1.5 rounded-full shadow-lg
                    flex items-center gap-2
                    transition-all hover:scale-105
                    ${selectedArchipelago === key ? 'ring-2 ring-white ring-offset-2' : ''}
                  `}
                  style={{ 
                    backgroundColor: archipelago.color,
                    boxShadow: archipelago.highlighted 
                      ? `0 0 15px ${archipelago.color}` 
                      : '0 4px 6px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* Marker dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-inner" />
                  
                  {/* Label */}
                  <span className="text-xs font-bold text-white drop-shadow-md whitespace-nowrap">
                    {t(archipelago.nameKey)}
                  </span>
                  
                  {/* Vietnam sovereignty badge */}
                  {archipelago.highlighted && (
                    <div className="w-4 h-3 rounded-sm overflow-hidden shadow-sm flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-b from-red-500 to-red-600 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-yellow-400" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </Marker>
          )}
        </React.Fragment>
      ))}
    </>
  );
}
