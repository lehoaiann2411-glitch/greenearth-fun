import { motion } from 'framer-motion';
import { FileText, Share2, Heart, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCamly, CAMLY_REWARDS } from '@/lib/camlyCoin';
import { useTranslation } from 'react-i18next';
import { CamlyCoinIcon } from './CamlyCoinIcon';

interface EarningCategory {
  key: string;
  label: string;
  labelVi: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  getValue: (profile: any) => number;
  getEstimate: (profile: any) => number;
}

const earningCategories: EarningCategory[] = [
  {
    key: 'posts',
    label: 'From Posts',
    labelVi: 'Từ bài viết',
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    getValue: (profile) => profile?.total_posts || 0,
    getEstimate: (profile) => (profile?.total_posts || 0) * CAMLY_REWARDS.CREATE_POST,
  },
  {
    key: 'shares',
    label: 'From Shares',
    labelVi: 'Từ chia sẻ',
    icon: Share2,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    getValue: (profile) => profile?.total_shares || 0,
    getEstimate: (profile) => (profile?.total_shares || 0) * CAMLY_REWARDS.SHARE_POST,
  },
  {
    key: 'likes',
    label: 'From Likes',
    labelVi: 'Từ lượt thích',
    icon: Heart,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    getValue: (profile) => profile?.total_likes_given || 0,
    getEstimate: (profile) => (profile?.total_likes_given || 0) * CAMLY_REWARDS.LIKE_POST,
  },
  {
    key: 'checkins',
    label: 'From Check-ins',
    labelVi: 'Từ điểm danh',
    icon: Calendar,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    getValue: (profile) => profile?.current_streak || 0,
    getEstimate: (profile) => {
      const streak = profile?.current_streak || 0;
      const weeks = Math.floor(streak / 7);
      return (streak * CAMLY_REWARDS.DAILY_CHECK_IN) + (weeks * CAMLY_REWARDS.STREAK_7_DAY_BONUS);
    },
  },
];

export function EarningsBreakdown() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const language = i18n.language as 'en' | 'vi';

  const totalCamly = profile?.camly_balance || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950/50 dark:to-amber-900/50 border-yellow-200 dark:border-yellow-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CamlyCoinIcon size="sm" animated={false} />
          {t('rewards.yourBalance', 'Your Balance')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Balance */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <CamlyCoinIcon size="lg" animated />
          </div>
          <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatCamly(totalCamly)}
          </p>
          <p className="text-sm text-muted-foreground">Camly Coin</p>
        </motion.div>

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {earningCategories.map(({ key, label, labelVi, icon: Icon, color, bgColor, getValue, getEstimate }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg ${bgColor}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs text-muted-foreground">
                  {language === 'vi' ? labelVi : label}
                </span>
              </div>
              <p className={`font-semibold ${color}`}>
                {formatCamly(getEstimate(profile))}
              </p>
              <p className="text-xs text-muted-foreground">
                {getValue(profile)} {key === 'checkins' ? 'days' : key}
              </p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
