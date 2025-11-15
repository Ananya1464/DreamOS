// ═══════════════════════════════════════════════════════════════
// STORAGE UTILITY - LocalStorage Persistence System 💾
// Makes all your data immortal across page refreshes!
// ═══════════════════════════════════════════════════════════════

// Storage keys - prefixed to avoid conflicts
const KEYS = {
  SUBJECTS: 'dreamos_subjects',
  SCHEDULE: 'dreamos_schedule',
  JOURNAL: 'dreamos_journal',
  HABITS: 'dreamos_habits',
  GRE: 'dreamos_gre',
  SAVED_CONTENT: 'dreamos_saved_content',
  AGENT_HISTORY: 'dreamos_agent_history',
  SETTINGS: 'dreamos_settings',
  USER: 'dreamos_user'
};

// ═══════════════════════════════════════════════════════════════
// GENERIC SAVE/LOAD FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save (will be JSON.stringify'd)
 * @returns {boolean} - Success status
 */
export const saveToStorage = (key, data) => {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    console.log(`✅ Saved to ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Storage error for ${key}:`, error);
    
    // Handle quota exceeded
    if (error.name === 'QuotaExceededError') {
      alert('⚠️ Storage full! Export your data and clear old entries.');
    }
    
    return false;
  }
};

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Parsed data or default value
 */
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`❌ Load error for ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Remove error for ${key}:`, error);
    return false;
  }
};

/**
 * Clear all DreamOS data
 */
