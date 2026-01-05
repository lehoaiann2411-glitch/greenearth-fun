import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { GROUP_CATEGORIES, VIETNAM_LOCATIONS } from '@/hooks/useGroups';
import { useState } from 'react';

interface GroupFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
}

export function GroupFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  location,
  onLocationChange,
}: GroupFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = category !== 'all' || location !== '';

  const clearFilters = () => {
    onCategoryChange('all');
    onLocationChange('');
    onSearchChange('');
  };

  return (
    <div className="space-y-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl p-4 shadow-md border border-white/50 dark:border-gray-700">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm nhóm..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
          />
        </div>
        <Button
          variant={showFilters ? 'secondary' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="flex-shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Lọc
          {hasActiveFilters && (
            <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              {GROUP_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {'emoji' in cat && <span className="mr-2">{cat.emoji}</span>}
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={location} onValueChange={onLocationChange}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
              <SelectValue placeholder="Địa điểm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả địa điểm</SelectItem>
              {VIETNAM_LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  📍 {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      )}

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {GROUP_CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={category === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(cat.value)}
            className={`flex-shrink-0 shadow-md font-medium ${
              category === cat.value
                ? 'bg-gradient-to-r from-primary to-accent text-white'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200'
            }`}
          >
            {'emoji' in cat && <span className="mr-1">{cat.emoji}</span>}
            {cat.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
