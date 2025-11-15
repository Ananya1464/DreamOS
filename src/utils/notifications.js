// ═══════════════════════════════════════════════════════════════
// NOTIFICATION SYSTEM - Real-time Study Reminders 🔔
// Google Calendar-like notifications for study sessions
// ═══════════════════════════════════════════════════════════════

/**
 * Request notification permissions
 * @returns {Promise<boolean>} - Permission granted
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

/**
 * Show notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 */
export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/logo.png',
      badge: '/badge.png',
      ...options
    });
    
    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
    
    return notification;
  }
};

/**
 * Schedule notification for future time
 * @param {Date} time - When to notify
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 * @returns {number} - Timeout ID
 */
export const scheduleNotification = (time, title, options = {}) => {
  const now = new Date();
  const delay = time.getTime() - now.getTime();
  
  if (delay < 0) {
    console.warn('Cannot schedule notification in the past');
    return null;
  }
  
  const timeoutId = setTimeout(() => {
    showNotification(title, options);
  }, delay);
  
  // Store timeout ID for cancellation
  const scheduled = JSON.parse(localStorage.getItem('scheduled_notifications') || '[]');
  scheduled.push({
    id: timeoutId,
    time: time.toISOString(),
    title
  });
  localStorage.setItem('scheduled_notifications', JSON.stringify(scheduled));
  
  return timeoutId;
};

/**
 * Cancel scheduled notification
 * @param {number} timeoutId - Timeout ID to cancel
 */
export const cancelNotification = (timeoutId) => {
  clearTimeout(timeoutId);
  
  // Remove from storage
  const scheduled = JSON.parse(localStorage.getItem('scheduled_notifications') || '[]');
  const updated = scheduled.filter(n => n.id !== timeoutId);
  localStorage.setItem('scheduled_notifications', JSON.stringify(updated));
};

/**
 * Schedule study session notification
 * @param {object} session - Study session details
 */
export const scheduleStudyNotification = (session) => {
  const { time, subject, topic, duration } = session;
  const sessionTime = new Date(time);
  
  // Notify 10 minutes before
  const reminderTime = new Date(sessionTime.getTime() - 10 * 60 * 1000);
  scheduleNotification(reminderTime, `📚 Study Session Starting Soon!`, {
    body: `${subject} - ${topic} in 10 minutes`,
    tag: `study-${session.id}`,
    requireInteraction: true
  });
  
  // Notify at session start
  scheduleNotification(sessionTime, `🎯 Time to Study!`, {
    body: `${subject} - ${topic} (${duration} min)`,
    tag: `study-${session.id}-start`,
    requireInteraction: true
  });
};

/**
 * Schedule revision notification
 * @param {object} revision - Revision details
 */
export const scheduleRevisionNotification = (revision) => {
  const { date, subject, topic, revisionNumber } = revision;
  const revisionTime = new Date(date);
  revisionTime.setHours(9, 0, 0, 0); // Set to 9 AM
  
  scheduleNotification(revisionTime, `🔄 Revision ${revisionNumber} Due!`, {
    body: `Time to revise: ${subject} - ${topic}`,
    tag: `revision-${revision.id}`,
    requireInteraction: true,
    actions: [
      { action: 'done', title: 'Mark Done' },
      { action: 'snooze', title: 'Remind Later' }
    ]
  });
};

/**
 * Schedule exam notification
 * @param {object} exam - Exam details
 */
export const scheduleExamNotifications = (exam) => {
  const { date, subject } = exam;
  const examTime = new Date(date);
  
  // 7 days before
  const week = new Date(examTime.getTime() - 7 * 24 * 60 * 60 * 1000);
  week.setHours(9, 0, 0, 0);
  scheduleNotification(week, `📅 1 Week Until ${subject} Exam!`, {
    body: `Start final preparations`,
    tag: `exam-${exam.id}-week`
  });
  
  // 3 days before
  const threeDays = new Date(examTime.getTime() - 3 * 24 * 60 * 60 * 1000);
  threeDays.setHours(9, 0, 0, 0);
  scheduleNotification(threeDays, `⚠️ 3 Days Until ${subject} Exam!`, {
    body: `Focus on critical topics`,
    tag: `exam-${exam.id}-3days`
  });
  
  // 1 day before
  const tomorrow = new Date(examTime.getTime() - 1 * 24 * 60 * 60 * 1000);
  tomorrow.setHours(20, 0, 0, 0); // 8 PM
  scheduleNotification(tomorrow, `🎯 ${subject} Exam Tomorrow!`, {
    body: `Get good sleep, you're prepared!`,
    tag: `exam-${exam.id}-tomorrow`
  });
  
  // Exam day morning
  const morning = new Date(examTime);
  morning.setHours(7, 0, 0, 0); // 7 AM
  scheduleNotification(morning, `💪 ${subject} Exam Today!`, {
    body: `You've got this! Good luck!`,
    tag: `exam-${exam.id}-today`
  });
};

/**
 * Daily study reminder
 */
export const scheduleDailyReminder = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0); // 9 AM daily
  
  scheduleNotification(tomorrow, `☀️ Good Morning! Ready to Learn?`, {
    body: `Check your study plan for today`,
    tag: 'daily-reminder'
  });
  
  // Reschedule for next day
  setTimeout(() => scheduleDailyReminder(), 24 * 60 * 60 * 1000);
};

/**
 * Streak reminder (if no activity today)
 */
export const checkStreakAndNotify = () => {
  const lastActivity = localStorage.getItem('last_activity_date');
  const today = new Date().toISOString().split('T')[0];
  
  if (lastActivity !== today) {
    const evening = new Date();
    evening.setHours(20, 0, 0, 0); // 8 PM
    
    if (new Date() < evening) {
      scheduleNotification(evening, `🔥 Don't Break Your Streak!`, {
        body: `You haven't studied today. Keep it going!`,
        tag: 'streak-reminder'
      });
    }
  }
};

/**
 * Initialize notification system
 */
export const initializeNotifications = async () => {
  const granted = await requestNotificationPermission();
  
  if (granted) {
    console.log('✅ Notifications enabled');
    
    // Schedule daily reminder
    scheduleDailyReminder();
    
    // Check streak daily
    setInterval(checkStreakAndNotify, 60 * 60 * 1000); // Check hourly
    
    // Load and reschedule any pending notifications
    rescheduleStoredNotifications();
  } else {
    console.warn('⚠️ Notifications not permitted');
  }
  
  return granted;
};

/**
 * Reschedule notifications from storage (after page refresh)
 */
const rescheduleStoredNotifications = () => {
  const scheduled = JSON.parse(localStorage.getItem('scheduled_notifications') || '[]');
  const now = new Date();
  
  scheduled.forEach(notification => {
    const time = new Date(notification.time);
    if (time > now) {
      scheduleNotification(time, notification.title);
    }
  });
};

export default {
  requestNotificationPermission,
  showNotification,
  scheduleNotification,
  cancelNotification,
  scheduleStudyNotification,
  scheduleRevisionNotification,
  scheduleExamNotifications,
  scheduleDailyReminder,
  checkStreakAndNotify,
  initializeNotifications
};
