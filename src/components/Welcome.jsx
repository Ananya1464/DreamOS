import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Target, Zap } from 'lucide-react';
import { initializeSampleData } from '../utils/initializeApp';

// ═══════════════════════════════════════════════════════════════
// WELCOME SCREEN - First-time user setup
// ═══════════════════════════════════════════════════════════════

export default function Welcome({ onComplete }) {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');

  const handleStart = () => {
    // Start fresh (0% progress)
    onComplete({ useSampleData: false, userName });
  };

  const handleStartWithSample = () => {
    // Load sample subjects for testing
    initializeSampleData();
    onComplete({ useSampleData: true, userName });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCF6] via-[#F8F6ED] to-[#E8E4D8] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#C5A3FF] to-[#E5D4FF] rounded-3xl mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-[#2D3436] mb-2">
            Welcome to DreamOS
          </h1>
          <p className="text-xl text-[#7A8A7D]">
            Your intelligent study companion
          </p>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-[#E5E5E5]">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-2xl font-bold text-[#2D3436] mb-4">
                Let's get you started! ✨
              </h2>
              
              <p className="text-[#7A8A7D] mb-6">
                DreamOS helps you track your study progress, stay organized, and ace your exams with AI-powered insights.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-[#F8F6ED] rounded-2xl">
                  <BookOpen className="w-8 h-8 text-[#C5A3FF] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#2D3436]">Track Progress</p>
                </div>
                <div className="text-center p-4 bg-[#F8F6ED] rounded-2xl">
                  <Target className="w-8 h-8 text-[#80D6D6] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#2D3436]">Set Goals</p>
                </div>
                <div className="text-center p-4 bg-[#F8F6ED] rounded-2xl">
                  <Zap className="w-8 h-8 text-[#FFB5C0] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#2D3436]">AI Insights</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2D3436] mb-2">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A3FF] bg-[#FDFCF6]"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleStart}
                  disabled={!userName.trim()}
                  className="w-full py-4 bg-gradient-to-r from-[#C5A3FF] to-[#E5D4FF] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Start Fresh (0% Progress)
                </button>
                
                <button
                  onClick={handleStartWithSample}
                  disabled={!userName.trim()}
                  className="w-full py-4 bg-white text-[#C5A3FF] border-2 border-[#C5A3FF] rounded-xl font-medium hover:bg-[#F8F6ED] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📚 Load Sample Subjects (For Testing)
                </button>
              </div>

              <p className="text-xs text-[#7A8A7D] text-center mt-4">
                You can add your subjects and topics later
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#7A8A7D] mt-6">
          Made with 💜 for students who dream big
        </p>
      </motion.div>
    </div>
  );
}
