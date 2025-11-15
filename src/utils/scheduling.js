// ═══════════════════════════════════════════════════════════════
// CONVERSATIONAL SCHEDULING SERVICE
// ═══════════════════════════════════════════════════════════════
// Allows Luna to understand natural language scheduling requests

/**
 * Detect if user message is about scheduling
 */
export function detectSchedulingIntent(message) {
  const schedulingKeywords = [
    'schedule', 'plan', 'add to calendar', 'book', 'block time', 'remind me',
    'tomorrow', 'today', 'tonight', 'this week', 'next week', 'monday', 'tuesday',
    'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    ' am', ' pm', 'morning', 'afternoon', 'evening', 'night',
    'at ', 'from ', 'to ', 'for ', 'every ', 'daily', 'weekly'
  ];

  const lowerMessage = message.toLowerCase();
  return schedulingKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Parse natural language into schedule event
 */
export function parseScheduleRequest(message, currentDate = new Date()) {
  const lowerMessage = message.toLowerCase();
  
  // Extract activity/task name
  const activity = extractActivity(message);
  
  // Extract date
  const date = extractDate(lowerMessage, currentDate);
  
  // Extract time (with smart defaults)
  const startTime = extractTime(lowerMessage);
  
  // Extract duration
  const duration = extractDuration(lowerMessage);
  
  // Extract type
  const type = extractType(lowerMessage);
  
  // Success if we have at least activity and date
  // Time defaults to 10:00 AM if not specified
  return {
    activity,
    date,
    startTime,
    duration,
    type,
    success: !!(activity && date) // Only require activity and date
  };
}

/**
 * Extract activity name from message
 */
function extractActivity(message) {
  // Remove time-related words to get the activity
  let activity = message
    .replace(/tomorrow|today|tonight|this week|next week/gi, '')
    .replace(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/gi, '')
    .replace(/\d+:\d+\s*(am|pm)?/gi, '')
    .replace(/\d+\s*(am|pm)/gi, '')
    .replace(/at|from|to|for|schedule|plan|book|block/gi, '')
    .replace(/\d+\s*(minute|minutes|min|hour|hours|hr)/gi, '')
    .trim();
  
  // Capitalize first letter
  activity = activity.charAt(0).toUpperCase() + activity.slice(1);
  
  return activity || 'Study Session';
}

/**
 * Extract date from message
 */
function extractDate(message, currentDate) {
  const date = new Date(currentDate);
  
  if (message.includes('tomorrow')) {
    date.setDate(date.getDate() + 1);
  } else if (message.includes('today') || message.includes('tonight')) {
    // Keep current date
  } else if (message.includes('monday')) {
    return getNextDay(date, 1);
  } else if (message.includes('tuesday')) {
    return getNextDay(date, 2);
  } else if (message.includes('wednesday')) {
    return getNextDay(date, 3);
  } else if (message.includes('thursday')) {
    return getNextDay(date, 4);
  } else if (message.includes('friday')) {
    return getNextDay(date, 5);
  } else if (message.includes('saturday')) {
    return getNextDay(date, 6);
  } else if (message.includes('sunday')) {
    return getNextDay(date, 0);
  } else if (message.includes('this week')) {
    // Return array of dates for this week (Mon-Fri)
    return getWeekDates(date);
  }
  
  return date;
}

/**
 * Get next occurrence of a specific day of week
 */
function getNextDay(fromDate, targetDay) {
  const date = new Date(fromDate);
  const currentDay = date.getDay();
  let daysToAdd = targetDay - currentDay;
  
  if (daysToAdd <= 0) {
    daysToAdd += 7; // Next week
  }
  
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

/**
 * Get all weekday dates for current week
 */
function getWeekDates(fromDate) {
  const dates = [];
  const date = new Date(fromDate);
  
  // Get to Monday
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  
  // Add Mon-Fri
  for (let i = 0; i < 5; i++) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  
  return dates;
}

/**
 * Extract time from message
 */
function extractTime(message) {
  // Match patterns like "2 PM", "14:00", "2:30pm", "2:30 PM"
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)/i,  // 2:30 PM
    /(\d{1,2})\s*(am|pm)/i,           // 2 PM
    /(\d{1,2}):(\d{2})/,              // 14:00
  ];
  
  for (const pattern of timePatterns) {
    const match = message.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const period = match[3]?.toLowerCase();
      
      // Convert to 24-hour format
      if (period === 'pm' && hours < 12) {
        hours += 12;
      } else if (period === 'am' && hours === 12) {
        hours = 0;
      }
      
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }
  
  // Default times based on keywords
  if (message.includes('morning')) return '09:00';
  if (message.includes('afternoon')) return '14:00';
  if (message.includes('evening')) return '18:00';
  if (message.includes('night')) return '20:00';
  
  return '10:00'; // Default
}

/**
 * Extract duration from message
 */
function extractDuration(message) {
  // Match patterns like "90 minutes", "2 hours", "1.5 hours"
  const durationPatterns = [
    /(\d+\.?\d*)\s*(hour|hours|hr)/i,
    /(\d+)\s*(minute|minutes|min)/i,
  ];
  
  for (const pattern of durationPatterns) {
    const match = message.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.startsWith('hour') || unit === 'hr') {
        return Math.round(value * 60); // Convert to minutes
      } else {
        return Math.round(value);
      }
    }
  }
  
  // Check for "from X to Y" pattern
  const rangeMatch = message.match(/from\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?\s+to\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (rangeMatch) {
    // Parse start and end times, calculate duration
    // This is simplified - would need full implementation
    return 60; // Default 1 hour
  }
  
  return 60; // Default 1 hour
}

/**
 * Determine event type from message
 */
function extractType(message) {
  if (message.match(/study|learn|practice|homework|assignment|exam|revision/i)) {
    return 'study';
  }
  if (message.match(/break|rest|lunch|dinner|meal|snack/i)) {
    return 'break';
  }
  if (message.match(/gym|workout|exercise|fitness|run|yoga/i)) {
    return 'personal';
  }
  return 'other';
}

/**
 * Format date for user-friendly display
 */
export function formatUserFriendlyDate(date) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (isSameDay(date, today)) {
    return 'Today';
  } else if (isSameDay(date, tomorrow)) {
    return 'Tomorrow';
  } else {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  }
}

/**
 * Format time for user-friendly display
 */
export function formatUserFriendlyTime(time24) {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Format date as YYYY-MM-DD for storage
 */
export function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
