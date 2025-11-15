// ═══════════════════════════════════════════════════════════════
// REACT HOOKS - Easy Backend Integration 🪝
// Custom hooks for seamless data access and mutations
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import {
  addSubject,
  updateSubject,
  deleteSubject,
  changeSubjectStatus,
  addTopic,
  updateTopicMastery,
  markRevisionComplete,
  calculateOverallProgress,
  calculateSubjectMetrics,
  addScheduleBlock,
  completeScheduleBlock,
  saveJournalEntry,
  logHabitCompletion,
  calculateHabitStreak,
  updateUserProfile,
  updateStudyStreak
} from '../utils/backend';

import {
  loadSubjects,
  loadSchedule,
  loadJournalEntries,
  loadHabitLogs,
  loadGREProgress,
  loadUser
} from '../utils/storage';

// ═══════════════════════════════════════════════════════════════
// SUBJECTS HOOK
// ═══════════════════════════════════════════════════════════════

/**
 * Hook for managing subjects with auto-refresh
 * @param {number} refreshInterval - Auto-refresh interval in ms (0 = disabled)
 * @returns {object} - Subjects data and mutation functions
 */
export const useSubjects = (refreshInterval = 5000) => {
  const [subjects, setSubjects] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load subjects
  const loadData = useCallback(() => {
    try {
      const data = loadSubjects();
      setSubjects(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, loadData]);

  // Mutation functions
  const add = useCallback(async (subjectData) => {
    const result = addSubject(subjectData);
    if (result.success) {
      loadData(); // Refresh
    }
    return result;
  }, [loadData]);

  const update = useCallback(async (subjectId, updates) => {
    const result = updateSubject(subjectId, updates);
    if (result.success) {
      loadData();
    }
    return result;
  }, [loadData]);

  const remove = useCallback(async (subjectId) => {
    const result = deleteSubject(subjectId);
    if (result.success) {
      loadData();
    }
    return result;
  }, [loadData]);

  const archive = useCallback(async (subjectId) => {
    const result = changeSubjectStatus(subjectId, 'archived');
    if (result.success) {
      loadData();
    }
    return result;
  }, [loadData]);

  const restore = useCallback(async (subjectId) => {
    const result = changeSubjectStatus(subjectId, 'active');
    if (result.success) {
      loadData();
    }
    return result;
  }, [loadData]);

  return {
    subjects,
    loading,
    error,
    refresh: loadData,
    add,
    update,
    remove,
    archive,
    restore
  };
};

// ═══════════════════════════════════════════════════════════════
// TOPICS HOOK
// ═══════════════════════════════════════════════════════════════

/**
 * Hook for managing topics within a subject
 * @param {string} subjectId - Subject ID
 * @returns {object} - Topic operations
 */
export const useTopics = (subjectId) => {
  const { subjects, refresh } = useSubjects(0); // Don't auto-refresh

  const add = useCallback(async (topicData) => {
    const result = addTopic(subjectId, topicData);
    if (result.success) {
      refresh();
    }
    return result;
  }, [subjectId, refresh]);

  const updateMastery = useCallback(async (topicId, mastery) => {
    const result = updateTopicMastery(subjectId, topicId, mastery);
    if (result.success) {
      refresh();
    }
    return result;
  }, [subjectId, refresh]);

  const markRevision = useCallback(async (topicId, revisionLevel) => {
    const result = markRevisionComplete(subjectId, topicId, revisionLevel);
    if (result.success) {
      refresh();
    }
    return result;
  }, [subjectId, refresh]);

  const topics = subjects?.[subjectId]?.topics || [];

  return {
    topics,
    add,
    updateMastery,
    markRevision
  };
};

// ═══════════════════════════════════════════════════════════════
// PROGRESS HOOK
// ═══════════════════════════════════════════════════════════════

/**
 * Hook for real-time progress analytics
 * @param {number} refreshInterval - Refresh interval in ms
 * @returns {object} - Progress metrics
 */
export const useProgress = (refreshInterval = 10000) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const calculate = useCallback(() => {
    try {
      const data = calculateOverallProgress();
      setProgress(data);
      setLoading(false);
    } catch (error) {
      console.error('Progress calculation error:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calculate();
  }, [calculate]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(calculate, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, calculate]);

  return {
    progress,
    loading,
    refresh: calculate
  };
};

// ═══════════════════════════════════════════════════════════════
// SUBJECT METRICS HOOK
// ═══════════════════════════════════════════════════════════════

/**
 * Hook for detailed subject metrics
 * @param {string} subjectId - Subject ID
 * @returns {object} - Subject metrics
 */
export const useSubjectMetrics = (subjectId) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) {
      setLoading(false);
      return;
    }

    const result = calculateSubjectMetrics(subjectId);
    if (result.success) {
      setMetrics(result.metrics);
    }
    setLoading(false);
  }, [subjectId]);

  return {
    metrics,
    loading
  };
};

