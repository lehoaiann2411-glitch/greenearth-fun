import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Recycle, Leaf, MessageCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function WasteScanner() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{t('scanner.comingSoon', 'Coming Soon')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t('scanner.title', 'Waste Scanner')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('scanner.description', 'Scan any waste item with AI to learn how to properly recycle, compost, or dispose of it. Coming soon!')}
            </p>
          </div>

          {/* Preview Card */}
          <Card className="mb-8 overflow-hidden border-dashed border-2 border-green-300 dark:border-green-700">
            <CardContent className="p-12 text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                <Camera className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('scanner.previewTitle', 'AI-Powered Waste Recognition')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t('scanner.previewDescription', 'Take a photo or upload an image of any waste item and our AI will identify it and provide recycling instructions.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button disabled size="lg" className="gap-2">
                  <Camera className="w-5 h-5" />
                  {t('scanner.capture', 'Take Photo')}
                </Button>
                <Button disabled variant="outline" size="lg" className="gap-2">
                  <Upload className="w-5 h-5" />
                  {t('scanner.upload', 'Upload Image')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">{t('scanner.feature1Title', 'Instant Recognition')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('scanner.feature1Desc', 'AI identifies waste items in seconds from your camera or photos')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Recycle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">{t('scanner.feature2Title', 'Recycling Guide')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('scanner.feature2Desc', 'Get specific instructions for Vietnam recycling bins and centers')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg">{t('scanner.feature3Title', 'Earn Camly')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('scanner.feature3Desc', 'Get rewarded for scanning and properly disposing of waste')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA to Chatbot */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-semibold text-lg mb-1">
                  {t('scanner.chatbotCta', 'Need help with recycling now?')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('scanner.chatbotCtaDesc', 'Ask Green Buddy! Our AI chatbot can answer all your questions about waste sorting, recycling, and eco-friendly living.')}
                </p>
              </div>
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-4 h-4" />
                {t('scanner.askGreenBuddy', 'Ask Green Buddy')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
