import { useGroups } from '@/hooks/useGroups';
import { GroupCard } from './GroupCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

export function FeaturedGroups() {
  const { data: groups, isLoading } = useGroups({ featured: true });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">Nhóm nổi bật</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!groups || groups.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
        <h2 className="text-lg font-semibold">Nhóm nổi bật</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.slice(0, 6).map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
