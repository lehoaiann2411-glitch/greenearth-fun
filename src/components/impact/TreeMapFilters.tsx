import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Region, ForestType, TreeMapFilters as Filters } from '@/hooks/useTreeMapData';
import { MapPin, TreeDeciduous } from 'lucide-react';

interface TreeMapFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  variant?: 'select' | 'toggle';
}

export function TreeMapFilters({ filters, onFiltersChange, variant = 'select' }: TreeMapFiltersProps) {
  const { t } = useTranslation();

  const regions: { value: Region | 'all'; label: string }[] = [
    { value: 'all', label: t('impact.map.allRegions') },
    { value: 'north', label: t('impact.map.north') },
    { value: 'central', label: t('impact.map.central') },
    { value: 'south', label: t('impact.map.south') },
  ];

  const forestTypes: { value: ForestType | 'all'; label: string }[] = [
    { value: 'all', label: t('impact.map.allTypes') },
    { value: 'mangrove', label: t('impact.map.mangrove') },
    { value: 'pine', label: t('impact.map.pine') },
    { value: 'tropical', label: t('impact.map.tropical') },
  ];

  const handleRegionChange = (value: string) => {
    onFiltersChange({
      ...filters,
      region: value === 'all' ? null : (value as Region),
    });
  };

  const handleForestTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      forestType: value === 'all' ? null : (value as ForestType),
    });
  };

  if (variant === 'toggle') {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <ToggleGroup
            type="single"
            value={filters.region || 'all'}
            onValueChange={handleRegionChange}
            className="justify-start"
          >
            {regions.map((region) => (
              <ToggleGroupItem
                key={region.value}
                value={region.value}
                aria-label={region.label}
                className="text-xs px-2.5"
              >
                {region.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex items-center gap-2">
          <TreeDeciduous className="h-4 w-4 text-muted-foreground" />
          <ToggleGroup
            type="single"
            value={filters.forestType || 'all'}
            onValueChange={handleForestTypeChange}
            className="justify-start"
          >
            {forestTypes.map((type) => (
              <ToggleGroupItem
                key={type.value}
                value={type.value}
                aria-label={type.label}
                className="text-xs px-2.5"
              >
                {type.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={filters.region || 'all'} onValueChange={handleRegionChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder={t('impact.map.region')} />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <TreeDeciduous className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={filters.forestType || 'all'} onValueChange={handleForestTypeChange}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder={t('impact.map.forestType')} />
          </SelectTrigger>
          <SelectContent>
            {forestTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
