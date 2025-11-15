/**
 * Action Executor - Executes approved actions and modifies Firebase
 */

import { db, auth } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  getDoc,
  setDoc 
} from 'firebase/firestore';
import { ACTION_TYPES } from './intentParser';

/**
 * Executes an action and returns success/error status
 */
export const executeAction = async (action) => {
  const userId = auth.currentUser?.uid;
  
  if (!userId) {
    return {
      success: false,
      error: 'User not authenticated',
    };
  }

  try {
    switch (action.type) {
      case ACTION_TYPES.ADD_SCHEDULE:
        return await addScheduleBlock(userId, action.params);
        
      case ACTION_TYPES.CREATE_TASK:
        return await createTask(userId, action.params);
        
      case ACTION_TYPES.EXTRACT_TOPICS:
        return await extractTopics(userId, action.params);
        
      case ACTION_TYPES.UPDATE_SUBJECT:
        return await updateSubject(userId, action.params);
        
      case ACTION_TYPES.ADJUST_SCHEDULE:
        return await adjustSchedule(userId, action.params);
        
      default:
        return {
          success: false,
          error: 'Unknown action type',
        };
    }
  } catch (error) {
    console.error('Action execution error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Add a schedule block to Firebase
 */
const addScheduleBlock = async (userId, params) => {
  const { subject, startTime, duration, date } = params;
  
  const scheduleRef = collection(db, `users/${userId}/schedule`);
  
  const scheduleBlock = {
    subject,
    startTime,
    duration: parseInt(duration),
    date,
    completed: false,
    actualDuration: null,
    createdAt: serverTimestamp(),
    createdBy: 'luna-ai',
  };
  
  const docRef = await addDoc(scheduleRef, scheduleBlock);
  
  return {
    success: true,
    message: `Added ${duration}-minute study session for ${subject}`,
    data: { id: docRef.id, ...scheduleBlock },
  };
};

/**
 * Create a task in Firebase
 */
const createTask = async (userId, params) => {
  const { subject, title, priority, dueDate } = params;
  
  const tasksRef = collection(db, `users/${userId}/tasks`);
  
  const task = {
    subject,
    title,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    completed: false,
    createdAt: serverTimestamp(),
    createdBy: 'luna-ai',
  };
  
  const docRef = await addDoc(tasksRef, task);
  
  return {
    success: true,
    message: `Created task: "${title}"`,
    data: { id: docRef.id, ...task },
  };
};

/**
 * Extract topics and add them to a subject
 */
const extractTopics = async (userId, params) => {
  const { subject, topics } = params;
  
  // Parse topics (comma-separated)
  const topicList = topics.split(',').map(t => t.trim()).filter(t => t);
  
  // Get subject document
  const subjectsRef = collection(db, `users/${userId}/subjects`);
  const subjectQuery = await getDoc(doc(subjectsRef, subject));
  
  if (!subjectQuery.exists()) {
    // Create subject if it doesn't exist
    await setDoc(doc(subjectsRef, subject), {
      name: subject,
      topics: topicList,
      createdAt: serverTimestamp(),
      createdBy: 'luna-ai',
    });
    
    return {
      success: true,
      message: `Created subject "${subject}" with ${topicList.length} topics`,
      data: { subject, topics: topicList },
    };
  }
  
  // Add topics to existing subject
  const subjectDoc = doc(subjectsRef, subject);
  await updateDoc(subjectDoc, {
    topics: arrayUnion(...topicList),
    updatedAt: serverTimestamp(),
  });
  
  return {
    success: true,
    message: `Added ${topicList.length} topics to ${subject}`,
    data: { subject, addedTopics: topicList },
  };
};

/**
 * Update subject properties
 */
const updateSubject = async (userId, params) => {
  const { subject, newName, color, priority } = params;
  
  const subjectDoc = doc(db, `users/${userId}/subjects`, subject);
  const docSnap = await getDoc(subjectDoc);
  
  if (!docSnap.exists()) {
    return {
      success: false,
      error: `Subject "${subject}" not found`,
    };
  }
  
  const updates = {
    updatedAt: serverTimestamp(),
  };
  
  if (newName) updates.name = newName;
  if (color) updates.color = color;
  if (priority) updates.priority = priority;
  
  await updateDoc(subjectDoc, updates);
  
  const changes = [];
  if (newName) changes.push(`renamed to "${newName}"`);
  if (color) changes.push(`color changed`);
  if (priority) changes.push(`priority updated`);
  
  return {
    success: true,
    message: `Updated ${subject}: ${changes.join(', ')}`,
    data: updates,
  };
};

/**
 * Adjust an existing schedule block
 */
const adjustSchedule = async (userId, params) => {
  const { scheduleId, newStartTime, newDuration } = params;
  
  const scheduleDoc = doc(db, `users/${userId}/schedule`, scheduleId);
  const docSnap = await getDoc(scheduleDoc);
  
  if (!docSnap.exists()) {
    return {
      success: false,
      error: 'Schedule block not found',
    };
  }
  
  const updates = {
    updatedAt: serverTimestamp(),
  };
  
  if (newStartTime) updates.startTime = newStartTime;
  if (newDuration) updates.duration = parseInt(newDuration);
  
  await updateDoc(scheduleDoc, updates);
  
  return {
    success: true,
    message: 'Schedule adjusted successfully',
    data: updates,
  };
};

/**
 * Batch execute multiple actions
 */
export const executeBatchActions = async (actions) => {
  const results = [];
  
  for (const action of actions) {
    const result = await executeAction(action);
    results.push({
      action,
      result,
    });
  }
  
  const successCount = results.filter(r => r.result.success).length;
  const failureCount = results.length - successCount;
  
  return {
    results,
    summary: {
      total: results.length,
      success: successCount,
      failed: failureCount,
    },
  };
};
