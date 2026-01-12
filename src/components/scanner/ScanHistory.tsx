import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWasteScanHistory, WasteScan } from '@/hooks/useWasteScanner';
import { BinColorBadge } from './BinColorGuide';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export function ScanHistory() {
  const { t, i18n } = useTranslation();
  const { data: scans, isLoading } = useWasteScanHistory();
  const isVietnamese = i18n.language === 'vi';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5" />
            {t('scanner.history', 'Scan History')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5" />
            {t('scanner.history', 'Scan History')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('scanner.noHistory', 'No scans yet. Start scanning waste items!')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5" />
          {t('scanner.history', 'Scan History')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scans.map((scan) => (
          <ScanHistoryItem key={scan.id} scan={scan} isVietnamese={isVietnamese} />
        ))}
      </CardContent>
    </Card>
  );
}

function ScanHistoryItem({ scan, isVietnamese }: { scan: WasteScan; isVietnamese: boolean }) {
  const wasteType = isVietnamese ? scan.waste_type_vi || scan.waste_type : scan.waste_type;
  const timeAgo = formatDistanceToNow(new Date(scan.scanned_at), {
    addSuffix: true,
    locale: isVietnamese ? vi : enUS,
  });

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      {scan.image_url ? (
        <img
          src={scan.image_url}
          alt={wasteType}
          className="w-12 h-12 rounded object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
          {scan.recyclable ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 text-gray-400" />
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{wasteType}</p>
        <div className="flex items-center gap-2 mt-1">
          <BinColorBadge binColor={scan.bin_color as any} showLabel={false} />
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </div>
      {scan.points_earned && scan.points_earned > 0 && (
        <div className="flex items-center gap-1 text-amber-600">
          <CamlyCoinIcon size="sm" />
          <span className="text-sm font-medium">+{scan.points_earned}</span>
        </div>
      )}
    </div>
  );
}
