import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Award } from 'lucide-react';
import { getXPStats, getRankTitle } from '../utils/xpSystem';

/**
 * XP Progress Bar - Shows in header/dashboard
 */
export default function XPProgressBar({ compact = false }) {
  const stats = getXPStats();
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-[#2D3436]">
            Lv.{stats.level}
          </span>
        </div>
        
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-[100px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.progressPercent}%` }}
            className="h-full bg-gradient-to-r from-[#B5A3E5] to-[#FFB4D1]"
          />
        </div>
        
        <span className="text-xs text-[#7A8A7D]">
          {stats.progressPercent}%
        </span>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-[#FFE5E8]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl font-bold text-[#2D3436]">
              Level {stats.level}
            </span>
            <span className="text-xl">{stats.rankTitle.split(' ')[0]}</span>
          </div>
          <p className="text-sm text-[#7A8A7D]">
            {stats.rankTitle.split(' ')[1] || stats.rankTitle}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-[#B5A3E5]">
            {stats.totalXP.toLocaleString()}
          </div>
          <p className="text-xs text-[#7A8A7D]">Total XP</p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-[#7A8A7D] mb-2">
          <span>{stats.xpIntoLevel} XP</span>
          <span>{stats.xpNeededForLevel} XP</span>
        </div>
        
        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#B5A3E5] via-[#D4C5F9] to-[#FFB4D1] rounded-full shadow-inner"
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-md">
              {stats.progressPercent}%
            </span>
          </div>
        </div>
      </div>
      
      {/* XP to next level */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-[#7A8A7D]">
          <TrendingUp className="w-4 h-4" />
          <span>{stats.xpNeededForLevel - stats.xpIntoLevel} XP to level {stats.level + 1}</span>
        </div>
        
        {stats.streaks.current > 0 && (
          <div className="flex items-center gap-1 text-orange-500 font-semibold">
            🔥 {stats.streaks.current} day streak
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Level Up Animation - Shows when user levels up
 */
export function LevelUpAnimation({ level, onClose }) {
  const rankTitle = getRankTitle(level);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="bg-gradient-to-br from-[#B5A3E5] to-[#FFB4D1] rounded-3xl p-12 text-center shadow-2xl max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 0.5, 
            repeat: Infinity, 
            repeatDelay: 1 
          }}
          className="text-8xl mb-4"
        >
          🎉
        </motion.div>
        
        <h2 className="text-5xl font-['Playfair_Display'] text-white mb-2 font-bold">
          LEVEL UP!
        </h2>
        
        <div className="text-7xl font-bold text-white mb-4">
          {level}
        </div>
        
        <p className="text-2xl text-white mb-8">
          {rankTitle}
        </p>
        
        <button
          onClick={onClose}
          className="w-full py-4 bg-white text-[#B5A3E5] rounded-2xl font-bold text-lg hover:scale-105 transition shadow-lg"
        >
          Continue Your Journey! ✨
        </button>
      </motion.div>
    </motion.div>
  );
}

/**
 * XP Gain Toast - Small notification when XP is gained
 */
export function XPGainToast({ amount, reason, show, onClose }) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  
  if (!show) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      className="fixed top-20 right-8 z-50 bg-white rounded-2xl shadow-2xl border-2 border-[#B5A3E5] p-4 max-w-xs"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B5A3E5] to-[#FFB4D1] flex items-center justify-center">
          <Star className="w-6 h-6 text-white" />
        </div>
        
        <div>
          <div className="font-bold text-lg text-[#B5A3E5]">
            +{amount} XP
          </div>
          {reason && (
            <p className="text-sm text-[#7A8A7D]">{reason}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
