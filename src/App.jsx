import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Instagram, 
  FileText, 
  Target, 
  Sparkles,
  GraduationCap,
  Settings as SettingsIcon,
  LogIn,
  LogOut,
  User,
  Trophy,
  TrendingDown,
  Brain,
  Calculator
} from 'lucide-react';
import { initializeNotifications } from './utils/notifications';
import { initializeAppData, needsInitialization } from './utils/initializeApp';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Import all components
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import Agent from './components/Agent';
import Academics from './components/Academics';
import ProgressHub from './components/ProgressHub';
import Reflections from './components/Reflections';
import BirdseyeView from './components/BirdseyeView';
import Welcome from './components/Welcome';
import InstallPrompt from './components/InstallPrompt';
import SavedContent from './components/SavedContent';
import Settings from './components/Settings';
import AuthModal from './components/AuthModal';
import { SyncStatusCompact } from './components/SyncStatus';
import XPProgressBar from './components/XPProgressBar';

// ═══════════════════════════════════════════════════════════════
// NAVIGATION DATA
// ═══════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'academics', label: 'Academics', icon: GraduationCap },
  { id: 'agent', label: 'Luna AI', icon: Sparkles },
  { id: 'birdseye', label: 'Birdseye', icon: Brain },
  { id: 'progress', label: 'Progress', icon: Trophy },
  { id: 'reflections', label: 'Reflections', icon: FileText },
  { id: 'content', label: 'Saved', icon: Instagram },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

// ═══════════════════════════════════════════════════════════════
// MAIN APP COMPONENT - NOW WITH REAL-TIME NOTIFICATIONS! 🔔
// ═══════════════════════════════════════════════════════════════
function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(needsInitialization());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout } = useAuth();

  // ⚠️ HOOKS MUST BE AT TOP - BEFORE ANY CONDITIONAL RETURNS!
  // Initialize notification system on app mount
  useEffect(() => {
    // Request notification permission and set up system
    initializeNotifications();
    
    // Log to console for debugging
    console.log('🔔 Notification system initialized!');
  }, []);

  // Handle welcome completion
  const handleWelcomeComplete = ({ useSampleData, userName }) => {
    if (!useSampleData) {
      initializeAppData();
    }
    // Sample data is already loaded by Welcome component if chosen
    setShowWelcome(false);
  };

  // Show welcome screen for first-time users (AFTER hooks!)
  if (showWelcome) {
    return <Welcome onComplete={handleWelcomeComplete} />;
  }

  // Render the current page component
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'schedule':
        return <Schedule />;
      case 'academics':
        return <Academics />;
      case 'agent':
        return <Agent />;
      case 'birdseye':
        return <BirdseyeView />;
      case 'progress':
        return <ProgressHub />;
      case 'reflections':
        return <Reflections />;
      case 'content':
        return <SavedContent />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF6]">
      {/* ═══════════════════════════════════════════════════════════════
          NAVIGATION SIDEBAR
          ═══════════════════════════════════════════════════════════════ */}
      <motion.nav
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-white to-[#FFF5F5] shadow-xl z-50 border-r-2 border-[#FFE5E8] flex flex-col overflow-hidden"
      >
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#B5A3E5] scrollbar-track-transparent">
          {/* Logo / Header with personality */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B5A3E5] to-[#FFB4D1] flex items-center justify-center shadow-md float">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2D3436]" style={{fontFamily: 'Playfair Display, serif'}}>DreamOS</h1>
                <p className="text-xs text-[#B5A3E5]" style={{fontFamily: 'Caveat, cursive', fontSize: '14px'}}>✨ chase your dreams ✨</p>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-[#B5A3E5] via-[#FFB4D1] to-[#90C8E8] rounded-full shadow-sm"></div>
          {/* Decorative stars */}
          <div className="flex justify-center gap-2 mt-2 text-xs opacity-40">
            <span className="sparkle-effect">⭐</span>
            <span className="sparkle-effect" style={{animationDelay: '0.3s'}}>✨</span>
            <span className="sparkle-effect" style={{animationDelay: '0.6s'}}>💫</span>
            <span className="sparkle-effect" style={{animationDelay: '0.9s'}}>⭐</span>
            <span className="sparkle-effect" style={{animationDelay: '1.2s'}}>✨</span>
          </div>
        </div>

        {/* User Profile / Auth Section */}
        <div className="mb-6 p-4 bg-gradient-to-br from-[#E6E3F5] to-[#FFF5F5] rounded-2xl border-2 border-[#FFE5E8]">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B5A3E5] to-[#FFB4D1] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#2D3436] truncate">
                    {user.displayName || 'Anonymous'}
                  </p>
                  <p className="text-xs text-[#7A8A7D] truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <SyncStatusCompact syncing={false} offline={!navigator.onLine} />
              <XPProgressBar compact={true} />
              <button
                onClick={logout}
                className="w-full py-2 bg-white rounded-lg text-sm font-semibold text-[#7A8A7D] hover:bg-[#FDFCF6] hover:text-[#B5A3E5] transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3 bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] rounded-xl text-white font-bold hover:scale-105 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white shadow-md'
                    : 'bg-transparent text-[#7A8A7D] hover:bg-[#FFF5F5] hover:text-[#B5A3E5]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9]"
                    style={{ borderRadius: 12 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'sparkle-effect' : ''}`} />
                <span className="relative z-10">{item.label}</span>
                {isActive && <span className="ml-auto text-xl relative z-10">✨</span>}
              </motion.button>
            );
          })}
        </div>
        </div>
      </motion.nav>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
          ═══════════════════════════════════════════════════════════════ */}
      <main className="ml-72">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
      
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

// Wrap with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
