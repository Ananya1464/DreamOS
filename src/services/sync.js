// Real-time Sync Service
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Sync user data to Firestore
 * @param {string} userId - User ID
 * @param {object} data - Data to sync
 * @param {boolean} merge - Merge with existing data
 */
export const syncToCloud = async (userId, data, merge = true) => {
  if (!userId) {
    console.warn('⚠️ No user ID provided for sync');
    return false;
  }

  try {
    const userRef = doc(db, 'users', userId);
    
    // Add timestamp
    const dataWithTimestamp = {
      ...data,
      lastUpdated: serverTimestamp()
    };

    if (merge) {
      await setDoc(userRef, dataWithTimestamp, { merge: true });
    } else {
      await setDoc(userRef, dataWithTimestamp);
    }

    console.log('✅ Data synced to cloud');
    return true;
  } catch (error) {
    console.error('❌ Sync error:', error);
    
    // Queue for later if offline
    if (error.code === 'unavailable') {
      queueOfflineUpdate(userId, data);
    }
    
    return false;
  }
};

/**
 * Get user data from Firestore
 * @param {string} userId - User ID
 */
export const getFromCloud = async (userId) => {
  if (!userId) return null;

  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      console.log('✅ Data loaded from cloud');
      return docSnap.data();
    } else {
      console.log('📝 No cloud data found, creating new document');
      return null;
    }
  } catch (error) {
    console.error('❌ Load error:', error);
    return null;
  }
};

/**
 * Listen to real-time updates
 * @param {string} userId - User ID
 * @param {function} callback - Function to call on updates
 * @returns {function} - Unsubscribe function
 */
export const listenToUpdates = (userId, callback) => {
  if (!userId) {
    console.warn('⚠️ No user ID provided for listener');
    return () => {};
  }

  const userRef = doc(db, 'users', userId);

  const unsubscribe = onSnapshot(
    userRef,
    (doc) => {
      if (doc.exists()) {
        console.log('🔄 Real-time update received');
        callback(doc.data());
      }
    },
    (error) => {
      console.error('❌ Listener error:', error);
    }
  );

  return unsubscribe;
};

/**
 * Update specific field in cloud
 * @param {string} userId - User ID
 * @param {string} field - Field path (e.g., 'subjects.vlsi.progress')
 * @param {any} value - New value
 */
export const updateCloudField = async (userId, field, value) => {
  if (!userId) return false;

  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      [field]: value,
      lastUpdated: serverTimestamp()
    });

    console.log(`✅ Updated ${field} in cloud`);
    return true;
  } catch (error) {
    console.error('❌ Update error:', error);
    return false;
  }
};

/**
 * Offline queue for failed updates
 */
const offlineQueue = [];

const queueOfflineUpdate = (userId, data) => {
  offlineQueue.push({ userId, data, timestamp: Date.now() });
  localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));
  console.log('📝 Queued update for when online');
};

/**
 * Process offline queue when back online
 */
export const processOfflineQueue = async () => {
  const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  
  if (queue.length === 0) return;

  console.log(`🔄 Processing ${queue.length} offline updates...`);

  for (const item of queue) {
    await syncToCloud(item.userId, item.data);
  }

  localStorage.removeItem('offlineQueue');
  console.log('✅ Offline queue processed');
};

/**
 * Enable/disable network (for testing)
 */
export const toggleNetwork = async (enable) => {
  try {
    if (enable) {
      await enableNetwork(db);
      console.log('✅ Network enabled');
    } else {
      await disableNetwork(db);
      console.log('📴 Network disabled');
    }
  } catch (error) {
    console.error('❌ Network toggle error:', error);
  }
};

/**
 * Merge local and cloud data (conflict resolution)
 * @param {object} localData - Data from localStorage
 * @param {object} cloudData - Data from Firestore
 * @returns {object} - Merged data
 */
export const mergeData = (localData, cloudData) => {
  if (!localData) return cloudData;
  if (!cloudData) return localData;

  // Strategy: Latest timestamp wins
  const localTime = localData.lastUpdated || 0;
  const cloudTime = cloudData.lastUpdated?.toMillis?.() || 0;

  if (cloudTime > localTime) {
    console.log('☁️ Cloud data is newer, using cloud');
    return cloudData;
  } else {
    console.log('💾 Local data is newer, syncing to cloud');
    return localData;
  }
};
