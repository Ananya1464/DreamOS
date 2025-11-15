import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Flame, Calendar, Brain, TrendingUp } from 'lucide-react';
import { Card, Badge, ProgressBar } from './UI';
import INITIAL_DATA from '../data/initialData';
import { useSubjects, useProgress, useUser } from '../hooks/useBackend';
import XPProgressBar from './XPProgressBar';

// ═══════════════════════════════════════════════════════════════
// DASHBOARD COMPONENT 🌸 - NOW WITH REAL-TIME DATA! 📊
// ═══════════════════════════════════════════════════════════════
export default function Dashboard() {
  // Load REAL data with auto-refresh (every 5 seconds)
  const { subjects: liveSubjects, loading: subjectsLoading } = useSubjects(5000);
  const { progress: liveProgress, loading: progressLoading } = useProgress(5000);
  const { user: liveUser, loading: userLoading } = useUser(5000);
  
  // Use live data if available, fallback to initial data
  const subjects = liveSubjects || INITIAL_DATA.subjects;
  const user = liveUser || INITIAL_DATA.user;
  const { schedule, gre } = INITIAL_DATA;

  // Calculate days until nearest exam
  const getDaysUntil = (dateString) => {
    const target = new Date(dateString);
    const today = new Date();
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  };

  // Get nearest exam
  const nearestExam = Object.entries(subjects)
    .map(([key, data]) => ({ key, ...data, daysLeft: getDaysUntil(data.examDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)[0];

  // Calculate overall progress from REAL data
  const calculateProgress = () => {
    // If we have live progress data, use it!
    if (liveProgress && liveProgress.averageProgress !== undefined) {
      return Math.round(liveProgress.averageProgress);
    }
    
    // Fallback to calculating from subjects
    let totalTopics = 0;
    let completedRevisions = 0;

    Object.values(subjects).forEach(subject => {
      // Check if topics array exists
      if (!subject.topics || !Array.isArray(subject.topics)) return;
      
      subject.topics.forEach(topic => {
        totalTopics += 3; // R1, R2, R3
        // Check if revisions array exists
        const revisions = Array.isArray(topic.revisions) ? topic.revisions : [];
        revisions.forEach(revision => {
          if (revision.completed) completedRevisions++;
        });
      });
    });

    return Math.round((completedRevisions / totalTopics) * 100);
  };

  // Get critical topics (not fully revised)
  const getCriticalTopics = () => {
    const critical = [];
    Object.entries(subjects).forEach(([subjectKey, subject]) => {
      // Check if topics array exists
      if (!subject.topics || !Array.isArray(subject.topics)) return;
      
      subject.topics.forEach(topic => {
        // Check if revisions array exists
        const revisions = Array.isArray(topic.revisions) ? topic.revisions : [];
        const completedCount = revisions.filter(r => r.completed).length;
        if (topic.priority === 'CRITICAL' && completedCount < 3) {
          critical.push({
            subject: subject.name,
            ...topic,
            daysLeft: getDaysUntil(subject.examDate),
          });
        }
      });
    });
    return critical.sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const overallProgress = calculateProgress();
  const criticalTopics = getCriticalTopics();
  const greDay = getDaysUntil(gre.examDate);
  
  // Show loading indicator if data is being fetched
  const isLoading = subjectsLoading && progressLoading && userLoading;

  return (
    <div className="min-h-screen bg-[#FDFCF6] p-6 relative">
      {/* FLOATING SPARKLES - ADD SOUL ✨ */}
      <div className="floating-sparkles">
        <span>✨</span>
        <span>⭐</span>
        <span>✨</span>
        <span>💫</span>
        <span>✨</span>
        <span>⭐</span>
        <span>✨</span>
        <span>💫</span>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* ═══════════════════════════════════════════════════════════════
            DREAM HEADER 🌸
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <Card className="bg-[#FFD4C4] p-8 border-2 border-[#FFAA8F] shadow-lg">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="w-10 h-10 text-[#8B5A3C] float" />
                  <h1 className="text-4xl font-bold text-[#8B5A3C] display-text">{user.dream} ✨</h1>
                </div>
                <p className="text-2xl text-[#A0725B] mb-2 handwriting">{user.name}</p>
                <p className="text-xl text-[#B08A6F] italic">"{user.motto}"</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#B08A6F] mb-1">Current Streak</div>
                <div className="text-5xl font-bold flex items-center gap-2 text-[#8B5A3C] gentle-pulse">
                  {liveProgress?.streak || user.currentStreak} <span className="text-3xl sparkle-effect">🔥</span>
                </div>
                <div className="text-sm text-[#B08A6F] mt-1">days in a row!</div>
              </div>
            </div>
            {/* Decorative stars */}
            <div className="absolute top-4 right-4 text-4xl opacity-20 float">✨</div>
            <div className="absolute bottom-4 left-4 text-3xl opacity-20 float" style={{animationDelay: '1s'}}>⭐</div>
          </Card>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            QUICK STATS 📊 - WITH ORGANIC IMPERFECTION
            ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ transform: 'rotate(0.8deg)' }}
          >
            <Card gradient className="border-l-4 border-[#FFB5C0] h-[calc(100%+8px)]">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#FFE5E8] flex items-center justify-center">
                  <Flame className="w-6 h-6 text-[#FFB5C0]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm text-[#7A8A7D] mb-1">Critical Topics</h3>
                  <p className="text-3xl font-bold text-[#FFB5C0]">{criticalTopics.length}</p>
                </div>
              </div>
              <p className="text-sm text-[#7A8A7D]">Need attention</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ transform: 'rotate(-0.3deg)' }}
          >
            <Card gradient className="border-l-4 border-[#80D6D6] h-[calc(100%-6px)]">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#D5F4E6] flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#80D6D6]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm text-[#7A8A7D] mb-1">Overall Progress</h3>
                  <p className="text-3xl font-bold text-[#80D6D6]">{overallProgress}%</p>
                </div>
              </div>
              <ProgressBar value={overallProgress} max={100} color="success" showLabel={false} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ transform: 'rotate(1deg)' }}
          >
            <Card gradient className="border-l-4 border-[#C5A3FF]">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#E6E3F5] flex items-center justify-center">
                  <Brain className="w-6 h-6 text-[#C5A3FF]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm text-[#7A8A7D] mb-1">GRE Countdown</h3>
                  <p className="text-3xl font-bold text-[#C5A3FF]">{greDay} days</p>
                </div>
              </div>
              <p className="text-sm text-[#7A8A7D]">Target: 320+</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ transform: 'rotate(-0.5deg)' }}
            className="md:col-span-2 lg:col-span-3"
          >
            <Card gradient className="border-l-4 border-[#FFD700]">
              <XPProgressBar />
            </Card>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            TODAY'S SCHEDULE PREVIEW 📅
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#2D3436] flex items-center gap-3">
                <Calendar className="w-6 h-6 text-[#C5A3FF]" />
                Today's Plan
              </h2>
              <Badge variant="default">{schedule.blocks.length} activities</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedule.blocks.slice(0, 6).map((block, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="p-4 rounded-2xl border-2 border-[#F8F6ED]"
                  style={{ borderLeftColor: block.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#2D3436]">{block.time}</span>
                    <Badge size="sm" variant="default">{block.duration}m</Badge>
                  </div>
                  <p className="text-sm text-[#7A8A7D] font-medium">{block.activity}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            CRITICAL TOPICS - HIGH PRIORITY! 🔥
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-2 border-[#FF9B9B]/20">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="w-8 h-8 text-[#FF9B9B]" />
              <h2 className="text-2xl font-bold text-[#2D3436]">
                High-Hour Critical Topics
              </h2>
              <div className="ml-auto">
                <Badge variant="critical">{criticalTopics.length} pending</Badge>
              </div>
            </div>

            {criticalTopics.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-[#80D6D6] font-semibold">All critical topics covered!</p>
                <p className="text-[#7A8A7D] text-sm mt-1">You're on track for 55+ in all subjects!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {criticalTopics.slice(0, 5).map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-5 rounded-2xl bg-gradient-to-r from-[#FFE5E8] to-white border-l-4 border-[#FF9B9B]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-[#2D3436]">
                            {topic.subject} - {topic.name}
                          </h3>
                          <Badge variant="critical">CRITICAL</Badge>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-[#FF9B9B] font-semibold">
                            📅 Exam in {topic.daysLeft} days
                          </span>
                          <span className="text-[#FFB5C0]">
                            ⏱️ {topic.hours || 0}h coverage
                          </span>
                          <span className="text-[#C5A3FF]">
                            📊 COs: {Array.isArray(topic.cos) ? topic.cos.join(', ') : 'N/A'}
                          </span>
                          <span className="text-[#80D6D6]">
                            🎯 {topic.examWeight || 0}% of exam
                          </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Badge size="sm" variant={topic.revisions?.[0]?.completed ? 'success' : 'default'}>
                            R1 {topic.revisions?.[0]?.completed ? '✓' : '○'}
                          </Badge>
                          <Badge size="sm" variant={topic.revisions?.[1]?.completed ? 'success' : 'default'}>
                            R2 {topic.revisions?.[1]?.completed ? '✓' : '○'}
                          </Badge>
                          <Badge size="sm" variant={topic.revisions?.[2]?.completed ? 'success' : 'default'}>
                            R3 {topic.revisions?.[2]?.completed ? '✓' : '○'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-4xl ml-4">🔥</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            SUBJECTS OVERVIEW 📚
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#2D3436]">Your Subjects</h2>
            <TrendingUp className="w-6 h-6 text-[#80D6D6]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(subjects).map(([key, subject], index) => {
              const daysLeft = getDaysUntil(subject.examDate);
              const subjectProgress = (() => {
                if (!subject.topics || !Array.isArray(subject.topics)) return 0;
                
                let total = subject.topics.length * 3;
                let completed = 0;
                subject.topics.forEach(t => {
                  const revisions = Array.isArray(t.revisions) ? t.revisions : [];
                  revisions.forEach(r => {
                    if (r.completed) completed++;
                  });
                });
                return Math.round((completed / total) * 100);
              })();

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Card hover className="cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-[#2D3436]">{subject.name}</h3>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#7A8A7D]">Target Score:</span>
                        <span className="font-semibold text-[#80D6D6]">{subject.targetScore}+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7A8A7D]">Total Hours:</span>
                        <span className="font-semibold">{subject.totalHours}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7A8A7D]">Days Left:</span>
                        <span className={`font-bold ${daysLeft <= 7 ? 'text-[#FF9B9B]' : 'text-[#80D6D6]'}`}>
                          {daysLeft}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-[#7A8A7D]">Progress</span>
                        <span className="font-bold text-[#2D3436]">{subjectProgress}%</span>
                      </div>
                      <ProgressBar
                        value={subjectProgress}
                        max={100}
                        color="primary"
                        showLabel={false}
                        height="sm"
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
