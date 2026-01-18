import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Check, Smartphone, Share, Plus, MoreVertical, Wifi, Zap, RefreshCw, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useConfetti } from '@/hooks/useConfetti';
import { GreenEarthLogo } from '@/components/brand/GreenEarthLogo';
import { Layout } from '@/components/layout/Layout';

export default function Install() {
  const { t } = useTranslation();
  const { isInstalled, isIOS, isAndroid, canInstall, promptInstall, isMobile } = usePWAInstall();
  const { triggerConfetti } = useConfetti();
  const [installing, setInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    const success = await promptInstall();
    setInstalling(false);
    
    if (success) {
      setJustInstalled(true);
      triggerConfetti();
    }
  };

  const features = [
    { icon: Wifi, label: t('install.features.offline'), color: 'text-blue-500' },
    { icon: Zap, label: t('install.features.fast'), color: 'text-yellow-500' },
    { icon: HardDrive, label: t('install.features.light'), color: 'text-green-500' },
    { icon: RefreshCw, label: t('install.features.updated'), color: 'text-purple-500' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background py-8 px-4">
        <div className="container max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <GreenEarthLogo className="h-32 w-auto drop-shadow-xl" />
              </motion.div>
            </div>

            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              {t('install.title')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('install.subtitle')}
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3 mb-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-primary/10 ${feature.color}`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Install Status */}
          <AnimatePresence mode="wait">
            {isInstalled || justInstalled ? (
              <motion.div
                key="installed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-8"
              >
                <Card className="border-green-500/50 bg-green-500/10">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4"
                    >
                      <Check className="h-8 w-8 text-green-500" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
                      {justInstalled ? t('install.success') : t('install.alreadyInstalled')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('install.enjoyApp')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : canInstall ? (
              <motion.div
                key="can-install"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-8"
              >
                <Button
                  onClick={handleInstall}
                  disabled={installing}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 shadow-lg shadow-primary/25"
                >
                  {installing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                    </motion.div>
                  ) : (
                    <Download className="h-5 w-5 mr-2" />
                  )}
                  {installing ? t('install.installing') : t('install.installButton')}
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Platform-specific guides */}
          {!isInstalled && !justInstalled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* iOS Guide */}
              {(isIOS || !isMobile) && (
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        <h3 className="font-semibold">{t('install.iosGuide.title')}</h3>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-semibold">
                          1
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span>{t('install.iosGuide.step1')}</span>
                          <Share className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-semibold">
                          2
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span>{t('install.iosGuide.step2')}</span>
                          <Plus className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-semibold">
                          3
                        </div>
                        <p className="pt-1">{t('install.iosGuide.step3')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Android Guide */}
              {(isAndroid || !isMobile) && (
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        <h3 className="font-semibold">{t('install.androidGuide.title')}</h3>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-semibold">
                          1
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span>{t('install.androidGuide.step1')}</span>
                          <MoreVertical className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-semibold">
                          2
                        </div>
                        <p className="pt-1">{t('install.androidGuide.step2')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Share Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground mb-2">
              {t('install.shareLink')}
            </p>
            <code className="px-3 py-2 bg-muted rounded-lg text-sm font-mono">
              greenearth-fun.lovable.app/install
            </code>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
