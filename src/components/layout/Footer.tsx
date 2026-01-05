import { Link } from 'react-router-dom';
import { TreeDeciduous, Leaf, Mail, Phone, MapPin, Facebook, Youtube, Globe, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { href: '/campaigns', label: 'Chiến dịch' },
      { href: '/community', label: 'Cộng đồng' },
      { href: '/leaderboard', label: 'Bảng xếp hạng' },
      
    ],
    about: [
      { href: '/about', label: 'Về chúng tôi' },
      { href: '/partners', label: 'Đối tác' },
      { href: '/contact', label: 'Liên hệ' },
      { href: '/faq', label: 'FAQ' },
    ],
  };

  const socialLinks = [
    { href: '#', icon: Facebook, label: 'Facebook' },
    { href: '#', icon: Youtube, label: 'YouTube' },
    { href: '#', icon: Globe, label: 'Website' },
  ];

  return (
    <footer className="relative mt-auto">
      {/* Glass background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-lg" />
      
      <div className="relative container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <TreeDeciduous className="h-8 w-8 text-accent drop-shadow-lg" />
                <Leaf className="absolute -top-1 -right-1 h-4 w-4 text-white/80 animate-leaf-float" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Green Earth
              </span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              Nền tảng kết nối cộng đồng vì môi trường xanh. 
              Cùng nhau hành động, tạo nên tương lai bền vững.
            </p>
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

          {/* Platform Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-accent" />
              Nền tảng
            </h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-accent" />
              Thông tin
            </h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent" />
              Liên hệ
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/70 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <span>Việt Nam</span>
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <a href="mailto:hello@greenearth.vn" className="hover:text-accent transition-colors">
                  hello@greenearth.vn
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <a href="tel:+84123456789" className="hover:text-accent transition-colors">
                  +84 123 456 789
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm flex items-center gap-1">
              © {currentYear} Green Earth. Made with 
              <Heart className="h-3 w-3 text-destructive fill-destructive animate-pulse" /> 
              for the planet.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/50">
              <Link to="/privacy" className="hover:text-accent transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="hover:text-accent transition-colors">
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
