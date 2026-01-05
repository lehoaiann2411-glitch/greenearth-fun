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
} from 'lucide-react';

export default function Index() {
  const { t } = useTranslation();

  const stats = [
    { icon: TreeDeciduous, value: '50,000+', labelKey: 'home.stats.treesPlanted', delay: 'animation-delay-100' },
    { icon: Users, value: '10,000+', labelKey: 'home.stats.members', delay: 'animation-delay-200' },
    { icon: Target, value: '500+', labelKey: 'home.stats.campaigns', delay: 'animation-delay-300' },
    { icon: Award, value: '1M+', labelKey: 'home.stats.greenPoints', delay: 'animation-delay-400' },
  ];

  const features = [
    {
      icon: Award,
      titleKey: 'home.features.greenPoints.title',
      descriptionKey: 'home.features.greenPoints.description',
      delay: 'animation-delay-100',
    },
    {
      icon: Leaf,
      titleKey: 'home.features.camlyCoin.title',
      descriptionKey: 'home.features.camlyCoin.description',
      delay: 'animation-delay-200',
    },
    {
      icon: Users,
      titleKey: 'home.features.community.title',
      descriptionKey: 'home.features.community.description',
      delay: 'animation-delay-300',
    },
    {
      icon: Shield,
      titleKey: 'home.features.reputation.title',
      descriptionKey: 'home.features.reputation.description',
      delay: 'animation-delay-400',
    },
  ];

  const steps = [
    { step: 1, titleKey: 'home.steps.register.title', descriptionKey: 'home.steps.register.description' },
    { step: 2, titleKey: 'home.steps.join.title', descriptionKey: 'home.steps.join.description' },
    { step: 3, titleKey: 'home.steps.action.title', descriptionKey: 'home.steps.action.description' },
    { step: 4, titleKey: 'home.steps.reward.title', descriptionKey: 'home.steps.reward.description' },
  ];

  const trustItems = [
    { icon: Shield, titleKey: 'home.trust.security.title', descriptionKey: 'home.trust.security.description' },
    { icon: Globe, titleKey: 'home.trust.transparency.title', descriptionKey: 'home.trust.transparency.description' },
    { icon: TrendingUp, titleKey: 'home.trust.esg.title', descriptionKey: 'home.trust.esg.description' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">

            {/* Heading */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up animation-delay-100 text-shadow-lg">
              {t('home.hero.titleLine1')}
              <span className="block text-accent drop-shadow-[0_2px_8px_rgba(144,238,144,0.7)] text-shadow-md">{t('home.hero.titleLine2')}</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200 text-shadow font-medium">
              {t('home.hero.description')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
              <Button 
                size="lg" 
                asChild
                className="btn-glow bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 font-semibold"
              >
                <Link to="/auth?mode=signup">
                  <Leaf className="h-5 w-5 mr-2" />
                  {t('home.hero.joinNow')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                asChild
                className="btn-outline-visible text-lg px-8 py-6 hover:scale-105 transition-all duration-300"
              >
                <Link to="/campaigns">
                  <Globe className="h-5 w-5 mr-2" />
                  {t('home.hero.exploreCampaigns')}
                </Link>
              </Button>
            </div>

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

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg animate-fade-in-up">
              {t('home.features.title')}
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card 
                key={feature.titleKey}
                className={`glass-card border-white/20 hover:scale-105 hover-glow transition-all duration-300 group animate-fade-in-up ${feature.delay}`}
              >
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/20 mb-4 group-hover:bg-primary/30 transition-colors">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(feature.descriptionKey)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg animate-fade-in-up">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <div 
                key={item.step} 
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-accent/50 to-transparent" />
                )}
                
                <Card className="glass-card border-white/20 hover:scale-105 transition-all duration-300 relative">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-display text-2xl font-bold mb-4 glow-green-sm">
                      {item.step}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {t(item.titleKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(item.descriptionKey)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container">
          <Card className="glass-card border-accent/30 overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center relative">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6 animate-glow-pulse">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                
                <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-4">
                  {t('home.cta.title')}
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  {t('home.cta.description')}
                </p>
                
                <Button 
                  size="lg" 
                  asChild
                  className="btn-glow text-lg px-8 py-6"
                >
                  <Link to="/auth?mode=signup">
                    <Leaf className="h-5 w-5 mr-2" />
                    {t('home.cta.button')}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

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
