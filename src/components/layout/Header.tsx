import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, Menu, X, User, LogOut, TreeDeciduous, LayoutDashboard, Coins, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConnectWallet } from '@/components/web3/ConnectWallet';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Header() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { href: '/feed', label: 'Feed' },
    { href: '/campaigns', label: t('nav.campaigns') },
    { href: '/groups', label: 'Cộng đồng', icon: Users },
    { href: '/impact', label: t('nav.impact') },
    { href: '/rewards', label: t('nav.rewards'), icon: Coins },
    { href: '/leaderboard', label: t('nav.leaderboard') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-lg border-b border-white/20" />
      
      <div className="container relative flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <TreeDeciduous className="h-8 w-8 text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-110" />
            <Leaf className="absolute -top-1 -right-1 h-4 w-4 text-accent animate-leaf-float" />
          </div>
          <span className="font-display text-xl font-bold text-white drop-shadow-md">
            Green Earth
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-1"
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons / User Menu */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ConnectWallet />
          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full ring-2 ring-white/30 hover:ring-white/50 transition-all"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={user.email || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-card" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.user_metadata?.full_name || 'Người dùng'}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <>
              <Button 
                variant="ghost" 
                asChild
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/auth">Đăng nhập</Link>
              </Button>
              <Button 
                asChild
                className="btn-glow bg-white text-primary hover:bg-white/90 font-semibold"
              >
                <Link to="/auth?mode=signup">
                  <Leaf className="h-4 w-4 mr-1" />
                  Tham gia ngay
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-md md:hidden text-white hover:bg-white/10 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white/95 backdrop-blur-lg border-b border-white/20 animate-fade-in-up">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border my-2" />
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors font-medium flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors font-medium flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Hồ sơ
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors font-medium flex items-center gap-2 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-4">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    Đăng nhập
                  </Link>
                </Button>
                <Button asChild className="w-full btn-glow">
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                    <Leaf className="h-4 w-4 mr-1" />
                    Tham gia ngay
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
