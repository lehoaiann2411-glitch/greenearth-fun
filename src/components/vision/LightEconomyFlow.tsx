import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sun, Droplets, Heart, Leaf, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function LightEconomyFlow() {
  const { t } = useTranslation();

  const flowSteps = [
    {
      icon: Heart,
      titleKey: 'vision.lightEconomy.steps.love.title',
      descKey: 'vision.lightEconomy.steps.love.description',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-500/20',
      iconColor: 'text-pink-400',
    },
    {
      icon: Leaf,
      titleKey: 'vision.lightEconomy.steps.value.title',
      descKey: 'vision.lightEconomy.steps.value.description',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Sparkles,
      titleKey: 'vision.lightEconomy.steps.blessings.title',
      descKey: 'vision.lightEconomy.steps.blessings.description',
      color: 'from-amber-500 to-yellow-500',
      bgColor: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
    },
  ];

  const currencies = [
    {
      icon: Sun,
      titleKey: 'vision.lightEconomy.currency.funMoney.title',
      descKey: 'vision.lightEconomy.currency.funMoney.description',
      color: 'from-orange-500 to-amber-500',
      iconColor: 'text-orange-400',
    },
    {
      icon: Droplets,
      titleKey: 'vision.lightEconomy.currency.camlyCoin.title',
      descKey: 'vision.lightEconomy.currency.camlyCoin.description',
      color: 'from-cyan-500 to-blue-500',
      iconColor: 'text-cyan-400',
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 text-sm font-medium mb-4">
            <Sun className="h-4 w-4" />
            {t('vision.lightEconomy.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] [text-shadow:_0_2px_0_rgb(0_0_0_/_60%),_0_3px_6px_rgb(0_0_0_/_50%)]">
            {t('vision.lightEconomy.title')}
          </h2>
          <p className="text-white max-w-3xl mx-auto text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">
            {t('vision.lightEconomy.subtitle')}
          </p>
        </motion.div>

        {/* Main Flow - Love → Value → Blessings */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 mb-16">
          {flowSteps.map((step, index) => (
            <motion.div
              key={step.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex items-center gap-4"
            >
              <Card className="glass-card border-white/20 hover:scale-105 transition-all duration-300 w-full lg:w-72">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.bgColor} mb-4`}>
                    <step.icon className={`h-8 w-8 ${step.iconColor}`} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-white text-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] [text-shadow:_0_1px_1px_rgb(0_0_0_/_30%)]">
                    {t(step.descKey)}
                  </p>
                </CardContent>
              </Card>

              {/* Arrow between steps */}
              {index < flowSteps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.15 + 0.3 }}
                  className="hidden lg:flex"
                >
                  <ArrowRight className="h-8 w-8 text-white/40" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Currency System */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12"
        >
          {currencies.map((currency) => (
            <Card key={currency.titleKey} className="glass-card border-white/20 overflow-hidden group hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${currency.color} flex items-center justify-center shadow-lg`}>
                  <currency.icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold text-white mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
                    {t(currency.titleKey)}
                  </h4>
                  <p className="text-white text-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] [text-shadow:_0_1px_1px_rgb(0_0_0_/_30%)]">
                    {t(currency.descKey)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Key Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <div className="px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-emerald-500/20 border border-primary/30">
            <span className="text-white font-medium">{t('vision.lightEconomy.principle1')}</span>
          </div>
          <div className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <span className="text-white font-medium">{t('vision.lightEconomy.principle2')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
