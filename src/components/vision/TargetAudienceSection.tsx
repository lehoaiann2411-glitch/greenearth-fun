import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User, Building2, Landmark, GraduationCap, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function TargetAudienceSection() {
  const { t } = useTranslation();

  const audiences = [
    {
      icon: User,
      titleKey: 'vision.audience.individuals.title',
      descKey: 'vision.audience.individuals.description',
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      icon: Building2,
      titleKey: 'vision.audience.enterprises.title',
      descKey: 'vision.audience.enterprises.description',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Landmark,
      titleKey: 'vision.audience.governments.title',
      descKey: 'vision.audience.governments.description',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: GraduationCap,
      titleKey: 'vision.audience.youth.title',
      descKey: 'vision.audience.youth.description',
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            <Users className="h-4 w-4" />
            {t('vision.audience.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('vision.audience.title')}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            {t('vision.audience.subtitle')}
          </p>
        </motion.div>

        {/* Audience Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="glass-card border-white/20 h-full hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${audience.gradient} mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <audience.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white mb-2">
                    {t(audience.titleKey)}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {t(audience.descKey)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
