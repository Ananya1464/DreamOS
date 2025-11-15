import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Brain, TrendingUp } from 'lucide-react';
import AchievementsDashboard from './AchievementsDashboard';
import MemoryDashboard from './MemoryDashboard';
import ShameStats from './ShameStats';

export default function ProgressHub() {
  const [activeTab, setActiveTab] = useState('achievements');

  return (
    <div className="min-h-screen">
      {/* Floating Tab Navigation - Top Right */}
      <div className="fixed top-6 right-6 z-40 flex gap-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-2 border-2 border-[#FFE5E8]">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'achievements'
              ? 'bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white shadow-md'
              : 'text-[#7A8A7D] hover:bg-[#FFE5E8]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span className="hidden sm:inline">Achievements</span>
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'memory'
              ? 'bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white shadow-md'
              : 'text-[#7A8A7D] hover:bg-[#FFE5E8]'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span className="hidden sm:inline">Memory</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'stats'
              ? 'bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white shadow-md'
              : 'text-[#7A8A7D] hover:bg-[#FFE5E8]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">Stats</span>
        </button>
      </div>

      {/* Tab Content - Full Page */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'achievements' && <AchievementsDashboard />}
        {activeTab === 'memory' && <MemoryDashboard />}
        {activeTab === 'stats' && <ShameStats />}
      </motion.div>
    </div>
  );
}
