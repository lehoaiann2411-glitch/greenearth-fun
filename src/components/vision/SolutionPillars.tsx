import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, Coins, Brain, Link2, DollarSign, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function SolutionPillars() {
  const { t } = useTranslation();

  const pillars = [
    {
      icon: Coins,
      titleKey: 'vision.solution.pillars.value.title',
      descKey: 'vision.solution.pillars.value.description',
      features: [
        'vision.solution.pillars.value.feature1',
        'vision.solution.pillars.value.feature2',
        'vision.solution.pillars.value.feature3',
      ],
      gradient: 'from-emerald-500 to-green-600',
      bgGlow: 'bg-emerald-500/20',
    },
    {
      icon: Brain,
      titleKey: 'vision.solution.pillars.aiBlockchain.title',
      descKey: 'vision.solution.pillars.aiBlockchain.description',
      features: [
        'vision.solution.pillars.aiBlockchain.feature1',
        'vision.solution.pillars.aiBlockchain.feature2',
        'vision.solution.pillars.aiBlockchain.feature3',
      ],
      gradient: 'from-violet-500 to-purple-600',
      bgGlow: 'bg-violet-500/20',
    },
    {
      icon: DollarSign,
      titleKey: 'vision.solution.pillars.cashflow.title',
      descKey: 'vision.solution.pillars.cashflow.description',
      features: [
        'vision.solution.pillars.cashflow.feature1',
        'vision.solution.pillars.cashflow.feature2',
        'vision.solution.pillars.cashflow.feature3',
      ],
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'bg-amber-500/20',
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            {t('vision.solution.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
            {t('vision.solution.title')}
          </h2>
          <p className="text-white/70 max-w-3xl mx-auto text-lg">
            {t('vision.solution.subtitle')}
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.titleKey}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card className="glass-card border-white/20 h-full hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
                {/* Glow effect */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 ${pillar.bgGlow} rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity`} />

                <CardContent className="p-8 relative">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.gradient} mb-6 shadow-lg`}>
                    <pillar.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl font-bold text-white mb-3">
                    {t(pillar.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-white/60 mb-6">
                    {t(pillar.descKey)}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3">
                    {pillar.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-white/70 text-sm">{t(feature)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
