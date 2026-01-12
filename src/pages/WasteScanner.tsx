import { useState, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, Loader2, Scan } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalyzeWaste, WasteAnalysisResult } from '@/hooks/useWasteScanner';
import { CameraCapture } from '@/components/scanner/CameraCapture';
import { ImageUpload } from '@/components/scanner/ImageUpload';
import { ScanResult } from '@/components/scanner/ScanResult';
import { BinColorGuide } from '@/components/scanner/BinColorGuide';
import { ScanHistory } from '@/components/scanner/ScanHistory';
import { useToast } from '@/hooks/use-toast';

type ScannerState = 'idle' | 'camera' | 'analyzing' | 'result';

export default function WasteScanner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { analyzeWaste, saveScanResult, isAnalyzing } = useAnalyzeWaste();

  const [state, setState] = useState<ScannerState>('idle');
  const [result, setResult] = useState<WasteAnalysisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageCapture = useCallback(
    async (imageBase64: string) => {
      setImagePreview(imageBase64);
      setState('analyzing');

      try {
        const analysisResult = await analyzeWaste(imageBase64);
        setResult(analysisResult);
        setState('result');

        // Save to database if user is logged in
        if (user) {
          await saveScanResult(analysisResult);
        }
      } catch (error) {
        console.error('Analysis error:', error);
        toast({
          title: t('scanner.error', 'Analysis Failed'),
          description: error instanceof Error ? error.message : t('scanner.errorDesc', 'Could not analyze the image. Please try again.'),
          variant: 'destructive',
        });
        setState('idle');
        setImagePreview(null);
      }
    },
    [analyzeWaste, saveScanResult, user, toast, t]
  );

  const handleReset = useCallback(() => {
    setState('idle');
    setResult(null);
    setImagePreview(null);
  }, []);

  const openCamera = useCallback(() => {
    setState('camera');
  }, []);

  const closeCamera = useCallback(() => {
    setState('idle');
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mb-4">
              <Scan className="w-4 h-4" />
              <span className="text-sm font-medium">{t('scanner.aiPowered', 'AI-Powered')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t('scanner.title', 'Waste Scanner')}
            </h1>
            <p className="text-muted-foreground">
              {t('scanner.subtitle', 'Scan any waste item to learn how to properly recycle it')}
            </p>
          </div>

          {/* Main Content */}
          {state === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Scan Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t('scanner.scanTitle', 'Scan Your Waste')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    {t('scanner.scanDesc', 'Take a photo or upload an image of any waste item and our AI will identify it and provide recycling instructions.')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={openCamera} size="lg" className="gap-2">
                      <Camera className="w-5 h-5" />
                      {t('scanner.capture', 'Take Photo')}
                    </Button>
                    <ImageUpload onImageSelect={handleImageCapture} />
                  </div>
                </CardContent>
              </Card>

              {/* Bin Color Guide */}
              <BinColorGuide />

              {/* Scan History */}
              {user && <ScanHistory />}
            </motion.div>
          )}

          {state === 'camera' && (
            <CameraCapture onCapture={handleImageCapture} onClose={closeCamera} />
          )}

          {state === 'analyzing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Card>
                <CardContent className="p-8">
                  {imagePreview && (
                    <div className="w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden">
                      <img
                        src={`data:image/jpeg;base64,${imagePreview}`}
                        alt="Analyzing"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-green-600 animate-spin" />
                  <h3 className="text-lg font-semibold mb-2">
                    {t('scanner.analyzing', 'Analyzing...')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('scanner.analyzingDesc', 'Our AI is identifying the waste item')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {state === 'result' && result && (
            <ScanResult
              result={result}
              imagePreview={imagePreview || undefined}
              onScanAgain={handleReset}
            />
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
