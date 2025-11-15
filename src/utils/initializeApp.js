// ═══════════════════════════════════════════════════════════════
// APP INITIALIZATION - Set up fresh data structure
// ═══════════════════════════════════════════════════════════════

import { saveSubjects, saveUser, loadSubjects, loadUser } from './storage';

/**
 * Initialize app with empty data structure (0% progress)
 * Only runs if no data exists
 */
export const initializeAppData = () => {
  const existingSubjects = loadSubjects();
  const existingUser = loadUser();
  
  // Only initialize if truly empty
  if (!existingSubjects || Object.keys(existingSubjects).length === 0) {
    console.log('📦 Initializing fresh app data structure...');
    
    // Empty subjects structure - user will add their own
    const emptySubjects = {};
    
    saveSubjects(emptySubjects);
    console.log('✅ Subjects initialized (empty - 0% progress)');
  }
  
  if (!existingUser) {
    // Basic user profile
    const defaultUser = {
      name: "Student",
      currentStreak: 0,
      lastStudyDate: null,
      totalStudyTime: 0,
      createdAt: new Date().toISOString()
    };
    
    saveUser(defaultUser);
    console.log('✅ User profile initialized');
  }
  
  console.log('🎉 App ready! Progress: 0%');
};

/**
 * Initialize with sample subjects (for demo/testing)
 * Call this manually if user wants sample data
 */
export const initializeSampleData = () => {
  console.log('📦 Initializing with sample subjects...');
  
  const sampleSubjects = {
    vlsi: {
      id: "vlsi",
      name: "VLSI Design",
      color: "#C5A3FF",
      status: "active",
      startDate: new Date().toISOString().split('T')[0],
      examDate: "2025-11-14",
      topics: [
        {
          id: "vlsi_topic1",
          name: "Memory Design",
          priority: "CRITICAL",
          mastery: 0,
          co: "CO1",
          estimatedHours: 4
        },
        {
          id: "vlsi_topic2",
          name: "CMOS Inverter",
          priority: "HIGH",
          mastery: 0,
          co: "CO2",
          estimatedHours: 3
        }
      ]
    },
    networks: {
      id: "networks",
      name: "Computer Networks",
      color: "#80D6D6",
      status: "active",
      startDate: new Date().toISOString().split('T')[0],
      examDate: "2025-11-20",
      topics: [
        {
          id: "networks_topic1",
          name: "OSI Model",
          priority: "CRITICAL",
          mastery: 0,
          co: "CO1",
          estimatedHours: 3
        },
        {
          id: "networks_topic2",
          name: "TCP/IP",
          priority: "HIGH",
          mastery: 0,
          co: "CO2",
          estimatedHours: 4
        }
      ]
    }
  };
  
  saveSubjects(sampleSubjects);
  
  const sampleUser = {
    name: "Beautiful Soul",
    dream: "Masters @ Singapore 🇸🇬",
    currentStreak: 0,
    lastStudyDate: null,
    totalStudyTime: 0,
    createdAt: new Date().toISOString()
  };
  
  saveUser(sampleUser);
  
  console.log('✅ Sample data loaded (2 subjects, 0% progress)');
  console.log('💡 Complete study sessions to increase progress!');
};

/**
 * Check if app needs initialization
 */
export const needsInitialization = () => {
  const subjects = loadSubjects();
  const user = loadUser();
  
  return !subjects && !user;
};

export default {
  initializeAppData,
  initializeSampleData,
  needsInitialization
};
