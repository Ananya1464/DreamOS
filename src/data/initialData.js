// ═══════════════════════════════════════════════════════════════
// INITIAL DATA - Sample data for BrutalOS 🌸
// ═══════════════════════════════════════════════════════════════

const INITIAL_DATA = {
  // USER PROFILE
  user: {
    name: "Beautiful Soul",
    dream: "Masters @ Singapore 🇸🇬",
    motto: "Not average. Disgustingly educated.",
    currentStreak: 5,
    totalStudyHours: 87,
  },

  // SUBJECTS & EXAMS - Enhanced with Lifecycle Management
  subjects: {
    vlsi: {
      // Basic Info
      id: "vlsi",
      name: "VLSI Design",
      color: "#C5A3FF",
      
      // Lifecycle
      status: "active",  // active | archived | paused | upcoming
      startDate: "2024-09-01",
      examDate: "2025-11-14",  // Nov 14, 2025
      completedDate: null,
      archivedDate: null,
      
      // Learning Progress
      targetScore: 55,
      actualScore: null,  // Filled after exam
      weight: 20,
      totalHours: 45,
      hoursCompleted: 28,
      
      // Metadata
      type: "technical",  // technical | language | certification | personal
      semester: "Fall 2024",
      importance: "high",
      
      // Archive Settings
      keepAfterCompletion: true,
      exportBeforeArchive: true,
      
      topics: [
        {
          name: "MOS Transistor Theory",
          weight: 15,
          mastery: 65,
          nextRevision: "2024-11-15",
          revisions: [
            { completed: true, date: "2024-10-20" },
            { completed: true, date: "2024-11-05" },
            { completed: false, date: null },
          ],
        },
        {
          name: "CMOS Inverter & Logic Gates",
          weight: 25,
          mastery: 35,
          nextRevision: "2024-11-14",
          revisions: [
            { completed: true, date: "2024-10-22" },
            { completed: false, date: null },
            { completed: false, date: null },
          ],
        },
        {
          name: "Memory Design",
          weight: 20,
          mastery: 0,
          nextRevision: "2024-11-13",
          revisions: [
            { completed: false, date: null },
            { completed: false, date: null },
            { completed: false, date: null },
          ],
        },
      ],
    },
    iot: {
      id: "iot",
      name: "Internet of Things",
      color: "#80D6D6",
      status: "active",
      startDate: "2024-09-01",
      examDate: "2025-11-17",  // Nov 17, 2025
      completedDate: null,
      archivedDate: null,
      targetScore: 55,
      actualScore: null,
      weight: 20,
      totalHours: 40,
      hoursCompleted: 25,
      type: "technical",
      semester: "Fall 2024",
      importance: "high",
      keepAfterCompletion: true,
      exportBeforeArchive: true,
      topics: [
        {
          name: "IoT Architecture",
          weight: 30,
          mastery: 75,
          nextRevision: "2024-11-16",
          revisions: [
            { completed: true, date: "2024-10-18" },
            { completed: true, date: "2024-11-03" },
            { completed: false, date: null },
          ],
        },
        {
          name: "Sensors & Actuators",
          weight: 25,
          mastery: 60,
          nextRevision: "2024-11-17",
          revisions: [
            { completed: true, date: "2024-10-19" },
            { completed: true, date: "2024-11-04" },
            { completed: false, date: null },
          ],
        },
      ],
    },
    dl: {
      id: "dl",
      name: "Deep Learning",
      color: "#FFB5C0",
      status: "active",
      startDate: "2024-09-01",
      examDate: "2025-11-19",  // Nov 19, 2025
      completedDate: null,
      archivedDate: null,
      targetScore: 55,
      actualScore: null,
      weight: 20,
      totalHours: 50,
      hoursCompleted: 35,
      type: "technical",
      semester: "Fall 2024",
      importance: "high",
      keepAfterCompletion: true,
      exportBeforeArchive: true,
      weight: 20,
      topics: [
        {
          name: "Neural Networks",
          weight: 25,
          mastery: 80,
          nextRevision: "2024-11-18",
          revisions: [
            { completed: true, date: "2024-10-15" },
            { completed: true, date: "2024-11-01" },
            { completed: true, date: "2024-11-10" },
          ],
        },
        {
          name: "CNN Architecture",
          weight: 30,
          mastery: 55,
          nextRevision: "2024-11-15",
          revisions: [
            { completed: true, date: "2024-10-20" },
            { completed: true, date: "2024-11-06" },
            { completed: false, date: null },
          ],
        },
      ],
    },
    cc: {
      id: "cc",
      name: "Cloud Computing",
      color: "#C5E3F6",
      status: "active",
      startDate: "2024-09-01",
      examDate: "2025-11-21",  // Nov 21, 2025
      completedDate: null,
      archivedDate: null,
      targetScore: 55,
      actualScore: null,
      weight: 20,
      totalHours: 35,
      hoursCompleted: 22,
      type: "technical",
      semester: "Fall 2024",
      importance: "medium",
      keepAfterCompletion: true,
      exportBeforeArchive: true,
      weight: 20,
      topics: [
        {
          name: "Cloud Fundamentals",
          weight: 30,
          mastery: 70,
          nextRevision: "2024-11-19",
          revisions: [
            { completed: true, date: "2024-10-16" },
            { completed: true, date: "2024-11-02" },
            { completed: false, date: null },
          ],
        },
      ],
    },
    mis: {
      id: "mis",
      name: "Management IS",
      color: "#FFE5D9",
      status: "active",
      startDate: "2024-09-01",
      examDate: "2025-11-25",  // Nov 25, 2025
      completedDate: null,
      archivedDate: null,
      targetScore: 55,
      actualScore: null,
      weight: 20,
      totalHours: 30,
      hoursCompleted: 24,
      type: "technical",
      semester: "Fall 2024",
      importance: "medium",
      keepAfterCompletion: true,
      exportBeforeArchive: true,
      topics: [
        {
          name: "MIS Fundamentals",
          weight: 35,
          mastery: 85,
          nextRevision: "2024-11-20",
          revisions: [
            { completed: true, date: "2024-10-12" },
            { completed: true, date: "2024-10-28" },
            { completed: true, date: "2024-11-08" },
          ],
        },
      ],
    },
    aiml: {
      id: "aiml",
      name: "AI & Machine Learning",
      color: "#B8DDF0",
      status: "active",
      startDate: "2024-09-01",
      examDate: "2025-11-27",  // Nov 27, 2025
      completedDate: null,
      archivedDate: null,
      targetScore: 55,
      actualScore: null,
      weight: 20,
      totalHours: 42,
      hoursCompleted: 30,
      type: "technical",
      semester: "Fall 2024",
      importance: "high",
      keepAfterCompletion: true,
      exportBeforeArchive: true,
      topics: [
        {
          name: "Supervised Learning",
          weight: 30,
          mastery: 60,
          nextRevision: "2024-11-17",
          revisions: [
            { completed: true, date: "2024-10-14" },
            { completed: true, date: "2024-11-01" },
            { completed: false, date: null },
          ],
        },
        {
          name: "Neural Networks Basics",
          weight: 25,
          mastery: 45,
          nextRevision: "2024-11-16",
          revisions: [
            { completed: true, date: "2024-10-21" },
            { completed: false, date: null },
            { completed: false, date: null },
          ],
        },
      ],
    },
  },

  // SCHEDULE
  schedule: {
    currentDate: "2024-11-14",
    blocks: [
      { time: "06:00", duration: 60, activity: "Morning Routine", type: "personal", color: "#FFE5D9", completed: true },
      { time: "07:00", duration: 30, activity: "GRE Vocab", type: "gre", color: "#C5E3F6", completed: true },
      { time: "07:30", duration: 150, activity: "VLSI - Memory Design", type: "study", color: "#C5A3FF", completed: true },
      { time: "10:00", duration: 30, activity: "Break", type: "break", color: "#D5F4E6", completed: true },
      { time: "10:30", duration: 120, activity: "IOT - Protocols R2", type: "study", color: "#80D6D6", completed: false },
      { time: "12:30", duration: 60, activity: "Lunch", type: "break", color: "#D5F4E6", completed: false },
      { time: "13:30", duration: 120, activity: "Deep Learning - CNN", type: "study", color: "#FFB5C0", completed: false },
      { time: "15:30", duration: 30, activity: "Break", type: "break", color: "#D5F4E6", completed: false },
      { time: "16:00", duration: 90, activity: "GRE Reading", type: "gre", color: "#C5E3F6", completed: false },
      { time: "17:30", duration: 60, activity: "Exercise", type: "personal", color: "#FFE5D9", completed: false },
      { time: "18:30", duration: 60, activity: "Dinner", type: "break", color: "#D5F4E6", completed: false },
      { time: "19:30", duration: 90, activity: "Cloud Computing Review", type: "study", color: "#C5E3F6", completed: false },
    ],
  },

  // AI AGENT
  agent: {
    name: "Luna",
    avatar: "🌙",
    mode: "Morning Planner",
    conversations: [
      {
        id: 1,
        timestamp: "2024-11-14T08:00:00",
        sender: "agent",
        message: "☀️ Good morning, beautiful soul! Today is November 14, 2024.\n\nYou have 6 days until VLSI (your first exam).\n\nToday's focus:\n1. VLSI Memory Design R1 (2.5h) - This is 20% of your exam!\n2. IOT Protocols R2 (2h)\n3. GRE practice (2h total)\n\nYou're at 68% overall progress. Let's make today count! 💪",
      },
      {
        id: 2,
        timestamp: "2024-11-14T10:05:00",
        sender: "user",
        message: "Just finished VLSI session!",
      },
      {
        id: 3,
        timestamp: "2024-11-14T10:05:30",
        sender: "agent",
        message: "🎉 That's amazing! You crushed that VLSI session.\n\nMemory Design is now at R1 complete. Your VLSI mastery just jumped to 45%!\n\nTake your break, then IOT Protocols is up next. You've got this! 🌟",
      },
    ],
  },

  // GRE TRACKER
  gre: {
    examDate: "2025-12-10",
    targetScore: 320,
    verbal: { current: 152, target: 160, progress: 45 },
    quant: { current: 158, target: 160, progress: 70 },
    writing: { current: 3.5, target: 4.5, progress: 40 },
    vocab: { learned: 420, target: 1000 },
    reading: { pagesRead: 180, target: 600 },
  },

  // SAVED CONTENT
  savedContent: {
    instagram: [
      {
        id: "ig1",
        title: "10 Study Tips for Better Retention",
        creator: "@studywithme",
        category: "Education",
        savedDate: "2024-10-15",
        watched: true,
      },
      {
        id: "ig2",
        title: "Deep Work Strategies",
        creator: "@productivitypro",
        category: "Productivity",
        savedDate: "2024-09-20",
        watched: false,
      },
      {
        id: "ig3",
        title: "How I Got Into MIT",
        creator: "@collegelife",
        category: "Education",
        savedDate: "2024-08-10",
        watched: false,
      },
    ],
    youtube: [
      {
        id: "yt1",
        title: "Advanced VLSI Design Tutorial",
        creator: "TechGuru",
        category: "Tech",
        duration: 45,
        savedDate: "2024-10-20",
        watched: true,
      },
      {
        id: "yt2",
        title: "GRE Verbal Masterclass",
        creator: "GRE Prep",
        category: "Education",
        duration: 120,
        savedDate: "2024-09-05",
        watched: false,
      },
      {
        id: "yt3",
        title: "Study Vlog - 12 Hours",
        creator: "StudyWithJess",
        category: "Lifestyle",
        duration: 30,
        savedDate: "2024-07-15",
        watched: false,
      },
    ],
  },

  // JOURNAL
  journal: {
    daily: [
      {
        date: "2024-11-13",
        mood: "😊",
        wentWell: "Completed 3 revision sessions today! VLSI is finally starting to click.",
        challenges: "Struggled with timing analysis concepts. Need to revisit with fresh eyes.",
        learned: "Taking breaks actually helps me retain information better. The pomodoro technique works!",
      },
      {
        date: "2024-11-12",
        mood: "🤔",
        wentWell: "Got through GRE vocab - 30 new words learned.",
        challenges: "Felt overwhelmed by the amount left to cover. Had a mini panic moment.",
        learned: "It's okay to feel overwhelmed. Breaking tasks into smaller chunks helps manage anxiety.",
      },
    ],
    weekly: [
      {
        week: "Week of Nov 6-12",
        moodCalendar: ["😊", "😊", "😰", "😌", "🤔", "😊", "🥳"],
        feelings: ["Proud of myself", "Focused", "Motivated", "Grateful"],
        biggestWin: "Completed all three revisions for Neural Networks and aced the practice test!",
        learned: "I work best in the morning. Evening study sessions aren't as productive for me.",
      },
    ],
    dreams: [
      {
        date: "2024-11-11",
        description: "I was presenting my research at a big conference in Singapore. Everyone was impressed and I felt so confident. The room was filled with students from all over the world.",
        feelings: "Excited, proud, a little nervous but in a good way",
        insights: "This dream reminds me why I'm working so hard. The vision of studying in Singapore keeps me motivated.",
      },
    ],
  },

  // HABITS
  habits: {
    current: {
      name: "Morning Run",
      emoji: "🏃‍♀️",
      description: "Build from 1km to 5km over 4 weeks",
      currentValue: 2.5,
      targetValue: 5,
      unit: "km",
      currentWeek: 2,
      totalWeeks: 4,
      streak: 5,
      startDate: "2024-11-01",
      motivation: "Running clears my mind and gives me energy for intense study sessions. Plus, staying fit is essential for long study hours.",
      weeklyGrid: [
        { completed: true, value: 2.5, isToday: false },
        { completed: true, value: 2.5, isToday: false },
        { completed: true, value: 3, isToday: false },
        { completed: true, value: 2.5, isToday: true },
        { completed: false, value: null, isToday: false },
        { completed: false, value: null, isToday: false },
        { completed: false, value: null, isToday: false },
      ],
    },
    upcoming: [
      {
        name: "Morning Meditation",
        emoji: "🧘‍♀️",
        description: "10 minutes daily meditation",
        unlockDate: "2024-12-01",
      },
      {
        name: "Reading Before Bed",
        emoji: "📚",
        description: "Read 20 pages every night",
        unlockDate: "2024-12-15",
      },
    ],
    bodyTracking: [
      { name: "Weight", start: "65kg", current: "63kg" },
      { name: "Body Fat %", start: "28%", current: "26%" },
      { name: "Resting HR", start: "75 bpm", current: "68 bpm" },
    ],
  },

  // RESOURCES (empty for now)
  resources: {},
};

export default INITIAL_DATA;
