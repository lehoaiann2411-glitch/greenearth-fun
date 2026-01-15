import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  TreeDeciduous,
  Users,
  Award,
  Leaf,
  ArrowRight,
  Shield,
  Globe,
  Heart,
  Target,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ProblemSection,
  SolutionPillars,
  LightEconomyFlow,
  AngelAIIntro,
  TargetAudienceSection,
  FatherMessage,
} from '@/components/vision';

export default function Index() {
  const { t } = useTranslation();

  const stats = [
    { icon: TreeDeciduous, value: '50,000+', labelKey: 'home.stats.treesPlanted', delay: 'animation-delay-100' },
    { icon: Users, value: '10,000+', labelKey: 'home.stats.members', delay: 'animation-delay-200' },
    { icon: Target, value: '500+', labelKey: 'home.stats.campaigns', delay: 'animation-delay-300' },
    { icon: Award, value: '1M+', labelKey: 'home.stats.greenPoints', delay: 'animation-delay-400' },
  ];

  const trustItems = [
    { icon: Shield, titleKey: 'home.trust.security.title', descriptionKey: 'home.trust.security.description' },
    { icon: Globe, titleKey: 'home.trust.transparency.title', descriptionKey: 'home.trust.transparency.description' },
    { icon: TrendingUp, titleKey: 'home.trust.esg.title', descriptionKey: 'home.trust.esg.description' },
  ];

  return (
    <Layout>
      {/* NEW Hero Section - 5D Vision */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              {t('vision.hero.badge')}
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-shadow-lg"
            >
              {t('vision.hero.title')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-300 drop-shadow-[0_2px_8px_rgba(144,238,144,0.7)]">
                {t('vision.hero.titleHighlight')}
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto text-shadow font-medium"
            >
              {t('vision.hero.subtitle')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                asChild
                className="btn-glow bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 font-semibold"
              >
                <Link to="/auth?mode=signup">
                  <Heart className="h-5 w-5 mr-2" />
                  {t('vision.hero.cta1')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                asChild
                className="btn-outline-visible text-lg px-8 py-6 hover:scale-105 transition-all duration-300"
              >
                <Link to="/impact">
                  <Globe className="h-5 w-5 mr-2" />
                  {t('vision.hero.cta2')}
                </Link>
              </Button>
            </motion.div>

            {/* Floating decorative elements */}
            <div className="absolute top-10 left-10 animate-leaf-float opacity-60 hidden md:block">
              <Leaf className="h-8 w-8 text-accent" />
            </div>
            <div className="absolute bottom-20 right-10 animate-leaf-float animation-delay-500 opacity-60 hidden md:block">
              <TreeDeciduous className="h-10 w-10 text-white/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat) => (
              <Card 
                key={stat.labelKey} 
                className={`glass-card border-white/20 hover:scale-105 transition-all duration-300 animate-fade-in-up ${stat.delay}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-3">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <ProblemSection />

      {/* Solution Pillars */}
      <SolutionPillars />

      {/* Light Economy Flow */}
      <LightEconomyFlow />

      {/* Angel AI Section */}
      <AngelAIIntro />

      {/* Target Audience */}
      <TargetAudienceSection />

      {/* Father Message */}
      <FatherMessage />

      {/* Trust Section */}
      <section className="py-16 relative">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            {trustItems.map((item, index) => (
              <div 
                key={item.titleKey}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="shrink-0 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t(item.titleKey)}</h3>
                  <p className="text-sm text-white/60">{t(item.descriptionKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
