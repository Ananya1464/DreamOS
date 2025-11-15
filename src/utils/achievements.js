// Achievement System - Unlock badges and rewards! 🏆
import { loadFromStorage, saveToStorage } from './storage';
import { addXP } from './xpSystem';

const ACHIEVEMENTS_KEY = 'achievements';

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_SESSION: {
    id: 'first_session',
    title: '🌱 First Steps',
    description: 'Complete your first study session',
    xpReward: 50,
    icon: '🌱',
    rarity: 'common'
  },
  EARLY_BIRD: {
    id: 'early_bird',
    title: '🌅 Early Bird',
    description: 'Study before 6 AM',
    xpReward: 100,
    icon: '🌅',
    rarity: 'uncommon'
  },
  NIGHT_OWL: {
    id: 'night_owl',
    title: '🦉 Night Owl',
    description: 'Study after midnight',
    xpReward: 100,
    icon: '🦉',
    rarity: 'uncommon'
  },
  WEEK_STREAK: {
    id: 'week_streak',
    title: '🔥 Week Warrior',
    description: 'Maintain a 7-day study streak',
    xpReward: 200,
    icon: '🔥',
    rarity: 'rare'
  },
  MONTH_STREAK: {
    id: 'month_streak',
    title: '💪 Unstoppable',
    description: 'Maintain a 30-day study streak',
    xpReward: 500,
    icon: '💪',
    rarity: 'epic'
  },
  MARATHON: {
    id: 'marathon',
    title: '⏰ Marathon Runner',
    description: 'Study for 4+ hours in one day',
    xpReward: 300,
    icon: '⏰',
    rarity: 'rare'
  },
  SUBJECT_MASTER: {
    id: 'subject_master',
    title: '🎓 Subject Master',
    description: 'Complete all topics in a subject',
    xpReward: 400,
    icon: '🎓',
    rarity: 'epic'
  },
  LUNA_FRIEND: {
    id: 'luna_friend',
    title: '🤖 Luna\'s Friend',
    description: 'Have 50 conversations with Luna AI',
    xpReward: 250,
    icon: '🤖',
    rarity: 'rare'
  },
  WEEKEND_WARRIOR: {
    id: 'weekend_warrior',
    title: '💪 Weekend Warrior',
    description: 'Study on both Saturday and Sunday',
    xpReward: 150,
    icon: '💪',
    rarity: 'uncommon'
  },
  PERFECT_WEEK: {
    id: 'perfect_week',
    title: '⭐ Perfect Week',
    description: 'Study all 7 days of the week',
    xpReward: 300,
    icon: '⭐',
    rarity: 'epic'
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    title: '⚡ Speed Demon',
    description: 'Complete 10 topics in one day',
    xpReward: 200,
    icon: '⚡',
    rarity: 'rare'
  },
  KNOWLEDGE_SEEKER: {
    id: 'knowledge_seeker',
    title: '📚 Knowledge Seeker',
    description: 'Study 5 different subjects',
    xpReward: 250,
    icon: '📚',
    rarity: 'rare'
  },
  EXAM_WARRIOR: {
    id: 'exam_warrior',
    title: '🎯 Exam Warrior',
    description: 'Complete exam preparation for 3 subjects',
    xpReward: 350,
    icon: '🎯',
    rarity: 'epic'
  },
  CONSISTENT_LEARNER: {
    id: 'consistent_learner',
    title: '📈 Consistent Learner',
    description: 'Study every day for 14 days',
    xpReward: 400,
    icon: '📈',
    rarity: 'epic'
  },
  LEVEL_10: {
    id: 'level_10',
    title: '🏅 Rising Star',
    description: 'Reach level 10',
    xpReward: 500,
    icon: '🏅',
    rarity: 'epic'
  },
  LEVEL_25: {
    id: 'level_25',
    title: '👑 Legend',
    description: 'Reach level 25',
    xpReward: 1000,
    icon: '👑',
    rarity: 'legendary'
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    title: '🦋 Social Butterfly',
    description: 'Share 10 study milestones',
    xpReward: 150,
    icon: '🦋',
    rarity: 'uncommon'
  },
  NOTE_TAKER: {
    id: 'note_taker',
    title: '📝 Note Taker',
    description: 'Take notes in 20 study sessions',
    xpReward: 200,
    icon: '📝',
    rarity: 'rare'
  },
  HABIT_BUILDER: {
    id: 'habit_builder',
    title: '🎯 Habit Builder',
    description: 'Complete 50 daily habits',
    xpReward: 300,
    icon: '🎯',
    rarity: 'epic'
  },
  CONTENT_CONSUMER: {
    id: 'content_consumer',
    title: '📱 Content Warrior',
    description: 'Watch 100 educational videos',
    xpReward: 250,
    icon: '📱',
    rarity: 'rare'
  }
};

/**
 * Get user's unlocked achievements
 */
export const getUnlockedAchievements = () => {
  const data = loadFromStorage(ACHIEVEMENTS_KEY) || {};
  return data.unlocked || [];
};

