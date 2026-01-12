import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recycle, Leaf, Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type BinColor = 'yellow' | 'blue' | 'black' | 'red';

interface BinInfo {
  color: BinColor;
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: React.ReactNode;
  labelKey: string;
  descriptionKey: string;
  examples: string[];
}

const binInfoMap: Record<BinColor, BinInfo> = {
  yellow: {
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-700 dark:text-yellow-400',
    borderClass: 'border-yellow-300 dark:border-yellow-700',
    icon: <Recycle className="w-5 h-5" />,
    labelKey: 'scanner.bins.yellow',
    descriptionKey: 'scanner.bins.yellowDesc',
    examples: ['Chai nhựa', 'Giấy', 'Lon nhôm', 'Thủy tinh'],
  },
  blue: {
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-300 dark:border-blue-700',
    icon: <Leaf className="w-5 h-5" />,
    labelKey: 'scanner.bins.blue',
    descriptionKey: 'scanner.bins.blueDesc',
    examples: ['Thức ăn thừa', 'Vỏ trái cây', 'Lá cây', 'Hoa héo'],
  },
  black: {
    color: 'black',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-700 dark:text-gray-300',
    borderClass: 'border-gray-300 dark:border-gray-600',
    icon: <Trash2 className="w-5 h-5" />,
    labelKey: 'scanner.bins.black',
    descriptionKey: 'scanner.bins.blackDesc',
    examples: ['Xốp', 'Túi nilon bẩn', 'Tã lót', 'Gốm sứ vỡ'],
  },
  red: {
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-300 dark:border-red-700',
    icon: <AlertTriangle className="w-5 h-5" />,
    labelKey: 'scanner.bins.red',
    descriptionKey: 'scanner.bins.redDesc',
    examples: ['Pin', 'Bóng đèn', 'Thuốc hết hạn', 'Hóa chất'],
  },
};

interface BinColorBadgeProps {
  binColor: BinColor;
  showLabel?: boolean;
}

export function BinColorBadge({ binColor, showLabel = true }: BinColorBadgeProps) {
  const { t } = useTranslation();
  const info = binInfoMap[binColor];

  return (
    <Badge
      className={cn(
        'gap-1.5 px-3 py-1',
        info.bgClass,
        info.textClass,
        'border',
        info.borderClass
      )}
    >
      {info.icon}
      {showLabel && t(info.labelKey, info.labelKey)}
    </Badge>
  );
}

export function BinColorGuide() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Recycle className="w-5 h-5 text-green-600" />
          {t('scanner.binGuide', 'Vietnam Bin Color Guide')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.values(binInfoMap).map((bin) => (
          <div
            key={bin.color}
            className={cn(
              'p-3 rounded-lg border',
              bin.bgClass,
              bin.borderClass
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={bin.textClass}>{bin.icon}</span>
              <span className={cn('font-medium', bin.textClass)}>
                {t(bin.labelKey)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {t(bin.descriptionKey, bin.examples.join(', '))}
            </p>
            <div className="flex flex-wrap gap-1">
              {bin.examples.map((example, i) => (
                <span
                  key={i}
                  className="text-xs bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
