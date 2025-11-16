# 🧠 DreamOS - Your AI-Powered Learning Companion

> **"Chase your dreams with intelligent study management"**

A revolutionary personal learning management system that uses **AI**, **YouTube integration**, and **computational intelligence** to transform how you learn.

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react)](https://reactjs.org/)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4?logo=google)](https://ai.google.dev/)
[![Wolfram Alpha](https://img.shields.io/badge/Enhanced%20by-Wolfram%20Alpha-DD1100?logo=wolframalpha)](https://www.wolframalpha.com/)

---

## 🌟 What Makes DreamOS Special?

DreamOS isn't just another study app - it's your **intelligent learning partner** that:

✅ **Understands YOUR actual interests** (not what you "should" study)  
✅ **Connects knowledge visually** with an interactive brain map  
✅ **Learns from your YouTube habits** to personalize your learning  
✅ **Uses AI** (Gemini + Wolfram Alpha) for smart recommendations  
✅ **Tracks progress honestly** - celebrates wins, confronts procrastination  

---

## 🎯 Core Features

### 1. **🧠 Birdseye View - Visual Knowledge Graph**
- Interactive force-directed graph showing YOUR knowledge network
- **Real-time YouTube integration** - imports from Watch Later & custom playlists
- **Subject filtering** - click to view only specific topics
- **Wolfram Alpha enhancement** - validates and enriches topics you add manually
- **Honest visualization** - shows entertainment/gaming if that's what you watch!

### 2. **✨ Luna AI - Conversational Study Assistant**
- 5 specialized modes: Morning Planner, Progress Tracker, Study Buddy, Problem Solver, Evening Reflection
- Natural language scheduling: "study DSA tomorrow at 3pm"
- Contextual quick actions based on your current needs
- Powered by Google Gemini AI

### 3. **📺 SavedContent - Content Graveyard**
- Real-time sync with YouTube (Watch Later + Playlists)
- **Shame stats** - brutally honest about unwatched content
- Clickable thumbnails linking directly to videos
- Playlist tags showing content source
- Watch/delete tracking with localStorage persistence

### 4. **🎯 Smart Progress Tracking**
- Subject-wise mastery levels with visual progress bars
- XP system with achievements and milestones
- Study streaks with motivational messages
- Recent activity timeline

### 5. **📅 Schedule Management**
- Weekly calendar view with drag-and-drop
- Color-coded subjects
- Assignment deadlines tracking
- Integration with Luna AI for conversational scheduling

### 6. **🏆 Achievements System**
- Unlock badges for study milestones
- XP progression with level-ups
- Gamified motivation system

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Google Cloud account (for YouTube integration)

### **Quick Start**

```bash
# Clone the repository
git clone https://github.com/yourusername/brutal-learning-os.git
cd brutal-learning-os

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys to .env

# Start development server
npm run dev
```

### **Environment Variables**

Create a `.env` file with:

```env
# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Wolfram Alpha
VITE_WOLFRAM_APP_ID=your_wolfram_app_id

# YouTube Data API
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_GOOGLE_CLIENT_ID=your_oauth_client_id

# Firebase (optional)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### **Getting API Keys**

1. **Gemini AI**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. **Wolfram Alpha**: [products.wolframalpha.com/api](https://products.wolframalpha.com/api/)
3. **YouTube API**: 
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable YouTube Data API v3
   - Create OAuth 2.0 credentials
   - Add authorized URIs: `http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`
   - **IMPORTANT**: Add test users in OAuth consent screen (Audience section)

---

## 🎮 How to Use

### **First Launch**
1. Choose "Use Sample Data" to explore with demo content
2. Or start fresh and add your own subjects

### **YouTube Integration**
1. Navigate to **Birdseye View**
2. Click **"Import from YouTube"**
3. Sign in with your Google account (must be added as test user!)
4. Your Watch Later & custom playlists will be automatically analyzed
5. Gemini AI extracts topics and builds your knowledge graph
6. Videos appear in **SavedContent** page with thumbnails

### **Manual Topic Addition**
1. Click **"Add Topic Manually"** button below the graph
2. Enter subject name (e.g., "Machine Learning")
3. Wolfram Alpha automatically validates and enhances it
4. Topic appears in your Birdseye graph

### **Subject Filtering**
1. In Birdseye, use the filter bar below controls
2. Click any subject to view ONLY its topics
3. Click multiple subjects to compare
4. Click "All Subjects" to reset

### **Luna AI Conversations**
1. Navigate to **Luna AI** page
2. Select a mode (Morning Planner, Study Buddy, etc.)
3. Type naturally: "I want to study DSA tomorrow at 3pm"
4. Luna schedules it automatically and provides study tips

---

## 📊 Project Structure

```
brutal-learning-os/
├── src/
│   ├── components/          # React components
│   │   ├── BirdseyeView.jsx    # Knowledge graph
│   │   ├── Agent.jsx           # Luna AI chat
│   │   ├── SavedContent.jsx    # Content graveyard
│   │   ├── Dashboard.jsx       # Overview page
│   │   ├── Schedule.jsx        # Calendar
│   │   ├── ProgressHub.jsx     # Progress tracking
│   │   └── UI.jsx              # Shared components
│   ├── services/            # API integrations
│   │   ├── youtubeService.js   # YouTube API
│   │   ├── savedContentService.js
│   │   └── aiService.js
│   ├── utils/               # Helper functions
│   │   ├── ai.js               # Gemini integration
│   │   ├── wolframService.js   # Wolfram Alpha
│   │   ├── storage.js          # localStorage utils
│   │   └── notifications.js
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useBackend.js
│   └── data/                # Static data
│       └── initialData.js
├── public/                  # Static assets
├── .env                     # Environment variables
├── vite.config.js          # Vite configuration
└── package.json
```

---

## 🔑 Key Innovations

### **1. Honest AI Analysis**
Unlike other apps that filter for "educational" content, DreamOS shows your **ACTUAL** viewing patterns. If you watch gaming videos, it'll create a "Gaming" subject - because that's honest data about your interests!

### **2. Multi-Source YouTube Import**
Pulls from:
- ⏰ Watch Later playlist
- 📚 All custom playlists
- ❌ Excludes liked videos (for privacy)

### **3. Wolfram-Enhanced Manual Addition**
When you add a topic manually, Wolfram Alpha automatically validates it and suggests related concepts, ensuring your knowledge graph is scientifically accurate.

### **4. Subject-Level Filtering**
Click any subject in Birdseye to **hide everything else**. Perfect for focused study sessions or comparing specific areas. Multi-select supported!

### **5. Real-Time Sync**
SavedContent shows a live "Connected to YouTube" badge with real-time video count. Hit refresh to see new additions instantly. Mark videos as watched or delete them with one click.

### **6. Sidebar Toggle**
Collapsible sidebar in Birdseye gives you full-screen graph visualization when you need to focus on connections.

---

## 🎨 Tech Stack

### **Frontend**
- React 18 with Hooks
- Framer Motion for animations
- Tailwind CSS for styling
- Vite for build tooling

### **AI/ML**
- Google Gemini AI (topic extraction & chat)
- Wolfram Alpha API (knowledge validation)
- YouTube Data API v3 (video import)

### **Storage**
- localStorage (offline-first)
- Firebase (optional cloud sync)
- PWA support (installable app)

---

## 🐛 Known Limitations

- YouTube API has daily quota limits (10,000 requests/day)
- OAuth in testing mode requires pre-approved test users
- Gemini AI may occasionally misclassify content
- Force-directed graph can be slow with 100+ topics

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Spaced repetition algorithm
- [ ] Collaborative study rooms
- [ ] Integration with Anki flashcards
- [ ] AI-generated study plans
- [ ] Export knowledge graph as PDF

---

## 📝 License

MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for conversational AI
- **Wolfram Alpha** for computational intelligence
- **YouTube Data API** for video metadata
- **Framer Motion** for beautiful animations
- **Tailwind CSS** for rapid UI development

---

**Made with 💜 and lots of ☕**
