import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Recycle, Leaf, Lightbulb, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { WasteAnalysisResult } from '@/hooks/useWasteScanner';
import { BinColorBadge } from './BinColorGuide';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';

interface ScanResultProps {
  result: WasteAnalysisResult;
  imagePreview?: string;
  camlyEarned?: number;
  onScanAgain: () => void;
}

export function ScanResult({ result, imagePreview, camlyEarned = 50, onScanAgain }: ScanResultProps) {
  const { t, i18n } = useTranslation();
  const isVietnamese = i18n.language === 'vi';

  const wasteType = isVietnamese ? result.waste_type_vi : result.waste_type;
  const material = isVietnamese ? result.material_vi : result.material;
  const instructions = isVietnamese ? result.disposal_instructions_vi : result.disposal_instructions;
  const reuseSuggestions = isVietnamese ? result.reuse_suggestions_vi : result.reuse_suggestions;
  const ecoNote = isVietnamese ? result.environmental_note_vi : result.environmental_note;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Result Header */}
      <Card className="overflow-hidden">
        <div className="flex">
          {imagePreview && (
            <div className="w-32 h-32 flex-shrink-0">
              <img
                src={`data:image/jpeg;base64,${imagePreview}`}
                alt="Scanned waste"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardContent className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold">{wasteType}</h3>
              {result.recyclable ? (
                <Badge className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t('scanner.recyclable', 'Recyclable')}
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  {t('scanner.notRecyclable', 'Not Recyclable')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {t('scanner.material', 'Material')}: {material}
            </p>
            <BinColorBadge binColor={result.bin_color} />
          </CardContent>
        </div>
      </Card>

      {/* Camly Earned */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex items-center justify-center gap-3">
            <CamlyCoinIcon size="lg" />
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              +{camlyEarned} Camly
            </span>
            <span className="text-muted-foreground">
              {t('scanner.earned', 'earned!')}
            </span>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disposal Instructions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Recycle className="w-5 h-5 text-green-600" />
            {t('scanner.instructions', 'Disposal Instructions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{instructions}</p>
        </CardContent>
      </Card>

      {/* Reuse Suggestions */}
      {reuseSuggestions && reuseSuggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              {t('scanner.reuseTips', 'Reuse Ideas')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {reuseSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Environmental Note */}
      <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
        <CardContent className="p-4 flex items-start gap-3">
          <Leaf className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-300">{ecoNote}</p>
        </CardContent>
      </Card>

      {/* Confidence */}
      {result.confidence < 0.7 && (
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {t('scanner.lowConfidence', 'The AI is not very confident about this result. Please verify before disposal.')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Scan Again Button */}
      <Button onClick={onScanAgain} size="lg" className="w-full gap-2">
        <RefreshCw className="w-5 h-5" />
        {t('scanner.scanAgain', 'Scan Another Item')}
      </Button>
    </motion.div>
  );
}
