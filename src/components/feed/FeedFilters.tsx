import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe, Users, TrendingUp, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FeedFilter = 'all' | 'following' | 'popular' | 'campaigns';

interface FeedFiltersProps {
  activeFilter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
}

export function FeedFilters({ activeFilter, onFilterChange }: FeedFiltersProps) {
  const { t } = useTranslation();
  
  const filters: { id: FeedFilter; labelKey: string; icon: React.ReactNode }[] = [
    { id: 'all', labelKey: 'feed.forYou', icon: <Globe className="w-4 h-4" /> },
    { id: 'following', labelKey: 'feed.following', icon: <Users className="w-4 h-4" /> },
    { id: 'popular', labelKey: 'feed.popular', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'campaigns', labelKey: 'feed.campaigns', icon: <TreePine className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide bg-white/95 dark:bg-gray-900/95 rounded-lg p-2 shadow-md border border-white/50 dark:border-gray-700">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? 'default' : 'outline'}
          size="sm"
          className={`relative whitespace-nowrap font-medium ${
            activeFilter === filter.id 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
          }`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.icon}
          <span className="ml-2">{t(filter.labelKey)}</span>
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
