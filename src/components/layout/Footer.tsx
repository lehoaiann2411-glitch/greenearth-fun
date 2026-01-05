import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { href: '/campaigns', label: 'Chiến dịch' },
      { href: '/community', label: 'Cộng đồng' },
      { href: '/leaderboard', label: 'Bảng xếp hạng' },
      { href: '/nft-gallery', label: 'Green NFT' },
    ],
    about: [
      { href: '/about', label: 'Về chúng tôi' },
      { href: '/partners', label: 'Đối tác' },
      { href: '/news', label: 'Tin tức' },
      { href: '/careers', label: 'Tuyển dụng' },
    ],
    support: [
      { href: '/help', label: 'Trợ giúp' },
      { href: '/contact', label: 'Liên hệ' },
      { href: '/privacy', label: 'Chính sách bảo mật' },
      { href: '/terms', label: 'Điều khoản sử dụng' },
    ],
  };

  const socialLinks = [
    { href: '#', icon: Facebook, label: 'Facebook' },
    { href: '#', icon: Twitter, label: 'Twitter' },
    { href: '#', icon: Instagram, label: 'Instagram' },
    { href: '#', icon: Youtube, label: 'Youtube' },
  ];

  return (
    <footer className="border-t bg-forest text-forest-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-forest-foreground">
                Green Earth
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm opacity-80">
              Nền tảng kết nối cộng đồng xanh, thúc đẩy các hoạt động bảo vệ môi trường 
              và phát triển bền vững tại Việt Nam.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-foreground/10 transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-display font-semibold">Nền tảng</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm opacity-80 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-display font-semibold">Về Green Earth</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm opacity-80 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold">Liên hệ</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm opacity-80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Hà Nội, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2 text-sm opacity-80">
                <Mail className="h-4 w-4" />
                <a href="mailto:contact@greenearth.vn" className="hover:underline">
                  contact@greenearth.vn
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm opacity-80">
                <Phone className="h-4 w-4" />
                <a href="tel:+84123456789" className="hover:underline">
                  +84 123 456 789
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-forest-foreground/10 pt-8 md:flex-row">
          <p className="text-sm opacity-60">
            © {currentYear} Green Earth Platform. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-6">
            {footerLinks.support.slice(2).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm opacity-60 transition-opacity hover:opacity-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
