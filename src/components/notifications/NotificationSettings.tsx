import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  useNotificationPreferences, 
  useUpdateNotificationPreferences,
  NotificationPreferences 
} from '@/hooks/useNotificationPreferences';
import { UserPlus, Users, MessageCircle, Heart, MessageSquare, Share2, TreePine, Gift, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotificationOption {
  key: keyof NotificationPreferences;
  icon: React.ElementType;
  labelKey: string;
  descriptionKey: string;
}

const notificationOptions: NotificationOption[] = [
  {
    key: 'follows',
    icon: UserPlus,
    labelKey: 'notifications.settings.follows',
    descriptionKey: 'notifications.settings.followsDesc',
  },
  {
    key: 'friend_requests',
    icon: Users,
    labelKey: 'notifications.settings.friendRequests',
    descriptionKey: 'notifications.settings.friendRequestsDesc',
  },
  {
    key: 'messages',
    icon: MessageCircle,
    labelKey: 'notifications.settings.messages',
    descriptionKey: 'notifications.settings.messagesDesc',
  },
  {
    key: 'likes',
    icon: Heart,
    labelKey: 'notifications.settings.likes',
    descriptionKey: 'notifications.settings.likesDesc',
  },
  {
    key: 'comments',
    icon: MessageSquare,
    labelKey: 'notifications.settings.comments',
    descriptionKey: 'notifications.settings.commentsDesc',
  },
  {
    key: 'shares',
    icon: Share2,
    labelKey: 'notifications.settings.shares',
    descriptionKey: 'notifications.settings.sharesDesc',
  },
  {
    key: 'campaigns',
    icon: TreePine,
    labelKey: 'notifications.settings.campaigns',
    descriptionKey: 'notifications.settings.campaignsDesc',
  },
  {
    key: 'rewards',
    icon: Gift,
    labelKey: 'notifications.settings.rewards',
    descriptionKey: 'notifications.settings.rewardsDesc',
  },
];

export function NotificationSettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      await updatePreferences.mutateAsync({ [key]: value });
      toast({
        title: t('common.success'),
        description: t('notifications.settings.saved'),
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('notifications.settings.saveFailed'),
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>{t('notifications.settings.title')}</CardTitle>
        </div>
        <CardDescription>
          {t('notifications.settings.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {notificationOptions.map((option, index) => {
          const Icon = option.icon;
          const isEnabled = preferences?.[option.key] ?? true;

          return (
            <motion.div
              key={option.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary mt-0.5">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <Label 
                    htmlFor={option.key} 
                    className="text-sm font-medium cursor-pointer"
                  >
                    {t(option.labelKey)}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t(option.descriptionKey)}
                  </p>
                </div>
              </div>
              <Switch
                id={option.key}
                checked={isEnabled}
                onCheckedChange={(checked) => handleToggle(option.key, checked)}
                disabled={updatePreferences.isPending}
              />
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
