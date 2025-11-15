// XP & Leveling System - Gamify learning! 🎮
import { loadFromStorage, saveToStorage } from './storage';

const XP_KEY = 'xp_data';

// XP rewards for different actions
export const XP_REWARDS = {
  STUDY_SESSION_15MIN: 10,
  STUDY_SESSION_30MIN: 25,
  STUDY_SESSION_1HR: 50,
  STUDY_SESSION_2HR: 120,
  TOPIC_COMPLETED: 30,
  SUBJECT_MASTERED: 200,
  DAILY_STREAK: 20,
  WEEKLY_STREAK: 100,
  MONTHLY_STREAK: 500,
  EARLY_BIRD: 15,      // Study before 8 AM
  NIGHT_OWL: 15,       // Study after 10 PM
  WEEKEND_WARRIOR: 25, // Study on weekend
  PERFECT_WEEK: 150,   // All 7 days
  EXAM_PREPARATION: 40,
  NOTES_TAKEN: 5,
  AI_CHAT: 5,
  HELP_OTHERS: 50
};

// Level thresholds (XP required to reach each level)
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  850,    // Level 5
  1300,   // Level 6
  1850,   // Level 7
  2500,   // Level 8
  3250,   // Level 9
  4100,   // Level 10
  5050,   // Level 11
  6100,   // Level 12
  7250,   // Level 13
  8500,   // Level 14
  9850,   // Level 15
  11300,  // Level 16
  12850,  // Level 17
  14500,  // Level 18
  16250,  // Level 19
  18100,  // Level 20
  20000,  // Level 21
  22500,  // Level 22
  25000,  // Level 23
  28000,  // Level 24
  31000,  // Level 25
  35000,  // Level 26+
];

/**
 * Get current XP data
 */
export const getXPData = () => {
  const data = loadFromStorage(XP_KEY);
  return data || {
    totalXP: 0,
    level: 1,
    xpHistory: [],
    achievements: [],
    streaks: {
      current: 0,
      longest: 0,
      lastStudyDate: null
    }
  };
};

/**
 * Add XP and check for level up
 * @param {number} amount - XP to add
 * @param {string} reason - Why XP was earned
 * @returns {object} - { leveledUp: boolean, newLevel: number, xpGained: number }
 */
export const addXP = (amount, reason = '') => {
  const data = getXPData();
  const oldLevel = data.level;
  
  data.totalXP += amount;
  
  // Calculate new level
  let newLevel = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (data.totalXP >= LEVEL_THRESHOLDS[i]) {
      newLevel = i + 1;
    } else {
      break;
    }
  }
  
  const leveledUp = newLevel > oldLevel;
  data.level = newLevel;
  
  // Record XP gain
  data.xpHistory.push({
    amount,
    reason,
    timestamp: new Date().toISOString(),
    totalAfter: data.totalXP
  });
  
  // Keep only last 100 XP gains
  if (data.xpHistory.length > 100) {
    data.xpHistory = data.xpHistory.slice(-100);
  }
  
  saveToStorage(XP_KEY, data);
  
  console.log(`🎮 +${amount} XP earned! ${reason || ''}`);
  if (leveledUp) {
    console.log(`🎉 LEVEL UP! You're now level ${newLevel}!`);
  }
  
  return {
    leveledUp,
    newLevel,
    xpGained: amount,
    totalXP: data.totalXP
  };
};

/**
 * Get XP needed for next level
 */
export const getXPForNextLevel = () => {
  const data = getXPData();
  const currentLevel = data.level;
  
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    // Max level or beyond
    const lastThreshold = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const increment = 5000; // Each level after max requires 5000 more XP
    return lastThreshold + (currentLevel - LEVEL_THRESHOLDS.length + 1) * increment;
  }
  
  return LEVEL_THRESHOLDS[currentLevel];
};

/**
 * Get progress to next level (0-1)
 */
export const getLevelProgress = () => {
  const data = getXPData();
  const currentLevelXP = LEVEL_THRESHOLDS[data.level - 1] || 0;
  const nextLevelXP = getXPForNextLevel();
  const xpIntoLevel = data.totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  
  return xpIntoLevel / xpNeededForLevel;
};

/**
 * Award XP based on study duration
 */
