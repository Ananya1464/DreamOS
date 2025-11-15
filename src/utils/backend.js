// ═══════════════════════════════════════════════════════════════
// BACKEND SERVICE - Data Processing & Business Logic 🔧
// Handles all complex data operations and calculations
// ═══════════════════════════════════════════════════════════════

import { 
  loadSubjects, 
  saveSubjects,
  loadSchedule,
  saveSchedule,
  loadJournalEntries,
  saveJournalEntries,
  loadHabitLogs,
  saveHabitLogs,
  loadGREProgress,
  saveGREProgress,
  loadUser,
  saveUser
} from './storage';

// ═══════════════════════════════════════════════════════════════
// SUBJECT MANAGEMENT BACKEND
// ═══════════════════════════════════════════════════════════════

/**
 * Add a new subject with validation
 * @param {object} subjectData - Subject information
 * @returns {object} - Result with subject ID or error
 */
export const addSubject = (subjectData) => {
  try {
    // Validate required fields
    if (!subjectData.name || !subjectData.examDate) {
      return { success: false, error: 'Missing required fields' };
    }
    
    // Validate exam date is in future
    const examDate = new Date(subjectData.examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (examDate < today) {
      return { success: false, error: 'Exam date must be in the future' };
    }
    
    // Load existing subjects
    const subjects = loadSubjects() || {};
    
    // Generate unique ID
    const id = `subject_${Date.now()}`;
    
    // Create subject object
    const newSubject = {
      id,
      name: subjectData.name,
      color: subjectData.color || '#8B5CF6',
      examDate: subjectData.examDate,
      targetScore: subjectData.targetScore || 'A',
      status: 'active',
      topics: subjectData.topics || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to subjects
    subjects[id] = newSubject;
    
    // Save to storage
    if (saveSubjects(subjects)) {
      return { success: true, subject: newSubject, id };
    } else {
      return { success: false, error: 'Failed to save subject' };
    }
  } catch (error) {
    console.error('❌ Add subject error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update subject details
 * @param {string} subjectId - Subject ID
 * @param {object} updates - Fields to update
 * @returns {object} - Result
 */
export const updateSubject = (subjectId, updates) => {
  try {
    const subjects = loadSubjects() || {};
    
    if (!subjects[subjectId]) {
      return { success: false, error: 'Subject not found' };
    }
    
    // Update subject
    subjects[subjectId] = {
      ...subjects[subjectId],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Save
    if (saveSubjects(subjects)) {
      return { success: true, subject: subjects[subjectId] };
    } else {
      return { success: false, error: 'Failed to save updates' };
    }
  } catch (error) {
    console.error('❌ Update subject error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete subject permanently
 * @param {string} subjectId - Subject ID
 * @returns {object} - Result
 */
export const deleteSubject = (subjectId) => {
  try {
    const subjects = loadSubjects() || {};
    
    if (!subjects[subjectId]) {
      return { success: false, error: 'Subject not found' };
    }
    
    // Delete subject
    delete subjects[subjectId];
    
    // Save
    if (saveSubjects(subjects)) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to delete subject' };
    }
  } catch (error) {
    console.error('❌ Delete subject error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Archive/Restore subject
 * @param {string} subjectId - Subject ID
 * @param {string} status - 'active' or 'archived'
 * @returns {object} - Result
 */
export const changeSubjectStatus = (subjectId, status) => {
  return updateSubject(subjectId, { status });
};

// ═══════════════════════════════════════════════════════════════
// TOPIC MANAGEMENT BACKEND
// ═══════════════════════════════════════════════════════════════

/**
 * Add topic to subject
 * @param {string} subjectId - Subject ID
 * @param {object} topicData - Topic information
 * @returns {object} - Result
 */
export const addTopic = (subjectId, topicData) => {
  try {
    const subjects = loadSubjects() || {};
    
    if (!subjects[subjectId]) {
      return { success: false, error: 'Subject not found' };
    }
    
    // Initialize topics array if needed
    if (!subjects[subjectId].topics) {
      subjects[subjectId].topics = [];
    }
    
    // Create topic
    const newTopic = {
      id: `topic_${Date.now()}`,
      name: topicData.name,
      mastery: topicData.mastery || 0,
      priority: topicData.priority || 'NORMAL',
      timeSpent: topicData.timeSpent || 0,
      revisions: {
        r1: false,
        r2: false,
        r3: false
      },
      notes: topicData.notes || '',
      createdAt: new Date().toISOString()
    };
    
    // Add topic
    subjects[subjectId].topics.push(newTopic);
    subjects[subjectId].updatedAt = new Date().toISOString();
    
    // Save
    if (saveSubjects(subjects)) {
      return { success: true, topic: newTopic };
    } else {
      return { success: false, error: 'Failed to save topic' };
    }
  } catch (error) {
    console.error('❌ Add topic error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update topic mastery level
 * @param {string} subjectId - Subject ID
 * @param {string} topicId - Topic ID
 * @param {number} mastery - New mastery level (0-100)
 * @returns {object} - Result
 */
export const updateTopicMastery = (subjectId, topicId, mastery) => {
  try {
    const subjects = loadSubjects() || {};
    
    if (!subjects[subjectId]) {
      return { success: false, error: 'Subject not found' };
    }
    
    const topic = subjects[subjectId].topics?.find(t => t.id === topicId);
    if (!topic) {
      return { success: false, error: 'Topic not found' };
    }
    
    // Validate mastery
    if (mastery < 0 || mastery > 100) {
      return { success: false, error: 'Mastery must be between 0 and 100' };
    }
    
    // Update mastery
    topic.mastery = mastery;
    topic.lastUpdated = new Date().toISOString();
    subjects[subjectId].updatedAt = new Date().toISOString();
    
    // Save
    if (saveSubjects(subjects)) {
      return { success: true, topic };
    } else {
      return { success: false, error: 'Failed to save mastery update' };
    }
  } catch (error) {
    console.error('❌ Update mastery error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mark revision complete (R1, R2, R3)
 * @param {string} subjectId - Subject ID
 * @param {string} topicId - Topic ID
 * @param {string} revisionLevel - 'r1', 'r2', or 'r3'
 * @returns {object} - Result
 */
export const markRevisionComplete = (subjectId, topicId, revisionLevel) => {
  try {
    const subjects = loadSubjects() || {};
    
    if (!subjects[subjectId]) {
      return { success: false, error: 'Subject not found' };
    }
    
    const topic = subjects[subjectId].topics?.find(t => t.id === topicId);
    if (!topic) {
      return { success: false, error: 'Topic not found' };
    }
    
    // Initialize revisions if needed
    if (!topic.revisions) {
      topic.revisions = { r1: false, r2: false, r3: false };
    }
    
    // Mark revision complete
    if (['r1', 'r2', 'r3'].includes(revisionLevel)) {
      topic.revisions[revisionLevel] = true;
      topic.lastRevision = new Date().toISOString();
      subjects[subjectId].updatedAt = new Date().toISOString();
      
      // Save
      if (saveSubjects(subjects)) {
        return { success: true, topic };
      } else {
        return { success: false, error: 'Failed to save revision' };
      }
    } else {
      return { success: false, error: 'Invalid revision level' };
    }
  } catch (error) {
    console.error('❌ Mark revision error:', error);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════════
// PROGRESS ANALYTICS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate overall progress across all subjects
 * @returns {object} - Comprehensive progress metrics
 */
export const calculateOverallProgress = () => {
  try {
    const subjects = loadSubjects() || {};
    const activeSubjects = Object.values(subjects).filter(s => s.status === 'active');
    
    if (activeSubjects.length === 0) {
      return {
        totalSubjects: 0,
        averageProgress: 0,
        upcomingExams: [],
        criticalTopics: [],
        streak: 0
      };
    }
    
    // Calculate metrics
    let totalProgress = 0;
    let totalTopics = 0;
    let masteredTopics = 0;
    let criticalTopics = [];
    let upcomingExams = [];
    
    activeSubjects.forEach(subject => {
      // Topic progress
      if (subject.topics && subject.topics.length > 0) {
        const subjectProgress = subject.topics.reduce((sum, t) => sum + (t.mastery || 0), 0) / subject.topics.length;
        totalProgress += subjectProgress;
        totalTopics += subject.topics.length;
        masteredTopics += subject.topics.filter(t => (t.mastery || 0) >= 80).length;
        
        // Critical topics
        const critical = subject.topics
          .filter(t => t.priority === 'CRITICAL' && (t.mastery || 0) < 80)
          .map(t => ({ subject: subject.name, topic: t.name, mastery: t.mastery }));
        criticalTopics.push(...critical);
      }
      
      // Upcoming exams
      const daysUntil = Math.ceil((new Date(subject.examDate) - new Date()) / (1000 * 60 * 60 * 24));
      upcomingExams.push({
        subject: subject.name,
        date: subject.examDate,
        daysUntil,
        progress: subject.topics ? Math.round(subject.topics.reduce((sum, t) => sum + (t.mastery || 0), 0) / subject.topics.length) : 0
      });
    });
    
    // Sort exams by date
    upcomingExams.sort((a, b) => a.daysUntil - b.daysUntil);
    
    // Get user streak
    const user = loadUser() || { currentStreak: 0 };
    
    return {
      totalSubjects: activeSubjects.length,
      averageProgress: Math.round(totalProgress / activeSubjects.length),
      totalTopics,
      masteredTopics,
      completionRate: totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0,
      upcomingExams: upcomingExams.slice(0, 5), // Next 5 exams
      criticalTopics: criticalTopics.slice(0, 10), // Top 10 critical
      streak: user.currentStreak || 0
    };
  } catch (error) {
    console.error('❌ Progress calculation error:', error);
    return null;
  }
};

/**
 * Calculate subject-specific metrics
 * @param {string} subjectId - Subject ID
 * @returns {object} - Subject metrics
 */
export const calculateSubjectMetrics = (subjectId) => {
  try {
    const subjects = loadSubjects() || {};
    const subject = subjects[subjectId];
    
    if (!subject) {
      return { success: false, error: 'Subject not found' };
    }
    
    const daysUntil = Math.ceil((new Date(subject.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    let metrics = {
      name: subject.name,
      examDate: subject.examDate,
      daysUntil,
      targetScore: subject.targetScore,
      totalTopics: 0,
      completedTopics: 0,
      inProgressTopics: 0,
      notStartedTopics: 0,
      averageMastery: 0,
      criticalTopics: [],
      revisionsCompleted: { r1: 0, r2: 0, r3: 0 },
      totalTimeSpent: 0,
      estimatedTimeRemaining: 0
    };
    
    if (subject.topics && subject.topics.length > 0) {
      metrics.totalTopics = subject.topics.length;
      
      let totalMastery = 0;
      
      subject.topics.forEach(topic => {
        const mastery = topic.mastery || 0;
        totalMastery += mastery;
        
        if (mastery >= 80) {
          metrics.completedTopics++;
        } else if (mastery > 0) {
          metrics.inProgressTopics++;
        } else {
          metrics.notStartedTopics++;
        }
        
        // Critical topics
        if (topic.priority === 'CRITICAL' && mastery < 80) {
          metrics.criticalTopics.push({
            name: topic.name,
            mastery,
            priority: topic.priority
          });
        }
        
        // Revisions
        if (topic.revisions) {
          if (topic.revisions.r1) metrics.revisionsCompleted.r1++;
          if (topic.revisions.r2) metrics.revisionsCompleted.r2++;
          if (topic.revisions.r3) metrics.revisionsCompleted.r3++;
        }
        
        // Time
        metrics.totalTimeSpent += topic.timeSpent || 0;
      });
      
      metrics.averageMastery = Math.round(totalMastery / metrics.totalTopics);
      
      // Estimate remaining time (assume 2 hours per incomplete topic)
      const incompleteTopics = metrics.totalTopics - metrics.completedTopics;
      metrics.estimatedTimeRemaining = incompleteTopics * 2;
    }
    
    return { success: true, metrics };
  } catch (error) {
    console.error('❌ Subject metrics error:', error);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════════
// SCHEDULE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

/**
 * Add schedule block
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {object} blockData - Schedule block data
 * @returns {object} - Result
 */
export const addScheduleBlock = (date, blockData) => {
  try {
    const schedule = loadSchedule() || {};
    
    if (!schedule[date]) {
      schedule[date] = [];
    }
    
    const newBlock = {
      id: `block_${Date.now()}`,
      time: blockData.time,
      activity: blockData.activity,
      type: blockData.type || 'study',
      duration: blockData.duration || 60,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    schedule[date].push(newBlock);
    
    if (saveSchedule(schedule)) {
      return { success: true, block: newBlock };
    } else {
      return { success: false, error: 'Failed to save schedule' };
    }
  } catch (error) {
    console.error('❌ Add schedule block error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mark schedule block as complete
 * @param {string} date - Date
 * @param {string} blockId - Block ID
 * @returns {object} - Result
 */
export const completeScheduleBlock = (date, blockId) => {
  try {
    const schedule = loadSchedule() || {};
    
    if (!schedule[date]) {
      return { success: false, error: 'No schedule for this date' };
    }
    
    const block = schedule[date].find(b => b.id === blockId);
    if (!block) {
      return { success: false, error: 'Block not found' };
    }
    
    block.completed = true;
    block.completedAt = new Date().toISOString();
    
    if (saveSchedule(schedule)) {
      return { success: true, block };
    } else {
      return { success: false, error: 'Failed to save completion' };
    }
  } catch (error) {
    console.error('❌ Complete block error:', error);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════════
// JOURNAL MANAGEMENT
// ═══════════════════════════════════════════════════════════════

/**
 * Save journal entry
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {object} entryData - Journal entry data
 * @returns {object} - Result
 */
export const saveJournalEntry = (date, entryData) => {
  try {
    const entries = loadJournalEntries() || {};
    
    entries[date] = {
      ...entryData,
      date,
      lastUpdated: new Date().toISOString()
    };
    
    if (saveJournalEntries(entries)) {
      return { success: true, entry: entries[date] };
    } else {
      return { success: false, error: 'Failed to save journal entry' };
    }
  } catch (error) {
    console.error('❌ Save journal error:', error);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════════
// HABIT TRACKING
// ═══════════════════════════════════════════════════════════════

/**
 * Log habit completion
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {string} habitName - Habit name
 * @param {boolean} completed - Completion status
 * @returns {object} - Result
 */
export const logHabitCompletion = (date, habitName, completed) => {
  try {
    const logs = loadHabitLogs() || {};
    
    if (!logs[date]) {
      logs[date] = {};
    }
    
    logs[date][habitName] = {
      completed,
      timestamp: new Date().toISOString()
    };
    
    if (saveHabitLogs(logs)) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to save habit log' };
    }
  } catch (error) {
    console.error('❌ Log habit error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculate habit streak
 * @param {string} habitName - Habit name
 * @returns {number} - Current streak
 */
export const calculateHabitStreak = (habitName) => {
  try {
    const logs = loadHabitLogs() || {};
    
    let streak = 0;
    let currentDate = new Date();
    
    // Check backwards from today
    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (logs[dateStr] && logs[dateStr][habitName]?.completed) {
        streak++;
      } else {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  } catch (error) {
    console.error('❌ Calculate streak error:', error);
    return 0;
  }
};

// ═══════════════════════════════════════════════════════════════
// USER PROFILE & STATS
// ═══════════════════════════════════════════════════════════════

/**
 * Update user profile
 * @param {object} updates - Profile updates
 * @returns {object} - Result
 */
export const updateUserProfile = (updates) => {
  try {
    const user = loadUser() || {};
    
    const updatedUser = {
      ...user,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    if (saveUser(updatedUser)) {
      return { success: true, user: updatedUser };
    } else {
      return { success: false, error: 'Failed to save profile' };
    }
  } catch (error) {
    console.error('❌ Update profile error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update study streak
 * @param {boolean} increment - Whether to increment streak
 * @returns {object} - Result
 */
export const updateStudyStreak = (increment = true) => {
  try {
    const user = loadUser() || { currentStreak: 0, longestStreak: 0 };
    
    if (increment) {
      user.currentStreak = (user.currentStreak || 0) + 1;
      user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);
    } else {
      user.currentStreak = 0;
    }
    
    user.lastStudyDate = new Date().toISOString().split('T')[0];
    
    if (saveUser(user)) {
      return { success: true, streak: user.currentStreak };
    } else {
      return { success: false, error: 'Failed to update streak' };
    }
  } catch (error) {
    console.error('❌ Update streak error:', error);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  // Subjects
  addSubject,
  updateSubject,
  deleteSubject,
  changeSubjectStatus,
  // Topics
  addTopic,
  updateTopicMastery,
  markRevisionComplete,
  // Analytics
  calculateOverallProgress,
  calculateSubjectMetrics,
  // Schedule
  addScheduleBlock,
  completeScheduleBlock,
  // Journal
  saveJournalEntry,
  // Habits
  logHabitCompletion,
  calculateHabitStreak,
  // User
  updateUserProfile,
  updateStudyStreak
};
