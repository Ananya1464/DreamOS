import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap } from 'lucide-react';
import Exams from './Exams';
import SubjectsManage from './SubjectsManage';

export default function Academics() {
  const [activeTab, setActiveTab] = useState('exams');

  return (
    <div className="min-h-screen">
      {/* Floating Tab Navigation - Top Right */}
      <div className="fixed top-6 right-6 z-40 flex gap-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-2 border-2 border-[#FFE5E8]">
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'exams'
              ? 'bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white shadow-md'
              : 'text-[#7A8A7D] hover:bg-[#FFE5E8]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Exams</span>
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'subjects'
              ? 'bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white shadow-md'
              : 'text-[#7A8A7D] hover:bg-[#FFE5E8]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span className="hidden sm:inline">Subjects</span>
        </button>
      </div>

      {/* Tab Content - Full Page */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'exams' ? <Exams /> : <SubjectsManage />}
      </motion.div>
    </div>
  );
}
