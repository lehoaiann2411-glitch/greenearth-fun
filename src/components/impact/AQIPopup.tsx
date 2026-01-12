import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MapPin, Clock, ExternalLink } from 'lucide-react';
import { getAQIInfo } from './AQIStationMarker';

interface AQIStationData {
  uid: number;
  aqi: number;
  lat: number;
  lon: number;
  station: {
    name: string;
    time?: string;
  };
  iaqi?: {
    pm25?: { v: number };
    pm10?: { v: number };
    o3?: { v: number };
    no2?: { v: number };
    co?: { v: number };
    so2?: { v: number };
  };
}

interface AQIPopupProps {
  station: AQIStationData;
}

// Get recommendation based on AQI
function getRecommendation(aqi: number, isVi: boolean) {
  if (aqi <= 50) return isVi ? 'Chất lượng không khí tốt, phù hợp mọi hoạt động ngoài trời' : 'Good air quality, suitable for all outdoor activities';
  if (aqi <= 100) return isVi ? 'Chất lượng không khí chấp nhận được' : 'Acceptable air quality';
  if (aqi <= 150) return isVi ? 'Nhóm nhạy cảm nên hạn chế hoạt động ngoài trời' : 'Sensitive groups should limit outdoor activities';
  if (aqi <= 200) return isVi ? 'Mọi người nên hạn chế hoạt động ngoài trời' : 'Everyone should limit outdoor activities';
  if (aqi <= 300) return isVi ? 'Cảnh báo sức khỏe! Tránh hoạt động ngoài trời' : 'Health warning! Avoid outdoor activities';
  return isVi ? 'Nguy hiểm! Ở trong nhà và đóng cửa sổ' : 'Hazardous! Stay indoors with windows closed';
}

// Get pollutant level indicator
function getPollutantLevel(value: number | undefined, good: number, moderate: number) {
  if (!value) return { color: 'text-muted-foreground', emoji: '○' };
  if (value <= good) return { color: 'text-green-500', emoji: '🟢' };
  if (value <= moderate) return { color: 'text-yellow-500', emoji: '🟡' };
  return { color: 'text-red-500', emoji: '🔴' };
}

export function AQIPopup({ station }: AQIPopupProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  
  const info = getAQIInfo(station.aqi);
  const recommendation = getRecommendation(station.aqi, isVi);

  const pollutants = [
    { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', value: station.iaqi?.pm25?.v, good: 35, moderate: 75 },
    { key: 'pm10', label: 'PM10', unit: 'µg/m³', value: station.iaqi?.pm10?.v, good: 50, moderate: 150 },
    { key: 'o3', label: 'O₃', unit: 'ppb', value: station.iaqi?.o3?.v, good: 55, moderate: 70 },
    { key: 'no2', label: 'NO₂', unit: 'ppb', value: station.iaqi?.no2?.v, good: 53, moderate: 100 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 min-w-[280px] max-w-[320px]"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <motion.div
          className="text-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          💨
        </motion.div>
        <div className="flex-1">
          <h3 className="font-bold text-sm leading-tight mb-1">
            {isVi ? 'Trạm Đo Chất Lượng Không Khí' : 'Air Quality Station'}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{station.station.name}</span>
          </div>
        </div>
      </div>

      {/* Main AQI Display */}
      <div className="flex items-center justify-center mb-4">
        <motion.div
          className={cn(
            'relative w-20 h-20 rounded-full flex flex-col items-center justify-center text-center',
            'shadow-lg border-4 border-white/50'
          )}
          style={{ backgroundColor: info.color }}
          animate={{ boxShadow: [`0 0 20px ${info.color}50`, `0 0 40px ${info.color}70`, `0 0 20px ${info.color}50`] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-3xl mb-0.5">{info.emoji}</span>
          <span className={cn('text-xl font-bold', info.textColor)}>{station.aqi}</span>
        </motion.div>
        <div className="ml-4">
          <div className={cn('text-lg font-bold', info.textColor === 'text-white' ? 'text-foreground' : info.textColor)}>
            {isVi 
              ? (station.aqi <= 50 ? 'TỐT' : station.aqi <= 100 ? 'TRUNG BÌNH' : station.aqi <= 150 ? 'KÉM' : station.aqi <= 200 ? 'XẤU' : station.aqi <= 300 ? 'RẤT XẤU' : 'NGUY HẠI')
              : info.level.toUpperCase()
            }
          </div>
          <div className="text-xs text-muted-foreground">AQI Index</div>
        </div>
      </div>

      {/* Pollutants Detail */}
      {station.iaqi && Object.keys(station.iaqi).length > 0 && (
        <div className="bg-muted/30 rounded-xl p-3 mb-3">
          <div className="text-xs font-medium mb-2">
            {isVi ? '📊 Chi tiết:' : '📊 Details:'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {pollutants.map((p) => {
              if (p.value === undefined) return null;
              const level = getPollutantLevel(p.value, p.good, p.moderate);
              return (
                <div key={p.key} className="flex items-center gap-1.5 text-xs">
                  <span>{level.emoji}</span>
                  <span className="text-muted-foreground">{p.label}:</span>
                  <span className={cn('font-medium', level.color)}>{p.value} {p.unit}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-3 mb-3 border border-amber-200/50">
        <div className="flex items-start gap-2">
          <span>⚠️</span>
          <div>
            <div className="text-xs font-medium mb-0.5">
              {isVi ? 'Khuyến nghị:' : 'Recommendation:'}
            </div>
            <div className="text-xs text-muted-foreground">
              {recommendation}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        {station.station.time && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{station.station.time}</span>
          </div>
        )}
        <a
          href={`https://aqicn.org/city/${encodeURIComponent(station.station.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <span>{isVi ? 'Xem thêm' : 'More info'}</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </motion.div>
  );
}
