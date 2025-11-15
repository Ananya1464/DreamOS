import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Clock, TrendingUp, X } from 'lucide-react';
import { Card, Button, Badge } from './UI';
import { startStudySession, endStudySession } from '../utils/progressTracker';
import { awardStudySessionXP, updateStreak } from '../utils/xpSystem';
import { checkAchievements } from '../utils/achievements';
import FireworksEffect, { ConfettiEffect } from './FireworksEffect';
import { LevelUpAnimation, XPGainToast } from './XPProgressBar';
import { AchievementUnlockedPopup } from './AchievementsDashboard';

// ═══════════════════════════════════════════════════════════════
// STUDY SESSION MODAL - REAL-TIME SESSION TRACKING ⏱️
// ═══════════════════════════════════════════════════════════════

export default function StudySessionModal({ block, onClose, onComplete }) {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mastery, setMastery] = useState(50);
  const [showMasteryInput, setShowMasteryInput] = useState(false);
  
  // Gamification states
  const [showFireworks, setShowFireworks] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [showXPToast, setShowXPToast] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [xpReason, setXpReason] = useState('');
  const [newAchievements, setNewAchievements] = useState([]);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  // Timer effect
  useEffect(() => {
    if (!sessionActive || !sessionData) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - sessionData.startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, sessionData]);

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Start session
  const handleStart = () => {
    const result = startStudySession(block.subjectId, block.topicId);
    if (result.success) {
      setSessionData(result.session);
      setSessionActive(true);
    }
  };

  // End session
  const handleEnd = () => {
    setShowMasteryInput(true);
  };

  // Complete session with mastery input
  const handleComplete = () => {
    const result = endStudySession(mastery);
    if (result.success) {
      setSessionActive(false);
      setShowMasteryInput(false);
      
      const durationMinutes = elapsedTime / 60;
      
      // Award XP based on session duration
      const xpResult = awardStudySessionXP(durationMinutes);
      setXpGained(xpResult.xpGained);
      setXpReason(`${Math.floor(durationMinutes)} min study session!`);
      setShowXPToast(true);
      
      // Update streak
      updateStreak();
      
      // Check for achievements
      const achievements = [
        ...checkAchievements('first_session'),
        ...checkAchievements('early_morning'),
        ...checkAchievements('late_night'),
        ...checkAchievements('marathon', { hours: durationMinutes / 60 })
      ];
      
      if (achievements.length > 0) {
        setNewAchievements(achievements);
        setCurrentAchievement(achievements[0]);
        setShowFireworks(true);
      } else {
        setShowConfetti(true);
      }
      
      // Check for level up
      if (xpResult.leveledUp) {
        setNewLevel(xpResult.newLevel);
        setShowLevelUp(true);
      }
      
      // Call parent callback
      if (onComplete) {
        onComplete({
          duration: durationMinutes,
          mastery: mastery,
          topicProgress: result.topicProgress,
          xpGained: xpResult.xpGained,
          leveledUp: xpResult.leveledUp,
          newAchievements: achievements
        });
      }
      
      // Close modal after celebrations
      setTimeout(() => {
        onClose();
      }, xpResult.leveledUp ? 5000 : 3000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!sessionActive ? onClose : undefined}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {sessionActive ? (
                    <Clock className="w-6 h-6 animate-pulse" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">Study Session</h3>
                  <p className="text-sm opacity-90">{block.activity}</p>
                </div>
              </div>
              {!sessionActive && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!sessionActive && !showMasteryInput && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📚</div>
                  <h4 className="text-2xl font-bold text-[#2D3436] mb-2">Ready to study?</h4>
                  <p className="text-[#7A8A7D] mb-6">
                    Focus for {block.duration} minutes
                  </p>
                  
                  <div className="flex items-center gap-3 justify-center text-sm text-[#7A8A7D] mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{block.time}</span>
                    </div>
                    <div>•</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{block.duration}m</Badge>
                    </div>
                  </div>

                  <Button
                    onClick={handleStart}
                    className="w-full py-4 text-lg font-bold bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white rounded-xl hover:shadow-xl transition-all"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Session
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-[#FFF9E6] border-2 border-[#FFE66D]">
                  <p className="text-sm text-[#8B7355]">
                    💡 <strong>Tip:</strong> Find a quiet place, turn off distractions, and give it your full focus!
                  </p>
                </div>
              </motion.div>
            )}

            {sessionActive && !showMasteryInput && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Timer Display */}
                <div className="text-center py-8">
                  <div className="text-7xl font-bold text-[#B5A3E5] mb-4 font-mono tracking-wider">
                    {formatTime(elapsedTime)}
                  </div>
                  <p className="text-[#7A8A7D]">
                    Keep going! You're doing great! 💪
                  </p>
                </div>

                {/* Progress Ring */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#F8F6ED"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#B5A3E5"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${(elapsedTime / (block.duration * 60)) * 352} 352`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">⏱️</span>
                    </div>
                  </div>
                </div>

                {/* End Session Button */}
                <Button
                  onClick={handleEnd}
                  className="w-full py-4 text-lg font-bold bg-gradient-to-r from-[#FF9B9B] to-[#FFB4A4] text-white rounded-xl hover:shadow-xl transition-all"
                >
                  <Square className="w-5 h-5 mr-2" />
                  End Session
                </Button>

                <div className="p-4 rounded-xl bg-[#E6F3FF] border-2 border-[#90C8E8]">
                  <p className="text-sm text-[#5B7A8F] text-center">
                    🔔 You'll get a notification when time is up!
                  </p>
                </div>
              </motion.div>
            )}

            {showMasteryInput && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">🎉</div>
                  <h4 className="text-2xl font-bold text-[#2D3436] mb-2">Session Complete!</h4>
                  <p className="text-[#7A8A7D] mb-6">
                    You studied for {formatTime(elapsedTime)}
                  </p>
                </div>

                {/* Mastery Slider */}
                <div>
                  <label className="block text-center mb-4">
                    <span className="text-lg font-bold text-[#2D3436] block mb-2">
                      How much did you master?
                    </span>
                    <span className="text-[#7A8A7D] text-sm">
                      Be honest! This helps track your real progress
                    </span>
                  </label>

                  <div className="relative py-8">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={mastery}
                      onChange={(e) => setMastery(Number(e.target.value))}
                      className="w-full h-3 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #FF9B9B 0%, #FFE66D 25%, #90C8E8 50%, #80D6D6 75%, #7DD3C0 100%)`,
                      }}
                    />
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-[#B5A3E5] text-white px-4 py-2 rounded-xl font-bold text-2xl shadow-lg">
                        {mastery}%
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-[#7A8A7D] mt-2">
                    <span>0% - Just introduced</span>
                    <span>50% - Understood</span>
                    <span>100% - Can teach it!</span>
                  </div>
                </div>

                {/* Mastery Feedback */}
                <div className={`p-4 rounded-xl border-2 ${
                  mastery >= 75 ? 'bg-[#D5F4E6] border-[#7DD3C0]' :
                  mastery >= 50 ? 'bg-[#E6F3FF] border-[#90C8E8]' :
                  mastery >= 25 ? 'bg-[#FFF9E6] border-[#FFE66D]' :
                  'bg-[#FFE5E8] border-[#FF9B9B]'
                }`}>
                  <p className="text-sm font-semibold text-center">
                    {mastery >= 75 ? '🌟 Amazing! You crushed it!' :
                     mastery >= 50 ? '👍 Good progress!' :
                     mastery >= 25 ? '📚 Keep practicing!' :
                     "💪 It's okay! More practice will help!"}
                  </p>
                </div>

                <Button
                  onClick={handleComplete}
                  className="w-full py-4 text-lg font-bold bg-gradient-to-r from-[#7DD3C0] to-[#80D6D6] text-white rounded-xl hover:shadow-xl transition-all"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Save Progress
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {/* Celebration Effects */}
        <AnimatePresence>
          {showFireworks && (
            <FireworksEffect 
              onComplete={() => setShowFireworks(false)} 
              duration={3000}
            />
          )}
          
          {showConfetti && (
            <ConfettiEffect onComplete={() => setShowConfetti(false)} />
          )}
          
          {showLevelUp && newLevel && (
            <LevelUpAnimation 
              level={newLevel} 
              onClose={() => setShowLevelUp(false)} 
            />
          )}
          
          {currentAchievement && (
            <AchievementUnlockedPopup
              achievement={currentAchievement}
              onClose={() => {
                // Show next achievement if any
                const nextIndex = newAchievements.indexOf(currentAchievement) + 1;
                if (nextIndex < newAchievements.length) {
                  setCurrentAchievement(newAchievements[nextIndex]);
                } else {
                  setCurrentAchievement(null);
                }
              }}
            />
          )}
        </AnimatePresence>
        
        {/* XP Gain Toast */}
        <XPGainToast
          amount={xpGained}
          reason={xpReason}
          show={showXPToast}
          onClose={() => setShowXPToast(false)}
        />
      </div>
    </AnimatePresence>
  );
}
