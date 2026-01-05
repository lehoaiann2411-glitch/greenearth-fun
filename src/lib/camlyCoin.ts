// ===== CAMLY COIN REWARDS SYSTEM =====
// Direct Camly Coin rewards - no conversion needed

// Camly Coin rewards for different actions
export const CAMLY_REWARDS = {
  // Social Actions
  CREATE_POST: 3000,           // Post about environment
  SHARE_POST: 1500,            // Share campaign/post
  LIKE_POST: 200,              // Like a post
  
  // Daily Streak
  DAILY_CHECK_IN: 500,         // Daily check-in (flat)
  STREAK_7_DAY_BONUS: 2000,    // 7-day streak bonus
  
  // Main Actions
  SIGNUP_BONUS: 10000,         // Signup bonus
  PLANT_TREE: 5000,            // Plant tree/upload proof
  UPDATE_TREE: 3000,           // Update tree growth
  INVITE_FRIEND: 5000,         // Invite friend
  
  // Quest Range
  QUEST_MIN: 1000,
  QUEST_MAX: 3000,
  
  // Donate: 100 CAMLY per USD
  DONATE_PER_USD: 100,
};

// Daily limits to prevent spam
export const DAILY_LIMITS = {
  SHARES: 10,      // Max 10 shares/day
  LIKES: 50,       // Max 50 likes/day
};

// Action type keys for tracking
export const ACTION_TYPES = {
  CREATE_POST: 'create_post',
  SHARE_POST: 'share_post',
  LIKE_POST: 'like_post',
  DAILY_CHECK_IN: 'daily_check_in',
  STREAK_BONUS: 'streak_bonus',
  SIGNUP_BONUS: 'signup_bonus',
  PLANT_TREE: 'plant_tree',
  UPDATE_TREE: 'update_tree',
  INVITE_FRIEND: 'invite_friend',
  DONATE: 'donate',
  COMPLETE_QUEST: 'complete_quest',
  CAMPAIGN_COMPLETE: 'campaign_complete',
  TOP_CONTRIBUTOR: 'top_contributor',
};

/**
 * Format Camly Coin for display
 */
export function formatCamly(amount: number): string {
  return amount.toLocaleString();
}

/**
 * Format earned message for notifications
 */
export function formatEarnedMessage(camlyAmount: number, action: string, language: 'en' | 'vi' = 'en'): string {
  const actionLabels = getActionLabels(language);
  const label = actionLabels[action] || action;
  
  if (language === 'vi') {
    return `Yay! +${formatCamly(camlyAmount)} Camly Coin cho ${label}! 🎉`;
  }
  return `Yay! +${formatCamly(camlyAmount)} Camly Coin for ${label}! 🎉`;
}

/**
 * Get action labels for display
 */
export function getActionLabels(language: 'en' | 'vi' = 'en'): Record<string, string> {
  if (language === 'vi') {
    return {
      [ACTION_TYPES.CREATE_POST]: 'đăng bài',
      [ACTION_TYPES.SHARE_POST]: 'chia sẻ',
      [ACTION_TYPES.LIKE_POST]: 'thích bài viết',
      [ACTION_TYPES.DAILY_CHECK_IN]: 'điểm danh',
      [ACTION_TYPES.STREAK_BONUS]: 'streak 7 ngày',
      [ACTION_TYPES.SIGNUP_BONUS]: 'đăng ký',
      [ACTION_TYPES.PLANT_TREE]: 'trồng cây',
      [ACTION_TYPES.UPDATE_TREE]: 'cập nhật cây',
      [ACTION_TYPES.INVITE_FRIEND]: 'mời bạn',
      [ACTION_TYPES.DONATE]: 'quyên góp',
      [ACTION_TYPES.COMPLETE_QUEST]: 'hoàn thành nhiệm vụ',
      [ACTION_TYPES.CAMPAIGN_COMPLETE]: 'hoàn thành chiến dịch',
      [ACTION_TYPES.TOP_CONTRIBUTOR]: 'top đóng góp',
    };
  }
  return {
    [ACTION_TYPES.CREATE_POST]: 'posting',
    [ACTION_TYPES.SHARE_POST]: 'sharing',
    [ACTION_TYPES.LIKE_POST]: 'liking',
    [ACTION_TYPES.DAILY_CHECK_IN]: 'check-in',
    [ACTION_TYPES.STREAK_BONUS]: '7-day streak',
    [ACTION_TYPES.SIGNUP_BONUS]: 'signing up',
    [ACTION_TYPES.PLANT_TREE]: 'planting tree',
    [ACTION_TYPES.UPDATE_TREE]: 'tree update',
    [ACTION_TYPES.INVITE_FRIEND]: 'inviting friend',
    [ACTION_TYPES.DONATE]: 'donation',
    [ACTION_TYPES.COMPLETE_QUEST]: 'completing quest',
    [ACTION_TYPES.CAMPAIGN_COMPLETE]: 'campaign complete',
    [ACTION_TYPES.TOP_CONTRIBUTOR]: 'top contributor',
  };
}

/**
 * Get action label for single action
 */
export function getActionLabel(actionType: string, language: 'en' | 'vi' = 'en'): string {
  const labels = getActionLabels(language);
  return labels[actionType] || actionType;
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

// ===== LEGACY SUPPORT (for backwards compatibility) =====
export const GREEN_POINTS_PER_CAMLY = 10;
export const MINIMUM_CLAIM_POINTS = 100;

export const POINTS_CONFIG = {
  PLANT_TREE: 50,
  DONATE_PER_USD: 10,
  DAILY_CHECK_IN: 5,
  COMPLETE_QUEST: 10,
  SHARE_POST: 2,
  VERIFY_TREE_GROWTH: 15,
  TOP_CONTRIBUTOR_BONUS: 200,
};

export function toCamlyCoin(greenPoints: number): number {
  return Math.floor(greenPoints / GREEN_POINTS_PER_CAMLY);
}

export function canClaim(greenPoints: number): boolean {
  return greenPoints >= MINIMUM_CLAIM_POINTS;
}

export function getClaimableAmount(greenPoints: number): { points: number; camly: number } {
  if (!canClaim(greenPoints)) {
    return { points: 0, camly: 0 };
  }
  const claimablePoints = Math.floor(greenPoints / GREEN_POINTS_PER_CAMLY) * GREEN_POINTS_PER_CAMLY;
  return {
    points: claimablePoints,
    camly: claimablePoints / GREEN_POINTS_PER_CAMLY,
  };
}

export function formatPointsWithCamly(greenPoints: number): string {
  const camly = toCamlyCoin(greenPoints);
  return `${greenPoints.toLocaleString()} GP ≈ ${camly.toLocaleString()} CAMLY`;
}
