import React from 'react';
import { Marker, Source, Layer } from 'react-map-gl/maplibre';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// Vietnam's island coordinates - Hoang Sa (Paracel) and Truong Sa (Spratly)
export const VIETNAM_ISLANDS = {
  hoangSa: {
    id: 'hoang-sa',
    nameKey: 'islands.hoangSa',
    center: [112.0, 16.5] as [number, number],
    boundaryColor: '#dc2626',
    islands: [
      { nameKey: 'islands.phuLam', coords: [112.33, 16.83] as [number, number] },
      { nameKey: 'islands.hoangSaIsland', coords: [112.03, 16.52] as [number, number] },
      { nameKey: 'islands.linhCon', coords: [112.73, 16.67] as [number, number] },
      { nameKey: 'islands.quangAnh', coords: [112.08, 16.47] as [number, number] },
      { nameKey: 'islands.duyMong', coords: [112.25, 16.47] as [number, number] },
      { nameKey: 'islands.triTon', coords: [111.75, 16.53] as [number, number] },
      { nameKey: 'islands.bomBay', coords: [112.52, 16.03] as [number, number] },
    ],
    boundary: [
      [111.5, 17.2],
      [113.0, 17.2],
      [113.0, 15.8],
      [111.5, 15.8],
      [111.5, 17.2]
    ] as [number, number][]
  },
  truongSa: {
    id: 'truong-sa',
    nameKey: 'islands.truongSa',
    center: [114.0, 9.5] as [number, number],
    boundaryColor: '#dc2626',
    islands: [
      { nameKey: 'islands.truongSaLon', coords: [113.82, 8.65] as [number, number] },
      { nameKey: 'islands.songTuTay', coords: [114.33, 11.43] as [number, number] },
      { nameKey: 'islands.sinhTon', coords: [114.33, 9.88] as [number, number] },
      { nameKey: 'islands.namYet', coords: [114.37, 10.18] as [number, number] },
      { nameKey: 'islands.sonCa', coords: [114.48, 10.37] as [number, number] },
      { nameKey: 'islands.truongSaDong', coords: [115.22, 8.92] as [number, number] },
      { nameKey: 'islands.anBang', coords: [112.92, 7.88] as [number, number] },
      { nameKey: 'islands.thuyenChai', coords: [113.98, 8.1] as [number, number] },
      { nameKey: 'islands.coLin', coords: [114.25, 9.75] as [number, number] },
      { nameKey: 'islands.lenDao', coords: [114.37, 9.78] as [number, number] },
    ],
    boundary: [
      [112.5, 12.0],
      [116.0, 12.0],
      [116.0, 7.0],
      [112.5, 7.0],
      [112.5, 12.0]
    ] as [number, number][]
  }
};

interface VietnamIslandsLayerProps {
  onIslandClick?: (archipelago: 'hoangSa' | 'truongSa', islandKey: string) => void;
  selectedIsland?: string | null;
}

export function VietnamIslandsLayer({ onIslandClick, selectedIsland }: VietnamIslandsLayerProps) {
  const { t } = useTranslation();

  // GeoJSON for boundaries
  const boundaryGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { id: 'hoang-sa', name: t('islands.hoangSa') },
        geometry: {
          type: 'Polygon',
          coordinates: [VIETNAM_ISLANDS.hoangSa.boundary]
        }
      },
      {
        type: 'Feature',
        properties: { id: 'truong-sa', name: t('islands.truongSa') },
        geometry: {
          type: 'Polygon',
          coordinates: [VIETNAM_ISLANDS.truongSa.boundary]
        }
      }
    ]
  };

  return (
    <>
      {/* Boundary Layer - Dashed line */}
      <Source id="vietnam-islands-boundary" type="geojson" data={boundaryGeoJSON}>
        <Layer
          id="vietnam-islands-boundary-fill"
          type="fill"
          paint={{
            'fill-color': '#dc2626',
            'fill-opacity': 0.05
          }}
        />
        <Layer
          id="vietnam-islands-boundary-line"
          type="line"
          paint={{
            'line-color': '#dc2626',
            'line-width': 2,
            'line-dasharray': [4, 2]
          }}
        />
      </Source>

      {/* Hoang Sa Islands Markers */}
      {VIETNAM_ISLANDS.hoangSa.islands.map((island, index) => (
        <Marker
          key={`hoangsa-${index}`}
          longitude={island.coords[0]}
          latitude={island.coords[1]}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onIslandClick?.('hoangSa', island.nameKey);
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.3 }}
            className="relative cursor-pointer"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/40 blur-md"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
            />
            {/* Island marker - circle with dot */}
            <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            </div>
          </motion.div>
        </Marker>
      ))}

      {/* Truong Sa Islands Markers */}
      {VIETNAM_ISLANDS.truongSa.islands.map((island, index) => (
        <Marker
          key={`truongsa-${index}`}
          longitude={island.coords[0]}
          latitude={island.coords[1]}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onIslandClick?.('truongSa', island.nameKey);
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.05, type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.3 }}
            className="relative cursor-pointer"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/40 blur-md"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
            />
            {/* Island marker - circle with dot */}
            <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            </div>
          </motion.div>
        </Marker>
      ))}

      {/* Archipelago Labels */}
      <Marker
        longitude={VIETNAM_ISLANDS.hoangSa.center[0]}
        latitude={VIETNAM_ISLANDS.hoangSa.center[1] + 0.5}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold rounded-full shadow-lg border-2 border-white/50 whitespace-nowrap flex items-center gap-1.5"
        >
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          {t('islands.hoangSa')}
        </motion.div>
      </Marker>

      <Marker
        longitude={VIETNAM_ISLANDS.truongSa.center[0]}
        latitude={VIETNAM_ISLANDS.truongSa.center[1] + 1.5}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold rounded-full shadow-lg border-2 border-white/50 whitespace-nowrap flex items-center gap-1.5"
        >
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          {t('islands.truongSa')}
        </motion.div>
      </Marker>
    </>
  );
}
