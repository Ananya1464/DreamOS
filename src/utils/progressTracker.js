// ═══════════════════════════════════════════════════════════════
// REAL-TIME PROGRESS TRACKER 📊
// Tracks actual progress with timestamps and analytics
// ═══════════════════════════════════════════════════════════════

import { loadSubjects, saveSubjects, loadUser, saveUser } from './storage';

/**
 * Initialize fresh progress (start from zero)
 */
export const initializeFreshProgress = () => {
  const subjects = loadSubjects() || {};
  
  Object.keys(subjects).forEach(subjectId => {
    const subject = subjects[subjectId];
    
    // Reset all topics to 0%
    if (subject.topics) {
      subject.topics = subject.topics.map(topic => ({
        ...topic,
        mastery: 0,
        timeSpent: 0,
        lastStudied: null,
        studySessions: [],
        revisions: {
          r1: { completed: false, date: null, timeSpent: 0 },
          r2: { completed: false, date: null, timeSpent: 0 },
          r3: { completed: false, date: null, timeSpent: 0 }
        }
      }));
    }
    
    subject.overallProgress = 0;
    subject.lastUpdated = new Date().toISOString();
  });
  
  saveSubjects(subjects);
  
  // Reset user stats
  const user = loadUser() || {};
  user.currentStreak = 0;
  user.totalStudyHours = 0;
  user.lastActivityDate = null;
  saveUser(user);
  
  console.log('✅ Progress reset to zero');
  return true;
};

/**
 * Start a study session
 * @param {string} subjectId - Subject ID
 * @param {string} topicId - Topic ID
 * @returns {object} - Session details
 */
export const startStudySession = (subjectId, topicId) => {
  const subjects = loadSubjects() || {};
  const subject = subjects[subjectId];
  
  if (!subject) {
    return { success: false, error: 'Subject not found' };
  }
  
  const topic = subject.topics?.find(t => t.id === topicId);
  if (!topic) {
    return { success: false, error: 'Topic not found' };
  }
  
  const session = {
    id: `session_${Date.now()}`,
    subjectId,
    subjectName: subject.name,
    topicId,
    topicName: topic.name,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    status: 'active'
  };
  
  // Store active session
  localStorage.setItem('active_study_session', JSON.stringify(session));
  
  // Update last activity
  updateLastActivity();
  
  return { success: true, session };
};

/**
 * End study session and update progress
 * @param {number} masteryGained - Progress made (0-100)
 * @returns {object} - Result
 */
export const endStudySession = (masteryGained = 0) => {
  const sessionData = localStorage.getItem('active_study_session');
  if (!sessionData) {
    return { success: false, error: 'No active session' };
  }
  
  const session = JSON.parse(sessionData);
  const endTime = new Date();
  const startTime = new Date(session.startTime);
  const duration = Math.round((endTime - startTime) / 60000); // minutes
  
  session.endTime = endTime.toISOString();
  session.duration = duration;
  session.status = 'completed';
  session.masteryGained = masteryGained;
  
  // Update topic progress
  const subjects = loadSubjects() || {};
  const subject = subjects[session.subjectId];
  const topic = subject.topics.find(t => t.id === session.topicId);
  
  if (topic) {
    // Update mastery (cap at 100)
    topic.mastery = Math.min(100, (topic.mastery || 0) + masteryGained);
    topic.timeSpent = (topic.timeSpent || 0) + duration;
    topic.lastStudied = endTime.toISOString();
    
    // Add to study sessions history
    if (!topic.studySessions) {
      topic.studySessions = [];
    }
    topic.studySessions.push({
      date: endTime.toISOString(),
      duration,
      masteryGained,
      masteryAfter: topic.mastery
    });
    
    // Calculate overall subject progress
    const totalMastery = subject.topics.reduce((sum, t) => sum + (t.mastery || 0), 0);
    subject.overallProgress = Math.round(totalMastery / subject.topics.length);
    subject.lastUpdated = endTime.toISOString();
    
    saveSubjects(subjects);
  }
  
  // Update user stats
  const user = loadUser() || {};
  user.totalStudyHours = (user.totalStudyHours || 0) + (duration / 60);
  saveUser(user);
  
  // Clear active session
  localStorage.removeItem('active_study_session');
  
  // Update streak
  updateStreak();
  
  return { success: true, session, topicProgress: topic.mastery };
};

/**
 * Mark revision complete
 * @param {string} subjectId - Subject ID
 * @param {string} topicId - Topic ID
 * @param {string} revisionNumber - 'r1', 'r2', or 'r3'
 * @returns {object} - Result
 */
