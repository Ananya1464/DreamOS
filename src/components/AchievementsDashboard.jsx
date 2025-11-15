import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, Star, Trophy, Target } from 'lucide-react';
import { 
  ACHIEVEMENTS, 
  getUnlockedAchievements, 
  getAchievementProgress,
  getAchievementsByRarity,
  getRarityColor,
  getRarityName
} from '../utils/achievements';

/**
 * Achievement Badge Component - Show individual achievement
 */
export function AchievementBadge({ achievement, unlocked, onClick }) {
  const rarityColor = getRarityColor(achievement.rarity);
  
  return (
    <motion.div
      whileHover={{ scale: unlocked ? 1.05 : 1 }}
      whileTap={{ scale: unlocked ? 0.95 : 1 }}
      onClick={onClick}
      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition ${
        unlocked
          ? 'bg-white border-[#B5A3E5] shadow-md'
          : 'bg-gray-100 border-gray-300 opacity-60'
      }`}
    >
      {/* Rarity glow */}
      {unlocked && (
        <div 
          className="absolute inset-0 rounded-2xl opacity-20 blur-xl"
          style={{ backgroundColor: rarityColor }}
        />
      )}
      
      <div className="relative z-10">
        {/* Icon */}
        <div className={`text-4xl mb-2 ${unlocked ? '' : 'grayscale'}`}>
          {unlocked ? achievement.icon : '🔒'}
        </div>
        
        {/* Title */}
        <h4 className={`font-bold mb-1 ${unlocked ? 'text-[#2D3436]' : 'text-gray-500'}`}>
          {achievement.title}
        </h4>
        
        {/* Description */}
        <p className={`text-xs mb-2 ${unlocked ? 'text-[#7A8A7D]' : 'text-gray-400'}`}>
          {achievement.description}
        </p>
        
        {/* XP Reward */}
        <div className={`flex items-center gap-1 text-xs font-semibold ${
          unlocked ? 'text-[#B5A3E5]' : 'text-gray-400'
        }`}>
          <Star className="w-3 h-3" />
          {achievement.xpReward} XP
        </div>
        
        {/* Rarity badge */}
        <div 
          className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: rarityColor }}
        >
          {getRarityName(achievement.rarity)}
        </div>
        
        {/* Unlocked timestamp */}
        {unlocked && achievement.unlockedAt && (
          <div className="mt-2 text-xs text-[#7A8A7D]">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Achievement unlock popup - Shows when achievement is unlocked
 */
export function AchievementUnlockedPopup({ achievement, onClose }) {
  const rarityColor = getRarityColor(achievement.rarity);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      className="fixed bottom-8 right-8 z-50 max-w-sm"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border-4 p-6 relative overflow-hidden"
        style={{ borderColor: rarityColor }}
      >
        {/* Background glow */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundColor: rarityColor }}
        />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <h3 className="font-bold text-lg text-[#2D3436]">Achievement Unlocked!</h3>
              <p className="text-xs text-[#7A8A7D]">{getRarityName(achievement.rarity)}</p>
            </div>
          </div>
          
          {/* Achievement */}
          <div className="flex items-start gap-4 mb-4">
            <div className="text-5xl">{achievement.icon}</div>
            <div>
              <h4 className="font-bold text-[#2D3436] mb-1">{achievement.title}</h4>
              <p className="text-sm text-[#7A8A7D] mb-2">{achievement.description}</p>
              <div className="flex items-center gap-1 text-sm font-semibold text-[#B5A3E5]">
                <Star className="w-4 h-4" />
                +{achievement.xpReward} XP
              </div>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-2 bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] rounded-xl text-white font-bold hover:scale-105 transition"
          >
            Awesome! ✨
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Achievements Dashboard - Full view of all achievements
 */
export default function AchievementsDashboard() {
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  
  const unlockedAchievements = getUnlockedAchievements();
  const progress = getAchievementProgress();
  
  const allAchievements = Object.values(ACHIEVEMENTS);
  const displayedAchievements = selectedRarity === 'all' 
    ? allAchievements
    : getAchievementsByRarity(selectedRarity);
  
  const rarities = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-['Playfair_Display'] text-[#2D3436]">Achievements</h1>
            <p className="text-[#7A8A7D]">Unlock badges as you learn! 🏆</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-[#FFE5E8]">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-[#2D3436]">Progress</span>
            <span className="text-2xl font-bold text-[#B5A3E5]">
              {progress.unlocked}/{progress.total}
            </span>
          </div>
          
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#B5A3E5] to-[#FFB4D1] rounded-full"
            />
          </div>
          
          <div className="mt-2 text-sm text-[#7A8A7D] text-center">
            {progress.percentage}% Complete • {progress.remaining} Remaining
          </div>
        </div>
      </div>
      
      {/* Rarity filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {rarities.map(rarity => (
          <button
            key={rarity}
            onClick={() => setSelectedRarity(rarity)}
            className={`px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
              selectedRarity === rarity
                ? 'bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white shadow-md'
                : 'bg-white text-[#7A8A7D] hover:bg-[#FFF5F5]'
            }`}
            style={
              selectedRarity === rarity && rarity !== 'all'
                ? { background: getRarityColor(rarity), color: 'white' }
                : {}
            }
          >
            {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Achievement grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedAchievements.map(achievement => {
          const unlocked = unlockedAchievements.find(a => a.id === achievement.id);
          return (
            <AchievementBadge
              key={achievement.id}
              achievement={unlocked || achievement}
              unlocked={!!unlocked}
              onClick={() => setSelectedAchievement(unlocked || achievement)}
            />
          );
        })}
      </div>
      
      {/* Achievement detail modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-7xl mb-4">{selectedAchievement.icon}</div>
                <h2 className="text-2xl font-['Playfair_Display'] text-[#2D3436] mb-2">
                  {selectedAchievement.title}
                </h2>
                <p className="text-[#7A8A7D] mb-4">{selectedAchievement.description}</p>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-[#B5A3E5]" />
                  <span className="text-xl font-bold text-[#B5A3E5]">
                    {selectedAchievement.xpReward} XP
                  </span>
                </div>
                
                <div 
                  className="inline-block px-4 py-2 rounded-full text-white font-bold mb-4"
                  style={{ backgroundColor: getRarityColor(selectedAchievement.rarity) }}
                >
                  {getRarityName(selectedAchievement.rarity)}
                </div>
                
                {selectedAchievement.unlockedAt && (
                  <p className="text-sm text-[#7A8A7D] mb-4">
                    Unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
                
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="w-full py-3 bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] rounded-2xl text-white font-bold hover:scale-105 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
