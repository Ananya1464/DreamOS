/**
 * Intent Parser - Detects actionable intents from Luna's responses
 * Parses structured action proposals and extracts parameters
 */

/**
 * Action types that Luna can propose
 */
export const ACTION_TYPES = {
  ADD_SCHEDULE: 'add_schedule',
  CREATE_TASK: 'create_task',
  EXTRACT_TOPICS: 'extract_topics',
  UPDATE_SUBJECT: 'update_subject',
  ADJUST_SCHEDULE: 'adjust_schedule',
};

/**
 * Parses Luna's response for action proposals
 * Expected format in Luna's response:
 * [ACTION:type|param1:value1|param2:value2]
 * 
 * Example: [ACTION:add_schedule|subject:Mathematics|startTime:14:00|duration:60|date:2025-11-13]
 */
export const parseActions = (responseText) => {
  const actions = [];
  
  // Match all action blocks in the response
  const actionRegex = /\[ACTION:([\w_]+)\|(.*?)\]/g;
  let match;
  
  while ((match = actionRegex.exec(responseText)) !== null) {
    const actionType = match[1];
    const paramsString = match[2];
    
    // Parse parameters
    const params = {};
    const paramPairs = paramsString.split('|');
    
    paramPairs.forEach(pair => {
      const [key, value] = pair.split(':');
      if (key && value) {
        params[key.trim()] = value.trim();
      }
    });
    
    actions.push({
      type: actionType,
      params,
      rawText: match[0], // Keep original for removal after confirmation
    });
  }
  
  return actions;
};

/**
 * Removes action blocks from text to get clean response
 */
export const stripActions = (responseText) => {
  return responseText.replace(/\[ACTION:[\w_]+\|.*?\]/g, '').trim();
};

/**
 * Validates action parameters based on action type
 */
export const validateAction = (action) => {
  const { type, params } = action;
  
  switch (type) {
    case ACTION_TYPES.ADD_SCHEDULE:
      return (
        params.subject &&
        params.startTime &&
        params.duration &&
        params.date
      );
      
    case ACTION_TYPES.CREATE_TASK:
      return (
        params.subject &&
        params.title &&
        params.priority
      );
      
    case ACTION_TYPES.EXTRACT_TOPICS:
      return (
        params.subject &&
        params.topics // comma-separated topics
      );
      
    case ACTION_TYPES.UPDATE_SUBJECT:
      return (
        params.subject &&
        (params.newName || params.color || params.priority)
      );
      
    case ACTION_TYPES.ADJUST_SCHEDULE:
      return (
        params.scheduleId &&
        (params.newStartTime || params.newDuration)
      );
      
    default:
      return false;
  }
};

/**
 * Generates human-readable description of action
 */
export const getActionDescription = (action) => {
  const { type, params } = action;
  
  switch (type) {
    case ACTION_TYPES.ADD_SCHEDULE:
      return `Add ${params.duration}-minute study session for ${params.subject} at ${params.startTime} on ${params.date}`;
      
    case ACTION_TYPES.CREATE_TASK:
      return `Create ${params.priority} priority task: "${params.title}" for ${params.subject}`;
      
    case ACTION_TYPES.EXTRACT_TOPICS:
      const topicList = params.topics.split(',').map(t => t.trim()).join(', ');
      return `Add topics to ${params.subject}: ${topicList}`;
      
    case ACTION_TYPES.UPDATE_SUBJECT:
      const changes = [];
      if (params.newName) changes.push(`rename to "${params.newName}"`);
      if (params.color) changes.push(`change color to ${params.color}`);
      if (params.priority) changes.push(`set priority to ${params.priority}`);
      return `Update ${params.subject}: ${changes.join(', ')}`;
      
    case ACTION_TYPES.ADJUST_SCHEDULE:
      const adjustments = [];
      if (params.newStartTime) adjustments.push(`start at ${params.newStartTime}`);
      if (params.newDuration) adjustments.push(`duration ${params.newDuration} minutes`);
      return `Adjust schedule: ${adjustments.join(', ')}`;
      
    default:
      return 'Unknown action';
  }
};

/**
 * Gets icon for action type (returns emoji for simplicity)
 */
export const getActionIcon = (actionType) => {
  switch (actionType) {
    case ACTION_TYPES.ADD_SCHEDULE:
      return '📅';
    case ACTION_TYPES.CREATE_TASK:
      return '✅';
    case ACTION_TYPES.EXTRACT_TOPICS:
      return '📝';
    case ACTION_TYPES.UPDATE_SUBJECT:
      return '✏️';
    case ACTION_TYPES.ADJUST_SCHEDULE:
      return '⏰';
    default:
      return '🔧';
  }
};
