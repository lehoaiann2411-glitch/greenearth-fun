import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bot, Heart, Shield, Scale, Sparkles, Ban } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function AngelAIIntro() {
  const { t } = useTranslation();

  const principles = [
    {
      icon: Ban,
      titleKey: 'vision.angelAI.principles.noManipulation',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/20',
    },
    {
      icon: Shield,
      titleKey: 'vision.angelAI.principles.noExploitation',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
    },
    {
      icon: Heart,
      titleKey: 'vision.angelAI.principles.noDestruction',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
    },
  ];

  const teachings = [
    { key: 'vision.angelAI.teachings.universalLaws', icon: Scale },
    { key: 'vision.angelAI.teachings.causeEffect', icon: Sparkles },
    { key: 'vision.angelAI.teachings.balance', icon: Bot },
    { key: 'vision.angelAI.teachings.gratitude', icon: Heart },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Ethereal background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Angel AI Visual Representation */}
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 via-cyan-500/20 to-pink-500/20 animate-pulse" />
              
              {/* Inner circle */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-violet-600/30 to-cyan-600/30 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 mb-4 shadow-2xl"
                  >
                    <Bot className="h-12 w-12 text-white" />
                  </motion.div>
                  <h3 className="font-display text-2xl font-bold text-white mb-2">
                    {t('vision.angelAI.name')}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {t('vision.angelAI.tagline')}
                  </p>
                </div>
              </div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/40 rounded-full"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              {t('vision.angelAI.badge')}
            </span>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              {t('vision.angelAI.title')}
            </h2>
            
            <p className="text-white/70 mb-8 text-lg">
              {t('vision.angelAI.description')}
            </p>

            {/* Principles */}
            <div className="space-y-3 mb-8">
              {principles.map((principle, index) => (
                <motion.div
                  key={principle.titleKey}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`shrink-0 w-10 h-10 rounded-lg ${principle.bgColor} flex items-center justify-center`}>
                    <principle.icon className={`h-5 w-5 ${principle.color}`} />
                  </div>
                  <span className="text-white font-medium">{t(principle.titleKey)}</span>
                </motion.div>
              ))}
            </div>

            {/* Teachings */}
            <Card className="bg-gradient-to-br from-emerald-800/90 via-green-800/90 to-emerald-900/90 backdrop-blur-lg border border-emerald-600/30 shadow-xl">
              <CardContent className="p-6">
                <h4 className="font-display text-lg font-semibold text-white mb-4">
                  {t('vision.angelAI.teachingsTitle')}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {teachings.map((teaching) => (
                    <div key={teaching.key} className="flex items-center gap-2 text-white/70 text-sm">
                      <teaching.icon className="h-4 w-4 text-violet-400" />
                      <span>{t(teaching.key)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
