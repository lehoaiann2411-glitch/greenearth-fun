import { Coins, TrendingUp } from 'lucide-react';
import { toCamlyCoin } from '@/lib/camlyCoin';
import { CoinAnimation } from './CoinAnimation';

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
    sm: 14,
    md: 18,
    lg: 24,
  };

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 ${textSizes[size]} ${className}`}>
        <Coins size={iconSizes[size]} className="text-green-500" />
        <span className="font-semibold text-green-600">{greenPoints.toLocaleString()}</span>
        {showCamly && (
          <span className="text-muted-foreground">≈ {camly.toLocaleString()} CAMLY</span>
        )}
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <CoinAnimation size={size} animated={false} />
          <div>
            <p className="text-sm text-muted-foreground">Green Points</p>
            <p className={`font-bold text-green-600 dark:text-green-400 ${textSizes[size]}`}>
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
        <Coins size={iconSizes[size]} className="text-green-500" />
        <span className={`font-bold text-green-600 dark:text-green-400 ${textSizes[size]}`}>
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
