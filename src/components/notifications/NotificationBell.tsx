import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Settings, Heart, MessageCircle, UserPlus, Share2, Coins, TreePine } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Popover, PopoverContent, PopoverTrigger 
} from '@/components/ui/popover';
import { 
  useNotifications, 
  useUnreadNotificationsCount, 
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  Notification 
} from '@/hooks/useNotifications';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <Heart className="w-4 h-4 text-pink-500" />;
    case 'comment':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'follow':
      return <UserPlus className="w-4 h-4 text-primary" />;
    case 'share':
      return <Share2 className="w-4 h-4 text-purple-500" />;
    case 'reward':
      return <Coins className="w-4 h-4 text-camly-gold" />;
    case 'campaign':
      return <TreePine className="w-4 h-4 text-emerald-500" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

const getNotificationLink = (notification: Notification) => {
  switch (notification.reference_type) {
    case 'post':
      return `/post/${notification.reference_id}`;
    case 'user':
      return `/profile?id=${notification.reference_id}`;
    case 'campaign':
      return `/campaigns/${notification.reference_id}`;
    default:
      return null;
  }
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {(unreadCount || 0) > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge 
                  variant="destructive" 
                  className="h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount! > 99 ? '99+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-1">
            {(unreadCount || 0) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleMarkAllRead}
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Notifications list */}
        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications?.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No notifications yet</p>
              <p className="text-muted-foreground/70 text-xs mt-1">
                When you get notifications, they'll show up here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications?.map((notification) => {
                const link = getNotificationLink(notification);
                const content = (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.is_read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={notification.actor?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {notification.actor?.full_name?.[0] || '🌱'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center border">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">
                          {notification.actor?.full_name || 'Someone'}
                        </span>{' '}
                        <span className="text-muted-foreground">
                          {notification.message || notification.title}
                        </span>
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                        
                        {notification.camly_amount && notification.camly_amount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-camly-gold font-medium">
                            +{notification.camly_amount} <CamlyCoinIcon size="xs" />
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    )}
                  </motion.div>
                );

                return link ? (
                  <Link key={notification.id} to={link}>
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id}>{content}</div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t">
          <Link to="/notifications" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" className="w-full text-primary">
              See all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
