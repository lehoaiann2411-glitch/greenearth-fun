// ===== CAMLY COIN REWARDS SYSTEM =====
// Direct Camly Coin rewards - no conversion needed

// Camly Coin rewards for different actions
export const CAMLY_REWARDS = {
  // Social Actions
  CREATE_POST: 3000,           // Post about environment
  CREATE_POST_WITH_IMAGE: 4000, // Post with image
  CREATE_POST_WITH_POLL: 3500, // Post with poll
  SHARE_POST: 1500,            // Share campaign/post
  LIKE_POST: 200,              // Like a post (legacy)
  REACT_POST: 200,             // React to a post
  
  // Poll Actions
  CREATE_POLL: 500,            // Create a poll
  VOTE_POLL: 50,               // Vote in poll
  
  // Story Actions
  CREATE_STORY: 1000,          // Create story
  VIEW_STORY: 50,              // View story
  
  // Comment Actions
  CREATE_COMMENT: 300,         // Comment on post
  REPLY_COMMENT: 200,          // Reply to comment
  
  // Daily Streak
  DAILY_CHECK_IN: 500,         // Daily check-in (flat)
  STREAK_7_DAY_BONUS: 2000,    // 7-day streak bonus
  STREAK_30_DAY_BONUS: 5000,   // 30-day streak bonus
  
  // Main Actions
  SIGNUP_BONUS: 10000,         // Signup bonus
  PLANT_TREE: 5000,            // Plant tree/upload proof
  UPDATE_TREE: 3000,           // Update tree growth
  INVITE_FRIEND: 5000,         // Invite friend
  FOLLOW_USER: 100,            // Follow a user
  
  // Campaign Actions
  JOIN_CAMPAIGN: 5000,         // Join campaign
  COMPLETE_CAMPAIGN: 10000,    // Complete campaign
  
  // Quest Range
  QUEST_MIN: 1000,
  QUEST_MAX: 3000,
  
  // Donate: 100 CAMLY per USD
  DONATE_PER_USD: 100,
  DONATE_TREE: 50000,          // Donate to plant tree
};

// Daily limits to prevent spam
export const DAILY_LIMITS = {
  SHARES: 10,       // Max 10 shares/day
  LIKES: 50,        // Max 50 likes/day (legacy)
  REACTIONS: 50,    // Max 50 reactions/day
  POLL_VOTES: 20,   // Max 20 poll votes/day
  COMMENTS: 30,     // Max 30 comments/day
  STORY_VIEWS: 100, // Max 100 story views/day
};

// Action type keys for tracking
export const ACTION_TYPES = {
  CREATE_POST: 'create_post',
  CREATE_POST_WITH_IMAGE: 'create_post_with_image',
  CREATE_POST_WITH_POLL: 'create_post_with_poll',
  SHARE_POST: 'share_post',
  LIKE_POST: 'like_post',
  REACT_POST: 'react_post',
  CREATE_POLL: 'create_poll',
  VOTE_POLL: 'vote_poll',
  CREATE_STORY: 'create_story',
  VIEW_STORY: 'view_story',
  CREATE_COMMENT: 'create_comment',
  REPLY_COMMENT: 'reply_comment',
  DAILY_CHECK_IN: 'daily_check_in',
  STREAK_BONUS: 'streak_bonus',
  SIGNUP_BONUS: 'signup_bonus',
  PLANT_TREE: 'plant_tree',
  UPDATE_TREE: 'update_tree',
  INVITE_FRIEND: 'invite_friend',
  FOLLOW_USER: 'follow_user',
  JOIN_CAMPAIGN: 'join_campaign',
  COMPLETE_CAMPAIGN: 'complete_campaign',
  DONATE: 'donate',
  DONATE_TREE: 'donate_tree',
  COMPLETE_QUEST: 'complete_quest',
  CAMPAIGN_COMPLETE: 'campaign_complete',
  TOP_CONTRIBUTOR: 'top_contributor',
};

// Reaction types for posts
export const REACTION_TYPES = {
  LEAF: 'leaf',
  LOVE: 'love',
  CARE: 'care',
  HAHA: 'haha',
  WOW: 'wow',
  SAD: 'sad',
  ANGRY: 'angry',
} as const;

// Reaction emojis mapping
export const REACTION_EMOJIS: Record<string, string> = {
  leaf: '🍃',
  love: '❤️',
  care: '🤗',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😠',
};

// Feelings for posts
export const FEELINGS = [
  { id: 'grateful', emoji: '🌱', label: 'grateful', label_vi: 'biết ơn' },
  { id: 'eco_conscious', emoji: '💚', label: 'eco-conscious', label_vi: 'ý thức xanh' },
  { id: 'tree_hugging', emoji: '🌳', label: 'tree-hugging', label_vi: 'yêu cây' },
  { id: 'sustainable', emoji: '🌍', label: 'sustainable', label_vi: 'bền vững' },
  { id: 'inspired', emoji: '✨', label: 'inspired', label_vi: 'được truyền cảm hứng' },
  { id: 'proud', emoji: '🏆', label: 'proud', label_vi: 'tự hào' },
  { id: 'hopeful', emoji: '🌈', label: 'hopeful', label_vi: 'hy vọng' },
  { id: 'energized', emoji: '⚡', label: 'energized', label_vi: 'tràn đầy năng lượng' },
  { id: 'peaceful', emoji: '🕊️', label: 'peaceful', label_vi: 'bình yên' },
  { id: 'adventurous', emoji: '🏔️', label: 'adventurous', label_vi: 'phiêu lưu' },
  { id: 'blessed', emoji: '🙏', label: 'blessed', label_vi: 'may mắn' },
  { id: 'motivated', emoji: '🔥', label: 'motivated', label_vi: 'có động lực' },
] as const;

