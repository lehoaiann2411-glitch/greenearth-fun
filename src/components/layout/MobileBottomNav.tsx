import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, PlayCircle, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadMessagesCount } from '@/hooks/useMessages';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/feed', icon: Newspaper, label: 'Feed' },
  { href: '/reels', icon: PlayCircle, label: 'Reels' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { data: unreadMessages } = useUnreadMessagesCount();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-white/20 dark:border-white/10" />
      
      {/* Navigation items */}
      <div className="relative flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const isMessages = item.href === '/messages';
          const isProfile = item.href === '/profile';
          
          // Redirect to auth if not logged in for protected routes
          const href = (isMessages || isProfile) && !user ? '/auth' : item.href;

          return (
            <Link
              key={item.href}
              to={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
              
              {/* Icon with badge */}
              <span className="relative">
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active && "scale-110"
                )} />
                
                {/* Unread messages badge */}
                {isMessages && unreadMessages && unreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </span>
              
              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
