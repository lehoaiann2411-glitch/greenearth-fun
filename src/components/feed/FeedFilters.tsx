import { motion } from 'framer-motion';
import { Globe, Users, TrendingUp, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FeedFilter = 'all' | 'following' | 'popular' | 'campaigns';

interface FeedFiltersProps {
  activeFilter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
}

const filters: { id: FeedFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'For You', icon: <Globe className="w-4 h-4" /> },
  { id: 'following', label: 'Following', icon: <Users className="w-4 h-4" /> },
  { id: 'popular', label: 'Popular', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'campaigns', label: 'Campaigns', icon: <TreePine className="w-4 h-4" /> },
];

export function FeedFilters({ activeFilter, onFilterChange }: FeedFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? 'default' : 'outline'}
          size="sm"
          className={`relative whitespace-nowrap ${
            activeFilter === filter.id 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background hover:bg-muted'
          }`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.icon}
          <span className="ml-2">{filter.label}</span>
          {activeFilter === filter.id && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 bg-primary rounded-md -z-10"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </Button>
      ))}
    </div>
  );
}