// Poll duration options
export const POLL_DURATIONS = [
  { value: 1, label: '1 day', label_vi: '1 ngày' },
  { value: 3, label: '3 days', label_vi: '3 ngày' },
  { value: 7, label: '7 days', label_vi: '7 ngày' },
  { value: 0, label: 'No limit', label_vi: 'Không giới hạn' },
] as const;

/**
 * Format Camly Coin for display
 */
export function formatCamly(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toLocaleString();
}

/**
 * Format earned message for notifications
 */
export function formatEarnedMessage(camlyAmount: number, action: string, language: 'en' | 'vi' = 'en'): string {
  const actionLabels = getActionLabels(language);
  const label = actionLabels[action] || action;
  
  if (language === 'vi') {
    return `+${formatCamly(camlyAmount)} 🪙 từ ${label}`;
  }
  return `+${formatCamly(camlyAmount)} 🪙 from ${label}`;
}

/**
 * Get action labels for display
 */
export function getActionLabels(language: 'en' | 'vi' = 'en'): Record<string, string> {
  if (language === 'vi') {
    return {
      [ACTION_TYPES.CREATE_POST]: 'đăng bài',
      [ACTION_TYPES.CREATE_POST_WITH_IMAGE]: 'đăng bài có ảnh',
      [ACTION_TYPES.CREATE_POST_WITH_POLL]: 'tạo khảo sát',
      [ACTION_TYPES.SHARE_POST]: 'chia sẻ',
      [ACTION_TYPES.LIKE_POST]: 'thích bài viết',
      [ACTION_TYPES.REACT_POST]: 'thả cảm xúc',
      [ACTION_TYPES.CREATE_POLL]: 'tạo khảo sát',
      [ACTION_TYPES.VOTE_POLL]: 'bình chọn',
      [ACTION_TYPES.CREATE_STORY]: 'đăng story',
      [ACTION_TYPES.VIEW_STORY]: 'xem story',
      [ACTION_TYPES.CREATE_COMMENT]: 'bình luận',
      [ACTION_TYPES.REPLY_COMMENT]: 'trả lời bình luận',
      [ACTION_TYPES.DAILY_CHECK_IN]: 'điểm danh',
      [ACTION_TYPES.STREAK_BONUS]: 'streak 7 ngày',
      [ACTION_TYPES.SIGNUP_BONUS]: 'đăng ký',
      [ACTION_TYPES.PLANT_TREE]: 'trồng cây',
      [ACTION_TYPES.UPDATE_TREE]: 'cập nhật cây',
      [ACTION_TYPES.INVITE_FRIEND]: 'mời bạn',
      [ACTION_TYPES.FOLLOW_USER]: 'theo dõi',
      [ACTION_TYPES.JOIN_CAMPAIGN]: 'tham gia chiến dịch',
      [ACTION_TYPES.COMPLETE_CAMPAIGN]: 'hoàn thành chiến dịch',
      [ACTION_TYPES.DONATE]: 'quyên góp',
      [ACTION_TYPES.DONATE_TREE]: 'quyên góp cây',
      [ACTION_TYPES.COMPLETE_QUEST]: 'hoàn thành nhiệm vụ',
      [ACTION_TYPES.CAMPAIGN_COMPLETE]: 'hoàn thành chiến dịch',
      [ACTION_TYPES.TOP_CONTRIBUTOR]: 'top đóng góp',
    };
  }
  return {
    [ACTION_TYPES.CREATE_POST]: 'posting',
    [ACTION_TYPES.CREATE_POST_WITH_IMAGE]: 'posting with image',
    [ACTION_TYPES.CREATE_POST_WITH_POLL]: 'creating poll',
    [ACTION_TYPES.SHARE_POST]: 'sharing',
    [ACTION_TYPES.LIKE_POST]: 'liking',
    [ACTION_TYPES.REACT_POST]: 'reacting',
    [ACTION_TYPES.CREATE_POLL]: 'creating poll',
    [ACTION_TYPES.VOTE_POLL]: 'voting',
    [ACTION_TYPES.CREATE_STORY]: 'creating story',
    [ACTION_TYPES.VIEW_STORY]: 'viewing story',
    [ACTION_TYPES.CREATE_COMMENT]: 'commenting',
    [ACTION_TYPES.REPLY_COMMENT]: 'replying',
    [ACTION_TYPES.DAILY_CHECK_IN]: 'check-in',
    [ACTION_TYPES.STREAK_BONUS]: '7-day streak',
    [ACTION_TYPES.SIGNUP_BONUS]: 'signing up',
    [ACTION_TYPES.PLANT_TREE]: 'planting tree',
    [ACTION_TYPES.UPDATE_TREE]: 'tree update',
    [ACTION_TYPES.INVITE_FRIEND]: 'inviting friend',
    [ACTION_TYPES.FOLLOW_USER]: 'following',
    [ACTION_TYPES.JOIN_CAMPAIGN]: 'joining campaign',
    [ACTION_TYPES.COMPLETE_CAMPAIGN]: 'completing campaign',
    [ACTION_TYPES.DONATE]: 'donation',
    [ACTION_TYPES.DONATE_TREE]: 'donating tree',
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
