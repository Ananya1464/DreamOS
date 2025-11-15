// useFirebaseSync Hook - Real-time cloud sync
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  syncToCloud, 
  getFromCloud, 
  listenToUpdates,
  updateCloudField,
  mergeData 
} from '../services/sync';

/**
 * Hook for syncing data to Firebase Firestore
 * @param {string} key - localStorage key (e.g., 'subjects')
 * @param {any} initialValue - Initial value if no data exists
 * @returns {[value, setValue, syncing, error]}
 */
export const useFirebaseSync = (key, initialValue) => {
  const { user } = useAuth();
  const [value, setValue] = useState(initialValue);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (!user?.uid) {
      // Not logged in, use localStorage only
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          setValue(JSON.parse(localData));
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
      setLoaded(true);
      return;
    }

    // Logged in, sync with cloud
    loadFromCloud();
  }, [user?.uid, key]);

  // Load from cloud
  const loadFromCloud = async () => {
    if (!user?.uid) return;

    setSyncing(true);
    try {
      const cloudData = await getFromCloud(user.uid);
      const localData = localStorage.getItem(key);
      const localParsed = localData ? JSON.parse(localData) : null;

      // Merge local and cloud data
      const merged = mergeData(localParsed, cloudData);
      
      if (merged && merged[key]) {
        setValue(merged[key]);
        localStorage.setItem(key, JSON.stringify(merged[key]));
      }

      setLoaded(true);
    } catch (err) {
      setError(err);
      console.error('Load error:', err);
      
      // Fallback to localStorage
      const localData = localStorage.getItem(key);
      if (localData) {
        setValue(JSON.parse(localData));
      }
      setLoaded(true);
    } finally {
      setSyncing(false);
    }
  };

  // Listen to real-time updates
  useEffect(() => {
    if (!user?.uid || !loaded) return;

    const unsubscribe = listenToUpdates(user.uid, (data) => {
      if (data[key]) {
        setValue(data[key]);
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    });

    return () => unsubscribe();
  }, [user?.uid, key, loaded]);

  // Update value (local + cloud)
  const updateValue = useCallback(
    async (newValue) => {
      // Update local state immediately (optimistic update)
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));

      // Sync to cloud
      if (user?.uid) {
        setSyncing(true);
        try {
          await syncToCloud(user.uid, { [key]: newValue });
          setError(null);
        } catch (err) {
          setError(err);
          console.error('Sync error:', err);
        } finally {
          setSyncing(false);
        }
      }
    },
    [user?.uid, key]
  );

  // Update specific field
  const updateField = useCallback(
    async (fieldPath, fieldValue) => {
      // Update local state
      const newValue = { ...value };
      const keys = fieldPath.split('.');
      let current = newValue;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = fieldValue;
      
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));

      // Sync to cloud
      if (user?.uid) {
        setSyncing(true);
        try {
          await updateCloudField(user.uid, `${key}.${fieldPath}`, fieldValue);
          setError(null);
        } catch (err) {
          setError(err);
        } finally {
          setSyncing(false);
        }
      }
    },
    [user?.uid, key, value]
  );

  return [value, updateValue, { syncing, error, loaded, updateField }];
};