export const awardStudySessionXP = (durationMinutes) => {
  let xpAmount = 0;
  let reason = '';
  
  if (durationMinutes >= 120) {
    xpAmount = XP_REWARDS.STUDY_SESSION_2HR;
    reason = '2+ hour study session! 🔥';
  } else if (durationMinutes >= 60) {
    xpAmount = XP_REWARDS.STUDY_SESSION_1HR;
    reason = '1 hour study session! 💪';
  } else if (durationMinutes >= 30) {
    xpAmount = XP_REWARDS.STUDY_SESSION_30MIN;
    reason = '30 min study session! ⏰';
  } else if (durationMinutes >= 15) {
    xpAmount = XP_REWARDS.STUDY_SESSION_15MIN;
    reason = '15 min study session! 📚';
  }
  
  // Bonus XP for time of day
  const hour = new Date().getHours();
  if (hour < 8) {
    xpAmount += XP_REWARDS.EARLY_BIRD;
    reason += ' + Early Bird Bonus! 🌅';
  } else if (hour >= 22) {
    xpAmount += XP_REWARDS.NIGHT_OWL;
    reason += ' + Night Owl Bonus! 🦉';
  }
  
  // Bonus XP for weekend
  const day = new Date().getDay();
  if (day === 0 || day === 6) {
    xpAmount += XP_REWARDS.WEEKEND_WARRIOR;
    reason += ' + Weekend Warrior! 💪';
  }
  
  return addXP(xpAmount, reason);
};

/**
 * Update daily streak
 */
export const updateStreak = () => {
  const data = getXPData();
  const today = new Date().toDateString();
  const lastStudy = data.streaks.lastStudyDate;
  
  if (lastStudy === today) {
    // Already studied today
    return data.streaks;
  }
  
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (lastStudy === yesterday) {
    // Continuing streak
    data.streaks.current += 1;
    addXP(XP_REWARDS.DAILY_STREAK, `${data.streaks.current} day streak! 🔥`);
  } else if (lastStudy === null) {
    // First time
    data.streaks.current = 1;
  } else {
    // Streak broken
    data.streaks.current = 1;
  }
  
  data.streaks.lastStudyDate = today;
  
  if (data.streaks.current > data.streaks.longest) {
    data.streaks.longest = data.streaks.current;
  }
  
  // Milestone streak bonuses
  if (data.streaks.current === 7) {
    addXP(XP_REWARDS.WEEKLY_STREAK, 'Weekly streak unlocked! 🎉');
  } else if (data.streaks.current === 30) {
    addXP(XP_REWARDS.MONTHLY_STREAK, 'Monthly streak unlocked! 🏆');
  }
  
  saveToStorage(XP_KEY, data);
  return data.streaks;
};

/**
 * Get rank title based on level
 */
export const getRankTitle = (level = null) => {
  const currentLevel = level || getXPData().level;
  
  if (currentLevel >= 25) return '🏆 Legend';
  if (currentLevel >= 20) return '👑 Master';
  if (currentLevel >= 15) return '⭐ Expert';
  if (currentLevel >= 10) return '💎 Advanced';
  if (currentLevel >= 5) return '📚 Scholar';
  return '🌱 Beginner';
};

/**
 * Get XP statistics
 */
export const getXPStats = () => {
  const data = getXPData();
  const progress = getLevelProgress();
  const xpForNext = getXPForNextLevel();
  const currentLevelXP = LEVEL_THRESHOLDS[data.level - 1] || 0;
  const xpIntoLevel = data.totalXP - currentLevelXP;
  const xpNeededForLevel = xpForNext - currentLevelXP;
  
  return {
    totalXP: data.totalXP,
    level: data.level,
    rankTitle: getRankTitle(),
    progressPercent: Math.floor(progress * 100),
    xpIntoLevel,
    xpNeededForLevel,
    xpForNextLevel: xpForNext,
    streaks: data.streaks,
    recentGains: data.xpHistory.slice(-10).reverse()
  };
};

/**
 * Reset XP (for testing or user request)
 */
export const resetXP = () => {
  saveToStorage(XP_KEY, {
    totalXP: 0,
    level: 1,
    xpHistory: [],
    achievements: [],
    streaks: {
      current: 0,
      longest: 0,
      lastStudyDate: null
    }
  });
  console.log('🔄 XP reset to level 1');
};
