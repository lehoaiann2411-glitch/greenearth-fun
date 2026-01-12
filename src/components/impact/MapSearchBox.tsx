import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, MapPin, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface MapSearchBoxProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void;
  className?: string;
  placeholder?: string;
}

const RECENT_SEARCHES_KEY = 'map_recent_searches';
const MAX_RECENT = 5;

export function MapSearchBox({ onLocationSelect, className, placeholder }: MapSearchBoxProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<{ name: string; lat: number; lon: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing recent searches', e);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((name: string, lat: number, lon: number) => {
    const newSearch = { name, lat, lon };
    const updated = [newSearch, ...recentSearches.filter(s => s.name !== name)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  // Search with Nominatim API
  const searchLocation = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=vn&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'vi,en',
          }
        }
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      searchLocation(value);
    }, 300);
  }, [searchLocation]);

  // Handle selection
  const handleSelect = useCallback((lat: number, lon: number, name: string) => {
    saveRecentSearch(name, lat, lon);
    onLocationSelect(lat, lon, name);
    setQuery(name);
    setShowDropdown(false);
    setResults([]);
  }, [onLocationSelect, saveRecentSearch]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  }, []);

  const hasResults = results.length > 0;
  const hasRecent = recentSearches.length > 0 && !query;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder || t('impact.map.search.placeholder', 'Tìm địa điểm...')}
          className="pl-9 pr-8 h-9 bg-background/95 backdrop-blur rounded-xl border-2 border-transparent focus:border-primary/30"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (hasResults || hasRecent) && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto"
        >
          {/* Recent searches */}
          {hasRecent && (
            <div className="p-2">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t('impact.map.search.recent', 'Tìm kiếm gần đây')}
              </p>
              {recentSearches.map((item, index) => (
                <button
                  key={index}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md flex items-center gap-2 transition-colors"
                  onClick={() => handleSelect(item.lat, item.lon, item.name)}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search results */}
          {hasResults && (
            <div className="p-2 border-t">
              {results.map((result, index) => (
                <button
                  key={index}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md flex items-start gap-2 transition-colors"
                  onClick={() => handleSelect(
                    parseFloat(result.lat), 
                    parseFloat(result.lon), 
                    result.display_name
                  )}
                >
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query && !isLoading && results.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('common.noResults', 'Không tìm thấy kết quả')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
