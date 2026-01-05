import { useCallback } from 'react';
import { toast } from 'sonner';
import { useConfetti } from '@/hooks/useConfetti';
import { formatCamly, getActionLabel } from '@/lib/camlyCoin';
import { useTranslation } from 'react-i18next';

interface RewardNotificationOptions {
  showConfetti?: boolean;
  showCoinRain?: boolean;
}

export function useRewardNotification() {
  const { triggerConfetti } = useConfetti();
  const { i18n } = useTranslation();
  const language = i18n.language as 'en' | 'vi';

  const showReward = useCallback((
    amount: number,
    actionType: string,
    options: RewardNotificationOptions = {}
  ) => {
    const { showConfetti = amount >= 3000, showCoinRain = amount >= 5000 } = options;
    
    const actionLabel = getActionLabel(actionType, language);
    
    // Build toast message
    let message = '';
    let description = '';
    
    if (language === 'vi') {
      message = `🎉 +${formatCamly(amount)} Camly Coin!`;
      description = `Cho ${actionLabel}`;
    } else {
      message = `🎉 +${formatCamly(amount)} Camly Coin!`;
      description = `For ${actionLabel}`;
    }

    // Show toast with coin emoji
    toast.success(message, {
      description,
      icon: '🪙',
      duration: 4000,
    });

    // Trigger confetti for big rewards
    if (showConfetti) {
      triggerConfetti();
    }

    // Additional celebration for huge rewards
    if (showCoinRain) {
      // Trigger multiple confetti bursts
      setTimeout(() => triggerConfetti(), 300);
      setTimeout(() => triggerConfetti(), 600);
    }
  }, [triggerConfetti, language]);

  const showLimitReached = useCallback((
    type: 'shares' | 'likes',
    current: number,
    max: number
  ) => {
    const typeLabel = type === 'shares' 
      ? (language === 'vi' ? 'chia sẻ' : 'shares')
      : (language === 'vi' ? 'lượt thích' : 'likes');
    
    toast.info(
      language === 'vi' 
        ? `Đã đạt giới hạn ${typeLabel} hôm nay (${current}/${max})`
        : `Daily ${type} limit reached (${current}/${max})`,
      {
        description: language === 'vi' 
          ? 'Quay lại vào ngày mai để tiếp tục kiếm Camly Coin!' 
          : 'Come back tomorrow to earn more Camly Coin!',
        icon: '⏰',
      }
    );
  }, [language]);

  const showCheckInReminder = useCallback(() => {
    toast.info(
      language === 'vi' ? 'Đừng quên điểm danh!' : "Don't forget to check in!",
      {
        description: language === 'vi' 
          ? `+${formatCamly(500)} Camly Coin mỗi ngày` 
          : `+${formatCamly(500)} Camly Coin daily`,
        icon: '📅',
      }
    );
  }, [language]);

  return { showReward, showLimitReached, showCheckInReminder };
}
