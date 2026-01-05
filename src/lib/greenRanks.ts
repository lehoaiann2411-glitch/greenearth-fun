import { Sprout, Leaf, TreePine, Trees, Mountain, LucideIcon } from 'lucide-react';

export interface GreenRank {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number | null;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

export const GREEN_RANKS: GreenRank[] = [
  {
    level: 1,
    name: 'Mầm Xanh',
    minPoints: 0,
    maxPoints: 499,
    icon: Sprout,
    colorClass: 'text-green-400',
    bgClass: 'bg-green-400/20',
  },
  {
    level: 2,
    name: 'Cây Non',
    minPoints: 500,
    maxPoints: 1499,
    icon: Leaf,
    colorClass: 'text-green-500',
    bgClass: 'bg-green-500/20',
  },
  {
    level: 3,
    name: 'Cây Xanh',
    minPoints: 1500,
    maxPoints: 3999,
    icon: TreePine,
    colorClass: 'text-green-600',
    bgClass: 'bg-green-600/20',
  },
  {
    level: 4,
    name: 'Rừng Xanh',
    minPoints: 4000,
    maxPoints: 9999,
    icon: Trees,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-600/20',
  },
  {
    level: 5,
    name: 'Đại Ngàn',
    minPoints: 10000,
    maxPoints: null,
    icon: Mountain,
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-600/20',
  },
];

export function getRankByPoints(points: number): GreenRank {
  for (let i = GREEN_RANKS.length - 1; i >= 0; i--) {
    if (points >= GREEN_RANKS[i].minPoints) {
      return GREEN_RANKS[i];
    }
  }
  return GREEN_RANKS[0];
}

export function getNextRank(currentRank: GreenRank): GreenRank | null {
  const nextLevel = currentRank.level + 1;
  return GREEN_RANKS.find((r) => r.level === nextLevel) || null;
}

export function getProgressToNextRank(points: number): number {
  const currentRank = getRankByPoints(points);
  const nextRank = getNextRank(currentRank);

  if (!nextRank) {
    return 100; // Already at max rank
  }

  const pointsInCurrentRank = points - currentRank.minPoints;
  const pointsNeededForNextRank = nextRank.minPoints - currentRank.minPoints;

  return Math.min(100, (pointsInCurrentRank / pointsNeededForNextRank) * 100);
}

export function getPointsToNextRank(points: number): number {
  const currentRank = getRankByPoints(points);
  const nextRank = getNextRank(currentRank);

  if (!nextRank) {
    return 0;
  }

  return nextRank.minPoints - points;
}
