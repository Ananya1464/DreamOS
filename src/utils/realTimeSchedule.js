// ═══════════════════════════════════════════════════════════════
// REAL-TIME SCHEDULE SYSTEM 📅
// Dynamic schedule with live updates and Google Calendar-like features
// ═══════════════════════════════════════════════════════════════

import { loadSchedule, saveSchedule } from './storage';
import { scheduleStudyNotification } from './notifications';

/**
 * Generate schedule from AI-approved todo list
 * @param {array} todoList - Approved tasks from Luna
 * @param {object} preferences - User scheduling preferences
 * @returns {object} - Generated schedule
 */
export const generateScheduleFromTodoList = (todoList, preferences = {}) => {
  const {
    startTime = '09:00',
    endTime = '22:00',
    breakDuration = 15,
    sessionDuration = 90,
    lunchBreak = { start: '13:00', duration: 60 },
    dinnerBreak = { start: '19:00', duration: 45 }
  } = preferences;
  
  const schedule = {
    date: new Date().toISOString().split('T')[0],
    blocks: [],
    generatedAt: new Date().toISOString(),
    totalStudyTime: 0
  };
  
  let currentTime = parseTime(startTime);
  const endTimeMin = parseTime(endTime);
  
  todoList.forEach((task, index) => {
    // Check for lunch break
    if (currentTime >= parseTime(lunchBreak.start) && 
        currentTime < parseTime(lunchBreak.start) + lunchBreak.duration) {
      schedule.blocks.push({
        id: `break_lunch_${Date.now()}`,
        type: 'break',
        activity: '🍽️ Lunch Break',
        startTime: formatTime(currentTime),
        duration: lunchBreak.duration,
        color: '#FFE5C8',
        completed: false
      });
      currentTime += lunchBreak.duration;
    }
    
    // Check for dinner break
    if (currentTime >= parseTime(dinnerBreak.start) && 
        currentTime < parseTime(dinnerBreak.start) + dinnerBreak.duration) {
      schedule.blocks.push({
        id: `break_dinner_${Date.now()}`,
        type: 'break',
        activity: '🍽️ Dinner Break',
        startTime: formatTime(currentTime),
        duration: dinnerBreak.duration,
        color: '#FFE5C8',
        completed: false
      });
      currentTime += dinnerBreak.duration;
    }
    
    // Add study block
    const block = {
      id: `study_${Date.now()}_${index}`,
      type: 'study',
      subject: task.subject,
      topic: task.topic,
      activity: `📚 ${task.subject} - ${task.topic}`,
      startTime: formatTime(currentTime),
      duration: task.duration || sessionDuration,
      priority: task.priority || 'NORMAL',
      color: task.color || '#C5A3FF',
      completed: false,
      notes: task.notes || '',
      revisionNumber: task.revisionNumber || null
    };
    
    schedule.blocks.push(block);
    schedule.totalStudyTime += block.duration;
    currentTime += block.duration;
    
    // Add short break between sessions
    if (index < todoList.length - 1 && currentTime < endTimeMin) {
      schedule.blocks.push({
        id: `break_${Date.now()}_${index}`,
        type: 'break',
        activity: '☕ Short Break',
        startTime: formatTime(currentTime),
        duration: breakDuration,
        color: '#E6F3FF',
        completed: false
      });
      currentTime += breakDuration;
    }
  });
  
  return schedule;
};

/**
 * Save schedule and set up notifications
 * @param {object} schedule - Schedule to save
 * @returns {boolean} - Success status
 */
