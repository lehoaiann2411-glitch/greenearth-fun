// Camly Coin conversion rate: 10 Green Points = 1 Camly Coin
export const GREEN_POINTS_PER_CAMLY = 10;
export const MINIMUM_CLAIM_POINTS = 100; // Minimum 100 GP = 10 CAMLY

// Points configuration for different actions
export const POINTS_CONFIG = {
  PLANT_TREE: 50,           // Plant a tree or upload proof
  DONATE_PER_USD: 10,       // 1 USD = 10 points
  DAILY_CHECK_IN: 5,        // Daily check-in
  COMPLETE_QUEST: 10,       // Complete daily quest
  SHARE_POST: 2,            // Share post
  VERIFY_TREE_GROWTH: 15,   // Verify/update tree growth
  TOP_CONTRIBUTOR_BONUS: 200, // Top contributor bonus
};

// Action type keys for tracking
export const ACTION_TYPES = {
  PLANT_TREE: 'plant_tree',
  DONATE: 'donate',
  DAILY_CHECK_IN: 'daily_check_in',
  COMPLETE_QUEST: 'complete_quest',
  SHARE_POST: 'share_post',
  VERIFY_TREE: 'verify_tree',
  TOP_CONTRIBUTOR: 'top_contributor',
  CAMPAIGN_COMPLETE: 'campaign_complete',
  POST_LIKE_RECEIVED: 'post_like_received',
  CREATE_POST: 'create_post',
};

/**
 * Convert Green Points to Camly Coin
 */
export function toCamlyCoin(greenPoints: number): number {
  return Math.floor(greenPoints / GREEN_POINTS_PER_CAMLY);
}

/**
 * Check if user can claim (minimum 100 GP)
 */
export function canClaim(greenPoints: number): boolean {
  return greenPoints >= MINIMUM_CLAIM_POINTS;
}

/**
 * Calculate claimable Camly Coins from available points
 */
export function getClaimableAmount(greenPoints: number): { points: number; camly: number } {
  if (!canClaim(greenPoints)) {
    return { points: 0, camly: 0 };
  }
  // Only claim in multiples of 10 (to get whole CAMLY coins)
  const claimablePoints = Math.floor(greenPoints / GREEN_POINTS_PER_CAMLY) * GREEN_POINTS_PER_CAMLY;
  return {
    points: claimablePoints,
    camly: claimablePoints / GREEN_POINTS_PER_CAMLY,
  };
}

/**
 * Format Green Points with Camly Coin equivalent
 */
export function formatPointsWithCamly(greenPoints: number): string {
  const camly = toCamlyCoin(greenPoints);
  return `${greenPoints.toLocaleString()} GP ≈ ${camly.toLocaleString()} CAMLY`;
}

/**
 * Format earned message for notifications
 */
export function formatEarnedMessage(greenPoints: number, language: 'en' | 'vi' = 'en'): string {
  const camly = toCamlyCoin(greenPoints);
  if (language === 'vi') {
    return `Bạn nhận được +${greenPoints} Green Points ≈ ${camly} CAMLY!`;
  }
  return `You earned +${greenPoints} Green Points ≈ ${camly} CAMLY!`;
}

/**
 * Generate mock transaction hash
 */
export function generateMockTransactionHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * Get action label for display
 */
export function getActionLabel(actionType: string, language: 'en' | 'vi' = 'en'): string {
  const labels: Record<string, { en: string; vi: string }> = {
    [ACTION_TYPES.PLANT_TREE]: { en: 'Plant Tree', vi: 'Trồng cây' },
    [ACTION_TYPES.DONATE]: { en: 'Donation', vi: 'Quyên góp' },
    [ACTION_TYPES.DAILY_CHECK_IN]: { en: 'Daily Check-in', vi: 'Điểm danh hàng ngày' },
    [ACTION_TYPES.COMPLETE_QUEST]: { en: 'Complete Quest', vi: 'Hoàn thành nhiệm vụ' },
    [ACTION_TYPES.SHARE_POST]: { en: 'Share Post', vi: 'Chia sẻ bài viết' },
    [ACTION_TYPES.VERIFY_TREE]: { en: 'Verify Tree Growth', vi: 'Xác minh cây' },
    [ACTION_TYPES.TOP_CONTRIBUTOR]: { en: 'Top Contributor Bonus', vi: 'Thưởng đóng góp cao' },
    [ACTION_TYPES.CAMPAIGN_COMPLETE]: { en: 'Campaign Completed', vi: 'Hoàn thành chiến dịch' },
    [ACTION_TYPES.POST_LIKE_RECEIVED]: { en: 'Post Liked', vi: 'Bài viết được thích' },
    [ACTION_TYPES.CREATE_POST]: { en: 'Create Post', vi: 'Tạo bài viết' },
  };
  
  return labels[actionType]?.[language] || actionType;
}
