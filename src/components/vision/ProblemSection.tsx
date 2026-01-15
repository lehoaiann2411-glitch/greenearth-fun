import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, TreeDeciduous, Skull, TrendingDown, XCircle, Factory } from 'lucide-react';

export function ProblemSection() {
  const { t } = useTranslation();

  const problems = [
    {
      icon: TreeDeciduous,
      titleKey: 'vision.problem.items.deforestation.title',
      descKey: 'vision.problem.items.deforestation.description',
    },
    {
      icon: Factory,
      titleKey: 'vision.problem.items.growth.title',
      descKey: 'vision.problem.items.growth.description',
    },
    {
      icon: TrendingDown,
      titleKey: 'vision.problem.items.greenBusiness.title',
      descKey: 'vision.problem.items.greenBusiness.description',
    },
    {
      icon: XCircle,
      titleKey: 'vision.problem.items.noReward.title',
      descKey: 'vision.problem.items.noReward.description',
    },
    {
      icon: Skull,
      titleKey: 'vision.problem.items.esg.title',
      descKey: 'vision.problem.items.esg.description',
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-red-950/10 to-black/20 pointer-events-none" />

      <div className="container relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-300 text-sm font-medium mb-4">
            <AlertTriangle className="h-4 w-4" />
            {t('vision.problem.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('vision.problem.title')}
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            {t('vision.problem.subtitle')}
          </p>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-12">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.titleKey}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-500/20 hover:border-red-500/40 transition-colors"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <problem.icon className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{t(problem.titleKey)}</h3>
                <p className="text-white/50 text-sm">{t(problem.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <blockquote className="max-w-2xl mx-auto">
            <p className="text-2xl md:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-300 mb-4">
              "{t('vision.problem.quote')}"
            </p>
            <footer className="text-white/50 text-sm">
              {t('vision.problem.quoteAuthor')}
            </footer>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