export const saveScheduleWithNotifications = (schedule) => {
  const allSchedules = loadSchedule() || {};
  allSchedules[schedule.date] = schedule;
  
  const saved = saveSchedule(allSchedules);
  
  if (saved && schedule.blocks && Array.isArray(schedule.blocks)) {
    // Set up notifications for each study block
    schedule.blocks.forEach(block => {
      if (block.type === 'study') {
        const blockTime = new Date();
        const [hours, minutes] = block.startTime.split(':');
        blockTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        scheduleStudyNotification({
          id: block.id,
          time: blockTime.toISOString(),
          subject: block.subject,
          topic: block.topic,
          duration: block.duration
        });
      }
    });
    
    console.log('✅ Schedule saved with notifications');
  }
  
  return saved;
};

/**
 * Get today's schedule
 * @returns {object|null} - Today's schedule
 */
export const getTodaySchedule = () => {
  const today = new Date().toISOString().split('T')[0];
  const allSchedules = loadSchedule() || {};
  return allSchedules[today] || null;
};

/**
 * Mark schedule block as complete
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {string} blockId - Block ID
 * @param {number} actualDuration - Actual time spent (minutes)
 * @returns {boolean} - Success status
 */
export const completeScheduleBlock = (date, blockId, actualDuration) => {
  const allSchedules = loadSchedule() || {};
  const schedule = allSchedules[date];
  
  if (!schedule || !schedule.blocks || !Array.isArray(schedule.blocks)) return false;
  
  const block = schedule.blocks.find(b => b.id === blockId);
  if (!block) return false;
  
  block.completed = true;
  block.completedAt = new Date().toISOString();
  block.actualDuration = actualDuration || block.duration;
  
  return saveSchedule(allSchedules);
};

/**
 * Get current/next block
 * @returns {object|null} - Current or upcoming block
 */
export const getCurrentBlock = () => {
  const schedule = getTodaySchedule();
  if (!schedule || !schedule.blocks || !Array.isArray(schedule.blocks)) return null;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  for (const block of schedule.blocks) {
    const blockStart = parseTime(block.startTime);
    const blockEnd = blockStart + block.duration;
    
    // Current block (ongoing)
    if (currentMinutes >= blockStart && currentMinutes < blockEnd) {
      return {
        ...block,
        status: 'current',
        progress: Math.round(((currentMinutes - blockStart) / block.duration) * 100),
        remainingMinutes: blockEnd - currentMinutes
      };
    }
    
    // Next block (upcoming)
    if (currentMinutes < blockStart) {
      return {
        ...block,
        status: 'upcoming',
        startsIn: blockStart - currentMinutes
      };
    }
  }
  
  return null;
};

/**
 * Get schedule completion stats
 * @param {string|object} input - Date (YYYY-MM-DD) or schedule object
 * @returns {object} - Stats
 */
export const getScheduleStats = (input) => {
  let schedule;
  
  // Handle both date string and schedule object
  if (typeof input === 'string') {
    const allSchedules = loadSchedule() || {};
    schedule = allSchedules[input];
  } else if (input && typeof input === 'object') {
    schedule = input;
  }
  
  if (!schedule || !schedule.blocks || !Array.isArray(schedule.blocks)) {
    return {
      totalBlocks: 0,
      completedBlocks: 0,
      completionRate: 0,
      totalPlannedTime: 0,
      actualStudyTime: 0
    };
  }
  
  const studyBlocks = schedule.blocks.filter(b => b.type === 'study');
  const completedBlocks = studyBlocks.filter(b => b.completed);
  
  const totalPlannedTime = studyBlocks.reduce((sum, b) => sum + b.duration, 0);
  const actualStudyTime = completedBlocks.reduce((sum, b) => sum + (b.actualDuration || b.duration), 0);
  
  return {
    totalBlocks: studyBlocks.length,
    completedBlocks: completedBlocks.length,
    completionRate: studyBlocks.length > 0 
      ? Math.round((completedBlocks.length / studyBlocks.length) * 100) 
      : 0,
    totalPlannedTime,
    actualStudyTime,
    efficiency: totalPlannedTime > 0
      ? Math.round((actualStudyTime / totalPlannedTime) * 100)
      : 0
  };
};

