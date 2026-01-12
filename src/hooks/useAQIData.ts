import { useQuery } from '@tanstack/react-query';

export interface AQIStation {
  uid: number;
  aqi: number | string;
  lat: number;
  lon: number;
  station: {
    name: string;
    time?: string;
  };
}

export interface AQIStationDetail {
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
    t?: { v: number }; // temperature
    h?: { v: number }; // humidity
    w?: { v: number }; // wind
  };
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const WAQI_TOKEN = import.meta.env.VITE_WAQI_TOKEN || 'demo';

// Fetch AQI stations within map bounds
export function useAQIStations(bounds?: MapBounds, enabled = true) {
  return useQuery({
    queryKey: ['aqi-stations', bounds],
    queryFn: async (): Promise<AQIStation[]> => {
      if (!bounds) return [];
      
      const { south, west, north, east } = bounds;
      const url = `https://api.waqi.info/v2/map/bounds?latlng=${south},${west},${north},${east}&networks=all&token=${WAQI_TOKEN}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch AQI data');
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(data.data || 'AQI API error');
      }
      
      // Filter out stations with invalid AQI
      return (data.data || []).filter((station: AQIStation) => {
        const aqi = typeof station.aqi === 'string' ? parseInt(station.aqi) : station.aqi;
        return !isNaN(aqi) && aqi >= 0;
      }).map((station: AQIStation) => ({
        ...station,
        aqi: typeof station.aqi === 'string' ? parseInt(station.aqi) : station.aqi
      }));
    },
    enabled: enabled && !!bounds && !!WAQI_TOKEN,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    staleTime: 5 * 60 * 1000, // Consider stale after 5 minutes
    retry: 2
  });
}

// Fetch detailed AQI data for a specific station
export function useAQIStationDetail(stationId?: number, enabled = true) {
  return useQuery({
    queryKey: ['aqi-station-detail', stationId],
    queryFn: async (): Promise<AQIStationDetail | null> => {
      if (!stationId) return null;
      
      const url = `https://api.waqi.info/feed/@${stationId}/?token=${WAQI_TOKEN}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch station detail');
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(data.data || 'Station API error');
      }
      
      const station = data.data;
      return {
        uid: station.idx,
        aqi: station.aqi,
        lat: station.city.geo[0],
        lon: station.city.geo[1],
        station: {
          name: station.city.name,
          time: station.time?.s
        },
        iaqi: station.iaqi
      };
    },
    enabled: enabled && !!stationId && !!WAQI_TOKEN,
    staleTime: 5 * 60 * 1000
  });
}

// Get AQI for a specific location by coordinates
export function useAQIByLocation(lat?: number, lon?: number, enabled = true) {
  return useQuery({
    queryKey: ['aqi-location', lat, lon],
    queryFn: async () => {
      if (!lat || !lon) return null;
      
      const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch AQI');
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        return null;
      }
      
      return {
        aqi: data.data.aqi,
        station: data.data.city?.name || 'Unknown',
        time: data.data.time?.s,
        iaqi: data.data.iaqi
      };
    },
    enabled: enabled && !!lat && !!lon && !!WAQI_TOKEN,
    staleTime: 5 * 60 * 1000
  });
}