/**
 * Check if achievement is unlocked
 */
export const isAchievementUnlocked = (achievementId) => {
  const unlocked = getUnlockedAchievements();
  return unlocked.some(a => a.id === achievementId);
};

/**
 * Unlock achievement
 */
export const unlockAchievement = (achievementId) => {
  if (isAchievementUnlocked(achievementId)) {
    return null; // Already unlocked
  }
  
  const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
  if (!achievement) {
    console.error(`Achievement ${achievementId} not found`);
    return null;
  }
  
  const data = loadFromStorage(ACHIEVEMENTS_KEY) || { unlocked: [] };
  
  const unlockedAchievement = {
    ...achievement,
    unlockedAt: new Date().toISOString()
  };
  
  data.unlocked.push(unlockedAchievement);
  saveToStorage(ACHIEVEMENTS_KEY, data);
  
  // Award XP
  if (achievement.xpReward) {
    addXP(achievement.xpReward, `Achievement unlocked: ${achievement.title}`);
  }
  
  console.log(`🏆 Achievement unlocked: ${achievement.title}`);
  return unlockedAchievement;
};

/**
 * Get achievement progress
 */
export const getAchievementProgress = () => {
  const unlocked = getUnlockedAchievements();
  const total = Object.keys(ACHIEVEMENTS).length;
  const percentage = Math.floor((unlocked.length / total) * 100);
  
  return {
    unlocked: unlocked.length,
    total,
    percentage,
    remaining: total - unlocked.length
  };
};

/**
 * Get achievements by rarity
 */
export const getAchievementsByRarity = (rarity) => {
  return Object.values(ACHIEVEMENTS).filter(a => a.rarity === rarity);
};

/**
 * Get rarity color
 */
export const getRarityColor = (rarity) => {
  const colors = {
    common: '#B8B8B8',
    uncommon: '#90C8E8',
    rare: '#FFB4D1',
    epic: '#B5A3E5',
    legendary: '#FFD700'
  };
  return colors[rarity] || colors.common;
};

/**
 * Get rarity name
 */
export const getRarityName = (rarity) => {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
};

/**
 * Check and unlock achievements based on activity
 */
export const checkAchievements = (activityType, data = {}) => {
  const newUnlocks = [];
  
  switch (activityType) {
    case 'first_session':
      if (!isAchievementUnlocked('first_session')) {
        newUnlocks.push(unlockAchievement('first_session'));
      }
      break;
      
    case 'early_morning':
      if (new Date().getHours() < 6 && !isAchievementUnlocked('early_bird')) {
        newUnlocks.push(unlockAchievement('early_bird'));
      }
      break;
      
    case 'late_night':
      if (new Date().getHours() >= 0 && new Date().getHours() < 6 && !isAchievementUnlocked('night_owl')) {
        newUnlocks.push(unlockAchievement('night_owl'));
      }
      break;
      
    case 'streak':
      if (data.days === 7 && !isAchievementUnlocked('week_streak')) {
        newUnlocks.push(unlockAchievement('week_streak'));
      }
      if (data.days === 14 && !isAchievementUnlocked('consistent_learner')) {
        newUnlocks.push(unlockAchievement('consistent_learner'));
      }
      if (data.days === 30 && !isAchievementUnlocked('month_streak')) {
        newUnlocks.push(unlockAchievement('month_streak'));
      }
      break;
      
    case 'marathon':
      if (data.hours >= 4 && !isAchievementUnlocked('marathon')) {
        newUnlocks.push(unlockAchievement('marathon'));
      }
      break;
      
    case 'subject_complete':
      if (!isAchievementUnlocked('subject_master')) {
        newUnlocks.push(unlockAchievement('subject_master'));
      }
      break;
      
    case 'level_up':
      if (data.level === 10 && !isAchievementUnlocked('level_10')) {
        newUnlocks.push(unlockAchievement('level_10'));
      }
      if (data.level === 25 && !isAchievementUnlocked('level_25')) {
        newUnlocks.push(unlockAchievement('level_25'));
      }
      break;
      
    case 'ai_chat':
      if (data.count >= 50 && !isAchievementUnlocked('luna_friend')) {
        newUnlocks.push(unlockAchievement('luna_friend'));
      }
      break;
  }
  
  return newUnlocks.filter(Boolean);
};

/**
 * Get next achievable achievements (suggestions)
 */
export const getNextAchievements = (limit = 3) => {
  const unlocked = getUnlockedAchievements().map(a => a.id);
  const available = Object.values(ACHIEVEMENTS).filter(a => !unlocked.includes(a.id));
  
  // Sort by rarity (common first, easier to unlock)
  const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
  available.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
  
  return available.slice(0, limit);
};

/**
 * Reset achievements (for testing)
 */
export const resetAchievements = () => {
  saveToStorage(ACHIEVEMENTS_KEY, { unlocked: [] });
  console.log('🔄 Achievements reset');
};
