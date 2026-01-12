import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { WORLD_ARCHIPELAGOS, Archipelago } from '@/data/worldArchipelagos';
import { CountryFlag } from './CountryFlag';

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
          {/* Individual island markers - now with flags */}
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
                    className="absolute -inset-1 rounded-sm"
                    style={{ backgroundColor: '#dc2626' }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
                
                {/* Flag marker */}
                <div
                  className={`
                    relative transition-transform group-hover:scale-125
                    ${archipelago.highlighted ? 'ring-2 ring-yellow-400 ring-offset-1 rounded-sm' : ''}
                  `}
                >
                  <CountryFlag 
                    country={archipelago.sovereignty} 
                    size={archipelago.highlighted ? 20 : 16} 
                  />
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  <div 
                    className="px-2 py-1 rounded text-[10px] font-medium text-white shadow-lg bg-gray-900/90 backdrop-blur-sm"
                  >
                    {t(island.nameKey)}
                  </div>
                </div>
              </motion.div>
            </Marker>
          ))}

          {/* Archipelago center label - now white text like country names */}
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
                    flex items-center gap-1.5
                    transition-all hover:scale-105
                    ${selectedArchipelago === key ? 'scale-110' : ''}
                  `}
                >
                  {/* White italic text like country names on maps */}
                  <span 
                    className="
                      text-[11px] font-semibold italic tracking-wide
                      text-white/95
                      drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]
                      [text-shadow:_0_1px_3px_rgba(0,0,0,0.8),_0_0_8px_rgba(0,0,0,0.5)]
                      whitespace-nowrap
                      select-none
                    "
                  >
                    {t(archipelago.nameKey)}
                  </span>
                  
                  {/* Vietnam sovereignty badge for highlighted archipelagos */}
                  {archipelago.highlighted && (
                    <motion.div 
                      className="flex-shrink-0"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CountryFlag country="Vietnam" size={14} className="ring-1 ring-yellow-400" />
                    </motion.div>
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
