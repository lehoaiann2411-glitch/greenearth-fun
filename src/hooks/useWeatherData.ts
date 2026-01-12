import { useQuery } from '@tanstack/react-query';

export interface WeatherData {
  temp: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  clouds: number;
  feelsLike: number;
}

const OWM_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

// Get current weather for a location
export function useWeatherData(lat?: number, lon?: number, enabled = true) {
  return useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: async (): Promise<WeatherData | null> => {
      if (!lat || !lon || !OWM_API_KEY) return null;
      
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=vi`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch weather');
      
      const data = await response.json();
      
      return {
        temp: Math.round(data.main.temp),
        humidity: data.main.humidity,
        description: data.weather[0]?.description || '',
        icon: data.weather[0]?.icon || '01d',
        windSpeed: Math.round(data.wind?.speed * 3.6), // Convert m/s to km/h
        clouds: data.clouds?.all || 0,
        feelsLike: Math.round(data.main.feels_like)
      };
    },
    enabled: enabled && !!lat && !!lon && !!OWM_API_KEY,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000 // Refetch every 15 minutes
  });
}

// Weather tile layer URLs for OpenWeatherMap
export const WEATHER_TILE_LAYERS = {
  clouds: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
  precipitation: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
  temp: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
  wind: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`
};

// Check if weather API is available
export function useWeatherAPIStatus() {
  return useQuery({
    queryKey: ['weather-api-status'],
    queryFn: async () => {
      if (!OWM_API_KEY) return { available: false, reason: 'no-api-key' };
      
      try {
        // Test with Hanoi coordinates
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=21.0285&lon=105.8542&appid=${OWM_API_KEY}`;
        const response = await fetch(url);
        
        if (response.status === 401) {
          return { available: false, reason: 'invalid-api-key' };
        }
        
        if (!response.ok) {
          return { available: false, reason: 'api-error' };
        }
        
        return { available: true, reason: null };
      } catch {
        return { available: false, reason: 'network-error' };
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: false
  });
}
