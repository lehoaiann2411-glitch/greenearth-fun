import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Facebook, Youtube, Globe, Heart } from 'lucide-react';
import { GreenEarthLogo } from '@/components/brand/GreenEarthLogo';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { href: '/campaigns', label: t('footer.campaigns') },
      { href: '/community', label: t('footer.community') },
      { href: '/leaderboard', label: t('footer.leaderboard') },
    ],
    about: [
      { href: '/about', label: t('footer.aboutUs') },
      { href: '/partners', label: t('footer.partners') },
      { href: '/contact', label: t('footer.contactUs') },
      { href: '/faq', label: t('footer.faq') },
    ],
  };

  const socialLinks = [
    { href: '#', icon: Facebook, label: 'Facebook' },
    { href: '#', icon: Youtube, label: 'YouTube' },
    { href: '#', icon: Globe, label: 'Website' },
  ];

  return (
    <footer className="relative mt-auto">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-lg" />
      
      <div className="relative container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center group relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.4)_0%,_rgba(74,222,128,0.3)_40%,_transparent_70%)] blur-2xl scale-[2.5] animate-glow-pulse pointer-events-none" />
              <GreenEarthLogo className="relative z-10 h-40 w-auto" />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">{t('footer.description')}</p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-110 hover-glow"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-accent" />
              {t('footer.platform')}
            </h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/70 hover:text-accent transition-colors text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-accent" />
              {t('footer.about')}
            </h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/70 hover:text-accent transition-colors text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent" />
              {t('footer.contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/70 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <span>{t('footer.vietnam')}</span>
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <a href="mailto:hello@greenearth.vn" className="hover:text-accent transition-colors">hello@greenearth.vn</a>
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <a href="tel:+84123456789" className="hover:text-accent transition-colors">+84 123 456 789</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm flex items-center gap-1">
              © {currentYear} Green Earth. {t('footer.madeWith')} 
              <Heart className="h-3 w-3 text-destructive fill-destructive animate-pulse" /> 
              {t('footer.forPlanet')}
            </p>
            <div className="flex items-center gap-4 text-sm text-white/50">
              <Link to="/privacy" className="hover:text-accent transition-colors">{t('footer.privacy')}</Link>
              <Link to="/terms" className="hover:text-accent transition-colors">{t('footer.terms')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
