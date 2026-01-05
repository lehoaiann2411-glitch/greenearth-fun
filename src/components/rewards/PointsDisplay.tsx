import { TrendingUp } from 'lucide-react';
import { toCamlyCoin } from '@/lib/camlyCoin';
import { CamlyCoinIcon } from './CamlyCoinIcon';

interface PointsDisplayProps {
  greenPoints: number;
  showCamly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'inline';
  className?: string;
}

export function PointsDisplay({
  greenPoints,
  showCamly = true,
  size = 'md',
  variant = 'default',
  className = '',
}: PointsDisplayProps) {
  const camly = toCamlyCoin(greenPoints);

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const iconSizes = {
    sm: 'xs' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  };

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 ${textSizes[size]} ${className}`}>
        <CamlyCoinIcon size={iconSizes[size]} />
        <span className="font-semibold text-yellow-600 dark:text-yellow-400">{greenPoints.toLocaleString()}</span>
        {showCamly && (
          <span className="text-muted-foreground">≈ {camly.toLocaleString()} CAMLY</span>
        )}
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950/50 dark:to-amber-900/50 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 ${className}`}>
        <div className="flex items-center gap-3">
          <CamlyCoinIcon size={size === 'lg' ? 'lg' : 'md'} animated />
          <div>
            <p className="text-sm text-muted-foreground">Green Points</p>
            <p className={`font-bold text-yellow-600 dark:text-yellow-400 ${textSizes[size]}`}>
              {greenPoints.toLocaleString()}
            </p>
            {showCamly && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp size={12} />
                ≈ {camly.toLocaleString()} CAMLY
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2">
        <CamlyCoinIcon size={iconSizes[size]} />
        <span className={`font-bold text-yellow-600 dark:text-yellow-400 ${textSizes[size]}`}>
          {greenPoints.toLocaleString()} GP
        </span>
      </div>
      {showCamly && (
        <span className="text-xs text-muted-foreground ml-6">
          ≈ {camly.toLocaleString()} CAMLY
        </span>
      )}
    </div>
  );
}
