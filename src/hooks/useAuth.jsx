// useAuth Hook - Firebase Authentication
import { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { syncToCloud, getFromCloud } from '../services/sync';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        console.log('✅ User logged in:', user.email);
        
        // Initial sync on login
        syncUserData(user.uid);
      } else {
        console.log('👤 No user logged in');
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync all localStorage data to cloud
  const syncUserData = async (userId) => {
    try {
      const cloudData = await getFromCloud(userId);
      
      if (!cloudData) {
        // First time login - upload local data
        const localData = {
          subjects: JSON.parse(localStorage.getItem('subjects') || '{}'),
          schedule: JSON.parse(localStorage.getItem('schedule') || '{}'),
          user: JSON.parse(localStorage.getItem('user') || '{}'),
          gre: JSON.parse(localStorage.getItem('gre') || '{}'),
          goals: JSON.parse(localStorage.getItem('goals') || '[]'),
          savedContent: JSON.parse(localStorage.getItem('savedContent') || '{}'),
        };

        await syncToCloud(userId, localData, false);
        console.log('✅ Initial data synced to cloud');
      } else {
        // Merge cloud data with local
        console.log('☁️ Cloud data found, merging...');
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      setError(error.message);
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Sign in with email/password
  const signInWithEmail = async (email, password) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      setError(error.message);
      console.error('Email sign-in error:', error);
      throw error;
    }
  };

  // Sign up with email/password
  const signUpWithEmail = async (email, password, displayName) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      return result.user;
    } catch (error) {
      setError(error.message);
      console.error('Sign-up error:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      console.log('✅ User logged out');
    } catch (error) {
      setError(error.message);
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
