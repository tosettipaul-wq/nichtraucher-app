/**
 * Gamification utilities for streak, achievements, XP
 */

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  icon_emoji: string;
  unlock_date: string;
}

export interface StreakData {
  current_streak: number;
  total_badges: number;
  xp_points: number;
}

export const ACHIEVEMENTS = {
  STREAK_7: {
    type: 'streak_7',
    name: '🥉 Bronze Badge',
    description: '7 Tage Streak erreicht',
    emoji: '🥉',
    threshold: 7,
  },
  STREAK_30: {
    type: 'streak_30',
    name: '🥈 Silver Badge',
    description: '30 Tage Streak erreicht',
    emoji: '🥈',
    threshold: 30,
  },
  STREAK_100: {
    type: 'streak_100',
    name: '🥇 Gold Badge',
    description: '100 Tage Streak erreicht',
    emoji: '🥇',
    threshold: 100,
  },
  STREAK_365: {
    type: 'streak_365',
    name: '💎 Platinum Badge',
    description: '1 Jahr rauchfrei!',
    emoji: '💎',
    threshold: 365,
  },
  WILLPOWER: {
    type: 'willpower',
    name: '💪 Willpower',
    description: 'Zero cravings heute',
    emoji: '💪',
    threshold: 1,
  },
  SOCIAL: {
    type: 'social',
    name: '👥 Social',
    description: 'Ersten Freund eingeladen',
    emoji: '👥',
    threshold: 1,
  },
};

/**
 * Calculate streak from quit_date
 * Returns number of days since quit_date
 */
export function calculateStreak(quitDate: Date | string): number {
  const quit = new Date(quitDate);
  const today = new Date();
  
  // Reset time to midnight for accurate day counting
  quit.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - quit.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Get badge icon and name for streak
 */
export function getBadgeForStreak(streak: number): Achievement | null {
  if (streak >= 365) {
    return {
      id: 'streak_365',
      user_id: '',
      achievement_type: 'streak_365',
      achievement_name: ACHIEVEMENTS.STREAK_365.name,
      description: ACHIEVEMENTS.STREAK_365.description,
      icon_emoji: ACHIEVEMENTS.STREAK_365.emoji,
      unlock_date: new Date().toISOString(),
    };
  }
  if (streak >= 100) {
    return {
      id: 'streak_100',
      user_id: '',
      achievement_type: 'streak_100',
      achievement_name: ACHIEVEMENTS.STREAK_100.name,
      description: ACHIEVEMENTS.STREAK_100.description,
      icon_emoji: ACHIEVEMENTS.STREAK_100.emoji,
      unlock_date: new Date().toISOString(),
    };
  }
  if (streak >= 30) {
    return {
      id: 'streak_30',
      user_id: '',
      achievement_type: 'streak_30',
      achievement_name: ACHIEVEMENTS.STREAK_30.name,
      description: ACHIEVEMENTS.STREAK_30.description,
      icon_emoji: ACHIEVEMENTS.STREAK_30.emoji,
      unlock_date: new Date().toISOString(),
    };
  }
  if (streak >= 7) {
    return {
      id: 'streak_7',
      user_id: '',
      achievement_type: 'streak_7',
      achievement_name: ACHIEVEMENTS.STREAK_7.name,
      description: ACHIEVEMENTS.STREAK_7.description,
      icon_emoji: ACHIEVEMENTS.STREAK_7.emoji,
      unlock_date: new Date().toISOString(),
    };
  }
  return null;
}

/**
 * Format streak for display
 */
export function formatStreak(days: number): string {
  if (days === 0) return '0';
  if (days === 1) return '1 Tag';
  if (days < 7) return `${days} Tage`;
  if (days < 30) return `${Math.floor(days / 7)} Wochen`;
  if (days < 365) return `${Math.floor(days / 30)} Monate`;
  return `${(days / 365).toFixed(1)} Jahre`;
}

/**
 * Calculate XP for daily action
 */
export function calculateXP(action: 'craving_logged' | 'craving_resisted' | 'weekly_milestone'): number {
  const xpMap = {
    craving_logged: 10,
    craving_resisted: 50,
    weekly_milestone: 100,
  };
  return xpMap[action];
}

/**
 * Calculate level from XP
 */
export function getLevelFromXP(xp: number): { level: number; nextLevelXP: number; progressPercent: number } {
  const XP_PER_LEVEL = 500;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const nextLevelXP = level * XP_PER_LEVEL;
  const currentLevelXP = (level - 1) * XP_PER_LEVEL;
  const progressPercent = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  
  return {
    level,
    nextLevelXP,
    progressPercent: Math.min(100, progressPercent),
  };
}