export const markRevisionComplete = (subjectId, topicId, revisionNumber) => {
  const subjects = loadSubjects() || {};
  const subject = subjects[subjectId];
  const topic = subject?.topics?.find(t => t.id === topicId);
  
  if (!topic) {
    return { success: false, error: 'Topic not found' };
  }
  
  if (!topic.revisions) {
    topic.revisions = {
      r1: { completed: false, date: null, timeSpent: 0 },
      r2: { completed: false, date: null, timeSpent: 0 },
      r3: { completed: false, date: null, timeSpent: 0 }
    };
  }
  
  topic.revisions[revisionNumber] = {
    completed: true,
    date: new Date().toISOString(),
    timeSpent: 0 // Can be tracked with sessions
  };
  
  // Boost mastery slightly for revisions
  const masteryBoost = revisionNumber === 'r1' ? 5 : revisionNumber === 'r2' ? 3 : 2;
  topic.mastery = Math.min(100, (topic.mastery || 0) + masteryBoost);
  
  subject.lastUpdated = new Date().toISOString();
  saveSubjects(subjects);
  
  updateLastActivity();
  
  return { success: true, topic };
};

/**
 * Get active study session
 * @returns {object|null} - Active session or null
 */
export const getActiveSession = () => {
  const sessionData = localStorage.getItem('active_study_session');
  return sessionData ? JSON.parse(sessionData) : null;
};

/**
 * Update last activity date (for streak tracking)
 */
export const updateLastActivity = () => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('last_activity_date', today);
};

/**
 * Update study streak
 */
export const updateStreak = () => {
  const user = loadUser() || {};
  const today = new Date().toISOString().split('T')[0];
  const lastActivity = localStorage.getItem('last_activity_date');
  
  if (!lastActivity) {
    user.currentStreak = 1;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastActivity === today) {
      // Already studied today, keep streak
    } else if (lastActivity === yesterdayStr) {
      // Studied yesterday, increment streak
      user.currentStreak = (user.currentStreak || 0) + 1;
    } else {
      // Broke streak
      user.currentStreak = 1;
    }
  }
  
  user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak || 0);
  user.lastActivityDate = today;
  
  saveUser(user);
  updateLastActivity();
};

/**
 * Get real-time progress summary
 * @returns {object} - Progress summary
 */
export const getRealTimeProgress = () => {
  const subjects = loadSubjects() || {};
  const activeSubjects = Object.values(subjects).filter(s => s.status === 'active');
  
  let totalTopics = 0;
  let completedTopics = 0;
  let totalHours = 0;
  let spentHours = 0;
  let criticalPending = [];
  
  activeSubjects.forEach(subject => {
    if (subject.topics) {
      subject.topics.forEach(topic => {
        totalTopics++;
        totalHours += (topic.hours || 0);
        spentHours += (topic.timeSpent || 0) / 60; // Convert minutes to hours
        
        if (topic.mastery >= 80) {
          completedTopics++;
        }
        
        if (topic.priority === 'CRITICAL' && topic.mastery < 80) {
          criticalPending.push({
            subject: subject.name,
            topic: topic.name,
            mastery: topic.mastery || 0,
            hours: topic.hours
          });
        }
      });
    }
  });
  
  const overallProgress = totalTopics > 0 
    ? Math.round((completedTopics / totalTopics) * 100) 
    : 0;
  
  const timeProgress = totalHours > 0
    ? Math.round((spentHours / totalHours) * 100)
    : 0;
  
  const user = loadUser() || {};
  
  return {
    overallProgress,
    timeProgress,
    totalTopics,
    completedTopics,
    pendingTopics: totalTopics - completedTopics,
    totalHours: Math.round(totalHours),
    spentHours: Math.round(spentHours * 10) / 10,
    remainingHours: Math.round((totalHours - spentHours) * 10) / 10,
    criticalPending,
    currentStreak: user.currentStreak || 0,
    longestStreak: user.longestStreak || 0,
    lastActivity: user.lastActivityDate || 'Never'
  };
};

/**
 * Get today's completed tasks
 * @returns {array} - Completed sessions today
 */
export const getTodayProgress = () => {
  const subjects = loadSubjects() || {};
  const today = new Date().toISOString().split('T')[0];
  const completedToday = [];
  
  Object.values(subjects).forEach(subject => {
    subject.topics?.forEach(topic => {
      topic.studySessions?.forEach(session => {
        const sessionDate = session.date.split('T')[0];
        if (sessionDate === today) {
          completedToday.push({
            subject: subject.name,
            topic: topic.name,
            duration: session.duration,
            masteryGained: session.masteryGained,
            time: session.date
          });
        }
      });
    });
  });
  
  return completedToday.sort((a, b) => new Date(b.time) - new Date(a.time));
};

export default {
  initializeFreshProgress,
  startStudySession,
  endStudySession,
  markRevisionComplete,
  getActiveSession,
  updateLastActivity,
  updateStreak,
  getRealTimeProgress,
  getTodayProgress
};