/**
 * Reschedule missed blocks
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {array} - Rescheduled blocks
 */
export const rescheduleMissedBlocks = (date) => {
  const allSchedules = loadSchedule() || {};
  const schedule = allSchedules[date];
  
  if (!schedule || !schedule.blocks || !Array.isArray(schedule.blocks)) return [];
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const missedBlocks = schedule.blocks.filter(block => {
    const blockStart = parseTime(block.startTime);
    return !block.completed && currentMinutes > blockStart + block.duration;
  });
  
  return missedBlocks.map(block => ({
    ...block,
    originalDate: date,
    suggestedReschedule: 'tomorrow'
  }));
};

// Helper functions
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Initialize schedule for today if it doesn't exist
 * Creates a default schedule with common study blocks
 * @returns {object} - Today's schedule
 */
export const initializeTodaySchedule = () => {
  const today = new Date().toISOString().split('T')[0];
  const allSchedules = loadSchedule() || {};
  
  // If schedule already exists, return it
  if (allSchedules[today]) {
    return allSchedules[today];
  }
  
  // Create default schedule with standard study blocks
  const defaultSchedule = {
    date: today,
    blocks: [
      {
        id: `morning_study_${Date.now()}`,
        type: 'study',
        activity: '📚 Morning Study Session',
        subject: 'Choose your subject',
        startTime: '09:00',
        duration: 90,
        color: '#C5A3FF',
        completed: false
      },
      {
        id: `break_1_${Date.now()}`,
        type: 'break',
        activity: '☕ Short Break',
        startTime: '10:30',
        duration: 15,
        color: '#FFE5C8',
        completed: false
      },
      {
        id: `midmorning_study_${Date.now()}`,
        type: 'study',
        activity: '📚 Mid-Morning Study',
        subject: 'Choose your subject',
        startTime: '10:45',
        duration: 90,
        color: '#C5A3FF',
        completed: false
      },
      {
        id: `lunch_${Date.now()}`,
        type: 'break',
        activity: '🍽️ Lunch Break',
        startTime: '13:00',
        duration: 60,
        color: '#FFE5C8',
        completed: false
      },
      {
        id: `afternoon_study_${Date.now()}`,
        type: 'study',
        activity: '📚 Afternoon Study Session',
        subject: 'Choose your subject',
        startTime: '14:00',
        duration: 90,
        color: '#80D6D6',
        completed: false
      },
      {
        id: `break_2_${Date.now()}`,
        type: 'break',
        activity: '☕ Afternoon Break',
        startTime: '15:30',
        duration: 15,
        color: '#FFE5C8',
        completed: false
      },
      {
        id: `evening_study_${Date.now()}`,
        type: 'study',
        activity: '📚 Evening Study Session',
        subject: 'Choose your subject',
        startTime: '16:00',
        duration: 90,
        color: '#FFB5C0',
        completed: false
      },
      {
        id: `dinner_${Date.now()}`,
        type: 'break',
        activity: '🍽️ Dinner Break',
        startTime: '19:00',
        duration: 45,
        color: '#FFE5C8',
        completed: false
      },
      {
        id: `night_study_${Date.now()}`,
        type: 'study',
        activity: '📚 Night Study Session',
        subject: 'Choose your subject',
        startTime: '20:00',
        duration: 90,
        color: '#C5B9E5',
        completed: false
      }
    ],
    generatedAt: new Date().toISOString(),
    totalStudyTime: 360 // 6 hours
  };
  
  // Save the schedule
  allSchedules[today] = defaultSchedule;
  saveSchedule(allSchedules);
  
  console.log('✅ Created default schedule for today');
  return defaultSchedule;
};

export default {
  generateScheduleFromTodoList,
  saveScheduleWithNotifications,
  getTodaySchedule,
  completeScheduleBlock,
  getCurrentBlock,
  getScheduleStats,
  rescheduleMissedBlocks,
  initializeTodaySchedule
};
