import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, Menu, X, User, LogOut, LayoutDashboard, Coins, Users, MessageCircle, UserPlus, PlayCircle, Sun, Moon, BookOpen, Camera, Bookmark, Download, Radio, FileText } from 'lucide-react';
import { useLiveStreams } from '@/hooks/useLiveStream';
import { GreenEarthLogo } from '@/components/brand/GreenEarthLogo';
import { useState, useEffect } from 'react';
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
import { useUnreadMessagesCount } from '@/hooks/useMessages';
import { useFriendRequestsCount } from '@/hooks/useFriendships';
import { useProfile } from '@/hooks/useProfile';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function Header() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  
  const { data: unreadMessages } = useUnreadMessagesCount();
  const { data: friendRequests } = useFriendRequestsCount();
  const { data: profile } = useProfile();
  const { isInstalled, isMobile } = usePWAInstall();
  
  const showInstallButton = isMobile && !isInstalled;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => setIsDark(!isDark);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const { data: liveStreams } = useLiveStreams();
  const hasActiveLive = liveStreams && liveStreams.length > 0;

  const navLinks = [
    { href: '/feed', label: t('nav.feed') },
    { href: '/reels', label: t('nav.reels'), icon: PlayCircle },
    { href: '/live', label: 'Live', icon: Radio, isLive: hasActiveLive },
    { href: '/campaigns', label: t('nav.campaigns') },
    { href: '/groups', label: t('nav.groups'), icon: Users },
    { href: '/impact', label: t('nav.impact') },
    { href: '/rewards', label: t('nav.rewards'), icon: Coins },
    { href: '/leaderboard', label: t('nav.leaderboard') },
    { href: '/docs/platform', label: 'Docs', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm border-b border-white/10" />
      
      <div className="container relative flex h-36 items-center justify-between">
        <Link to="/" className="flex items-center group relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.5)_0%,_rgba(74,222,128,0.4)_40%,_transparent_70%)] blur-xl scale-[2] animate-glow-pulse pointer-events-none" />
          <GreenEarthLogo className="relative z-10 h-32 w-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-lg" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg text-white/90 text-shadow-sm hover:text-white hover:bg-white/10 flex items-center gap-1 ${
                (link as any).isLive ? 'text-red-400' : ''
              }`}
            >
              {link.icon && <link.icon className={`h-4 w-4 ${(link as any).isLive ? 'text-red-500 animate-pulse' : ''}`} />}
              {link.label}
              {(link as any).isLive && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {showInstallButton && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white hover:bg-white/10 gap-1"
            >
              <Link to="/install">
                <Download className="h-4 w-4" />
                {t('nav.install')}
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="text-white hover:bg-white/10"
            title={isDark ? t('header.lightMode') : t('header.darkMode')}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <LanguageSwitcher />
          <ConnectWallet />
          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild className="relative text-white hover:bg-white/10">
                <Link to="/messages">
                  <MessageCircle className="h-5 w-5" />
                  {unreadMessages && unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </Link>
              </Button>

              <Button variant="ghost" size="icon" asChild className="relative text-white hover:bg-white/10">
                <Link to="/friends">
                  <UserPlus className="h-5 w-5" />
                  {friendRequests && friendRequests > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                      {friendRequests > 9 ? '9+' : friendRequests}
                    </span>
                  )}
                </Link>
              </Button>

              <NotificationBell />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-white/30 hover:ring-white/50 transition-all">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || user.email || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile?.full_name?.[0] || user.email?.charAt(0).toUpperCase() || ''}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-card" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.user_metadata?.full_name || t('common.user')}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {t('nav.dashboard')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('nav.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/saved" className="cursor-pointer flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    {t('nav.saved')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white">
                <Link to="/auth">{t('nav.login')}</Link>
              </Button>
              <Button asChild className="btn-glow bg-white text-primary hover:bg-white/90 font-semibold">
                <Link to="/auth?mode=signup">
                  <Leaf className="h-4 w-4 mr-1" />
                  {t('header.joinNow')}
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md md:hidden text-white hover:bg-white/10 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

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
            {showInstallButton && (
              <Link
                to="/install"
                className="px-4 py-3 rounded-lg text-primary hover:bg-primary/10 transition-colors font-medium flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Download className="h-4 w-4" />
                {t('nav.install')}
              </Link>
            )}
            {user ? (
              <>
                <Link to="/dashboard" className="px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" />
                  {t('nav.dashboard')}
                </Link>
                <Link to="/profile" className="px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <User className="h-4 w-4" />
                  {t('nav.profile')}
                </Link>
                <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors font-medium flex items-center gap-2 text-left">
                  <LogOut className="h-4 w-4" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-4">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>{t('nav.login')}</Link>
                </Button>
                <Button asChild className="w-full btn-glow">
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                    <Leaf className="h-4 w-4 mr-1" />
                    {t('header.joinNow')}
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