// ═══════════════════════════════════════════════════════════════
// SCHEDULE HOOK
// ═══════════════════════════════════════════════════════════════

/**
 * Hook for schedule management
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {object} - Schedule data and operations
 */
export const useSchedule = (date) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    try {
      const allSchedule = loadSchedule() || {};
      setSchedule(allSchedule[date] || []);
      setLoading(false);
    } catch (error) {
      console.error('Schedule load error:', error);
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addBlock = useCallback(async (blockData) => {
    const result = addScheduleBlock(date, blockData);
    if (result.success) {
      loadData();
    }
    return result;
  }, [date, loadData]);

  const completeBlock = useCallback(async (blockId) => {
    const result = completeScheduleBlock(date, blockId);
    if (result.success) {
      loadData();
    }
    return result;
  }, [date, loadData]);

  return {
    schedule,
    loading,
    refresh: loadData,
    addBlock,
    completeBlock
  };
};

// ═══════════════════════════════════════════════════════════════
// JOURNAL HOOK
// ═══════════════════════════════════════════════════════════════

/**
 * Hook for journal entries
 * @returns {object} - Journal data and operations
 */
export const useJournal = () => {
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    try {
      const data = loadJournalEntries();
      setEntries(data);
      setLoading(false);
    } catch (error) {
      console.error('Journal load error:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveEntry = useCallback(async (date, entryData) => {
    const result = saveJournalEntry(date, entryData);
    if (result.success) {
      loadData();
    }
    return result;
  }, [loadData]);

  return {
    entries,
    loading,
    refresh: loadData,
    saveEntry
  };
};

// ═══════════════════════════════════════════════════════════════
// HABITS HOOK
// ═══════════════════════════════════════════════════════════════

/**
 * Hook for habit tracking
 * @returns {object} - Habit data and operations
 */
export const useHabits = () => {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    try {
      const data = loadHabitLogs();
      setLogs(data);
      setLoading(false);
    } catch (error) {
      console.error('Habits load error:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const logCompletion = useCallback(async (date, habitName, completed) => {
    const result = logHabitCompletion(date, habitName, completed);
    if (result.success) {
      loadData();
    }
    return result;
  }, [loadData]);

  const getStreak = useCallback((habitName) => {
    return calculateHabitStreak(habitName);
  }, []);

  return {
    logs,
    loading,
    refresh: loadData,
    logCompletion,
    getStreak
  };
};

// ═══════════════════════════════════════════════════════════════
// USER HOOK
// ═══════════════════════════════════════════════════════════════

/**
 * Hook for user profile and stats
 * @param {number} refreshInterval - Refresh interval in ms
 * @returns {object} - User data and operations
 */
export const useUser = (refreshInterval = 60000) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    try {
      const data = loadUser();
      setUser(data);
      setLoading(false);
    } catch (error) {
      console.error('User load error:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, loadData]);

  const updateProfile = useCallback(async (updates) => {
    const result = updateUserProfile(updates);
    if (result.success) {
      loadData();
    }
    return result;
  }, [loadData]);

  const updateStreak = useCallback(async (increment) => {
    const result = updateStudyStreak(increment);
    if (result.success) {
      loadData();
    }
    return result;
  }, [loadData]);

  return {
    user,
    loading,
    refresh: loadData,
    updateProfile,
    updateStreak
  };
};

// ═══════════════════════════════════════════════════════════════
// GRE HOOK
// ═══════════════════════════════════════════════════════════════

/**
 * Hook for GRE progress tracking
 * @param {number} refreshInterval - Refresh interval in ms
 * @returns {object} - GRE data
 */
export const useGRE = (refreshInterval = 5000) => {
  const [gre, setGre] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    try {
      const data = loadGREProgress();
      setGre(data);
      setLoading(false);
    } catch (error) {
      console.error('GRE load error:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, loadData]);

  return {
    gre,
    loading,
    refresh: loadData
  };
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  useSubjects,
  useTopics,
  useProgress,
  useSubjectMetrics,
  useSchedule,
  useJournal,
  useHabits,
  useUser,
  useGRE
};