export const clearAllStorage = () => {
  try {
    Object.values(KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ All DreamOS data cleared');
    return true;
  } catch (error) {
    console.error('❌ Clear all error:', error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// SPECIFIC SAVE/LOAD FUNCTIONS FOR EACH DATA TYPE
// ═══════════════════════════════════════════════════════════════

// SUBJECTS
export const saveSubjects = (subjects) => saveToStorage(KEYS.SUBJECTS, subjects);
export const loadSubjects = () => loadFromStorage(KEYS.SUBJECTS, null);

// SCHEDULE
export const saveSchedule = (schedule) => saveToStorage(KEYS.SCHEDULE, schedule);
export const loadSchedule = () => loadFromStorage(KEYS.SCHEDULE, null);

/**
 * Add a schedule event (from AI or manual)
 * @param {Object} event - Event data
 * @param {string} event.date - Date key (YYYY-MM-DD)
 * @param {string} event.time - Start time (HH:mm)
 * @param {string} event.activity - Activity name
 * @param {number} event.duration - Duration in minutes
 * @param {string} event.type - Event type (study/break/personal/other)
 * @param {string} event.createdBy - 'luna' or 'manual'
 */
export const addScheduleEvent = (event) => {
  try {
    const schedule = loadSchedule() || {};
    const { date, time, activity, duration, type, createdBy } = event;
    
    // Initialize date array if doesn't exist OR if it's not an array (cloud data structure)
    if (!schedule[date] || !Array.isArray(schedule[date])) {
      schedule[date] = [];
    }
    
    // Add event
    schedule[date].push({
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      time,
      activity,
      duration: duration || 60,
      type: type || 'other',
      createdBy: createdBy || 'manual',
      completed: false,
      createdAt: new Date().toISOString()
    });
    
    // Sort events by time
    schedule[date].sort((a, b) => a.time.localeCompare(b.time));
    
    saveSchedule(schedule);
    return true;
  } catch (error) {
    console.error('Error adding schedule event:', error);
    return false;
  }
};

// JOURNAL
export const saveJournalEntries = (entries) => saveToStorage(KEYS.JOURNAL, entries);
export const loadJournalEntries = () => loadFromStorage(KEYS.JOURNAL, []);

// HABITS
export const saveHabitLogs = (logs) => saveToStorage(KEYS.HABITS, logs);
export const loadHabitLogs = () => loadFromStorage(KEYS.HABITS, []);

// GRE
export const saveGREProgress = (progress) => saveToStorage(KEYS.GRE, progress);
export const loadGREProgress = () => loadFromStorage(KEYS.GRE, null);

// SAVED CONTENT
export const saveSavedContent = (content) => saveToStorage(KEYS.SAVED_CONTENT, content);
export const loadSavedContent = () => loadFromStorage(KEYS.SAVED_CONTENT, []);

// AGENT HISTORY
export const saveAgentHistory = (history) => saveToStorage(KEYS.AGENT_HISTORY, history);
export const loadAgentHistory = () => loadFromStorage(KEYS.AGENT_HISTORY, []);

// USER DATA
export const saveUser = (user) => saveToStorage(KEYS.USER, user);
export const loadUser = () => loadFromStorage(KEYS.USER, null);

// SETTINGS
export const saveSettings = (settings) => saveToStorage(KEYS.SETTINGS, settings);
export const loadSettings = () => loadFromStorage(KEYS.SETTINGS, {});

// ═══════════════════════════════════════════════════════════════
// EXPORT ALL DATA (BACKUP)
// ═══════════════════════════════════════════════════════════════

/**
 * Export all DreamOS data as JSON file
 * @returns {boolean} - Success status
 */
export const exportAllData = () => {
  try {
    const allData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      subjects: loadSubjects(),
      schedule: loadSchedule(),
      journal: loadJournalEntries(),
      habits: loadHabitLogs(),
      gre: loadGREProgress(),
      savedContent: loadSavedContent(),
      agentHistory: loadAgentHistory(),
      user: loadUser(),
      settings: loadSettings()
    };
    
    // Create downloadable file
    const blob = new Blob([JSON.stringify(allData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dreamos-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📦 Data exported successfully');
    return true;
  } catch (error) {
    console.error('❌ Export error:', error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// IMPORT DATA (RESTORE FROM BACKUP)
// ═══════════════════════════════════════════════════════════════

/**
 * Import DreamOS data from JSON string
 * @param {string} jsonString - JSON backup data
 * @returns {boolean} - Success status
 */
export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate data structure
    if (!data.version || !data.exportDate) {
      throw new Error('Invalid backup file format');
    }
    
    // Restore all data
    if (data.subjects) saveSubjects(data.subjects);
    if (data.schedule) saveSchedule(data.schedule);
    if (data.journal) saveJournalEntries(data.journal);
    if (data.habits) saveHabitLogs(data.habits);
    if (data.gre) saveGREProgress(data.gre);
    if (data.savedContent) saveSavedContent(data.savedContent);
    if (data.agentHistory) saveAgentHistory(data.agentHistory);
    if (data.user) saveUser(data.user);
    if (data.settings) saveSettings(data.settings);
    
    console.log('✅ Data imported successfully');
    return true;
  } catch (error) {
    console.error('❌ Import error:', error);
    alert('Import failed! Please check the file format.');
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// HELPER: Get storage info
// ═══════════════════════════════════════════════════════════════

/**
 * Get current storage usage info
 * @returns {object} - Storage statistics
 */
export const getStorageInfo = () => {
  try {
    let totalSize = 0;
    const items = {};
    
    Object.entries(KEYS).forEach(([name, key]) => {
      const item = localStorage.getItem(key);
      if (item) {
        const size = new Blob([item]).size;
        items[name] = {
          size: size,
          sizeKB: (size / 1024).toFixed(2),
          itemCount: Array.isArray(JSON.parse(item)) ? JSON.parse(item).length : 1
        };
        totalSize += size;
      }
    });
    
    return {
      totalSize: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      items: items,
      percentUsed: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2) // Assuming 5MB limit
    };
  } catch (error) {
    console.error('❌ Storage info error:', error);
    return null;
  }
};

export default {
  // Generic
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  clearAllStorage,
  
  // Specific
  saveSubjects,
  loadSubjects,
  saveSchedule,
  loadSchedule,
  saveJournalEntries,
  loadJournalEntries,
  saveHabitLogs,
  loadHabitLogs,
  saveGREProgress,
  loadGREProgress,
  saveSavedContent,
  loadSavedContent,
  saveAgentHistory,
  loadAgentHistory,
  saveUser,
  loadUser,
  saveSettings,
  loadSettings,
  
  // Import/Export
  exportAllData,
  importData,
  getStorageInfo
};
