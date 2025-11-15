import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { Calendar, Trophy, AlertCircle, BookOpen, CheckCircle2, Clock, Sparkles, Zap, Star, CheckCircle, Brain } from 'lucide-react';
import { Card, Button, Badge } from './UI';
import { useSubjects, useProgress } from '../hooks/useBackend';
import { getSimpleAnswer } from '../utils/wolframService';
import { generateSmartPracticeProblems } from '../utils/masteryValidation';
import { addXP } from '../utils/xpSystem';

// ═══════════════════════════════════════════════════════════════
// EXAMS COMPONENT - MASTERY TRACKING 📚 (NOW WITH REAL DATA!)
// ═══════════════════════════════════════════════════════════════
export default function Exams() {
  // Load REAL data from backend (not sample data!)
  const { subjects: subjectsData, loading: subjectsLoading } = useSubjects(5000);
  const { progress, loading: progressLoading } = useProgress(5000);
  
  const [selectedSubject, setSelectedSubject] = useState('vlsi');
  const [showPractice, setShowPractice] = useState(false);
  const [practiceQuestion, setPracticeQuestion] = useState('');
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [wolframResult, setWolframResult] = useState(null);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [practiceScore, setPracticeScore] = useState(() => {
    const saved = localStorage.getItem('practice_score');
    return saved ? JSON.parse(saved) : { correct: 0, total: 0 };
  });

  // Show loading state
  if (subjectsLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-500">Loading your progress...</div>
      </div>
    );
  }

  // Convert subjects object to expected format
  const subjects = subjectsData || {};

  // Calculate days until exam
  const getDaysUntil = (dateString) => {
    const target = new Date(dateString);
    const today = new Date();
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  };

  // Get mastery level color
  const getMasteryColor = (mastery) => {
    if (mastery >= 80) return '#80D6D6'; // teal-calm
    if (mastery >= 60) return '#C5A3FF'; // violet-dream
    if (mastery >= 40) return '#FFB5C0'; // sunset-pink
    return '#FF9B9B'; // coral-pink
  };

  // Get revision badge variant
  const getRevisionBadge = (topic) => {
    const revisions = Array.isArray(topic.revisions) ? topic.revisions.filter(r => r.completed).length : 0;
    if (revisions === 0) return { variant: 'danger', text: 'Not Started' };
    if (revisions === 1) return { variant: 'warning', text: 'R1 Done' };
    if (revisions === 2) return { variant: 'info', text: 'R2 Done' };
    if (revisions === 3) return { variant: 'success', text: 'R3 Done' };
    return { variant: 'default', text: 'Unknown' };
  };

  // Calculate overall progress (use real backend data!)
  const calculateOverallProgress = () => {
    // If we have progress from backend, use it
    if (progress && progress.averageProgress !== undefined) {
      return progress.averageProgress;
    }
    
    // Otherwise calculate from subjects
    const allSubjects = Object.values(subjects).filter(s => s.status === 'active');
    if (allSubjects.length === 0) return 0;
    
    const totalProgress = allSubjects.reduce((sum, s) => {
      if (!s.topics || s.topics.length === 0) return sum;
      const subjectProgress = s.topics.reduce((topicSum, t) => topicSum + (t.mastery || 0), 0) / s.topics.length;
      return sum + subjectProgress;
    }, 0);
    
    return Math.round(totalProgress / allSubjects.length);
  };

  // Get critical topics (mastery < 40% or no revisions)
  const getCriticalTopics = () => {
    const critical = [];
    Object.entries(subjects).forEach(([key, subject]) => {
      // Check if topics array exists
      if (!subject.topics || !Array.isArray(subject.topics)) return;
      
      subject.topics.forEach(topic => {
        // Check if revisions array exists
        const revisions = Array.isArray(topic.revisions) ? topic.revisions : [];
        if (topic.mastery < 40 || revisions.filter(r => r.completed).length === 0) {
          critical.push({
            ...topic,
            subjectName: subject.name,
            subjectKey: key,
            daysToExam: getDaysUntil(subject.examDate),
          });
        }
      });
    });
    return critical.sort((a, b) => a.daysToExam - b.daysToExam).slice(0, 5);
  };

  const overallProgress = calculateOverallProgress();
  const criticalTopics = getCriticalTopics();
  const currentSubject = subjects[selectedSubject] || Object.values(subjects)[0];

  // If no subjects exist yet, show empty state
  if (!currentSubject) {
    return (
      <div className="min-h-screen bg-[#FDFCF6] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No subjects yet</h2>
              <p className="text-gray-600">Add subjects to start tracking your exam progress</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF6] p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#2D3436] mb-2">Exam Mastery Tracker</h1>
          <p className="text-[#7A8A7D]">Track your progress, master your subjects 🎯</p>
        </motion.div>

        {/* Overall Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Overall Progress Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center">
              <div className="w-32 h-32 mx-auto mb-4">
                <CircularProgressbar
                  value={overallProgress}
                  text={`${overallProgress}%`}
                  styles={buildStyles({
                    textSize: '20px',
                    pathColor: '#C5A3FF',
                    textColor: '#C5A3FF',
                    trailColor: '#F8F6ED',
                  })}
                />
              </div>
              <h3 className="text-lg font-bold text-[#2D3436] mb-1">Overall Progress</h3>
              <p className="text-sm text-[#7A8A7D]">All subjects combined</p>
            </Card>
          </motion.div>

          {/* Days to First Exam */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#FFE5E8] to-white">
              <Calendar className="w-12 h-12 text-[#FF9B9B] mb-3" />
              <div className="text-4xl font-bold text-[#FF9B9B] mb-1">
                {Math.min(...Object.values(subjects).map(s => getDaysUntil(s.examDate)))}
              </div>
              <p className="text-sm text-[#7A8A7D]">Days to first exam</p>
            </Card>
          </motion.div>

          {/* Critical Topics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#FFE5D9] to-white">
              <AlertCircle className="w-12 h-12 text-[#FFB5C0] mb-3" />
              <div className="text-4xl font-bold text-[#FFB5C0] mb-1">
                {criticalTopics.length}
              </div>
              <p className="text-sm text-[#7A8A7D]">Critical topics</p>
            </Card>
          </motion.div>

          {/* Completed Topics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#D5F4E6] to-white">
              <Trophy className="w-12 h-12 text-[#80D6D6] mb-3" />
              <div className="text-4xl font-bold text-[#80D6D6] mb-1">
                {Object.values(subjects).reduce((sum, s) => 
                  sum + s.topics.filter(t => t.mastery >= 80).length, 0
                )}
              </div>
              <p className="text-sm text-[#7A8A7D]">Mastered topics</p>
            </Card>
          </motion.div>
        </div>

        {/* Critical Topics Alert */}
        {criticalTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-[#FFE5E8] to-[#FFE5D9]">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-[#FF9B9B] flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#FF9B9B] mb-2">⚠️ Needs Attention</h3>
                  <p className="text-[#7A8A7D] mb-3">These topics need immediate focus:</p>
                  <div className="flex flex-wrap gap-2">
                    {criticalTopics.map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSubject(topic.subjectKey)}
                        className="px-4 py-2 bg-white rounded-xl text-sm font-semibold text-[#FF9B9B] hover:bg-[#FFE5E8] transition-all shadow-sm"
                      >
                        {topic.subjectName}: {topic.name}
                        <span className="ml-2 text-xs">({topic.daysToExam}d)</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Practice Problems Section - NEW! */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Smart Practice
                    <Badge className="bg-purple-500 text-white text-xs px-2 py-1">AI-Powered</Badge>
                  </h3>
                  <p className="text-sm text-gray-600">Practice problems for {currentSubject?.name || 'your subjects'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-purple-600">
                  <Star className="w-5 h-5 fill-purple-500" />
                  <span className="text-2xl font-bold">{practiceScore.correct}</span>
                  <span className="text-sm text-gray-600">/ {practiceScore.total}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {practiceScore.total > 0 ? `${Math.round((practiceScore.correct / practiceScore.total) * 100)}% accuracy` : 'No attempts yet'}
                </p>
              </div>
            </div>

            {!showPractice ? (
              <motion.button
                onClick={() => setShowPractice(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Start Smart Practice
              </motion.button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter your practice problem:
                  </label>
                  <input
                    type="text"
                    value={practiceQuestion}
                    onChange={(e) => setPracticeQuestion(e.target.value)}
                    placeholder="e.g., solve x^2 + 5x + 6 = 0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your answer:
                  </label>
                  <input
                    type="text"
                    value={practiceAnswer}
                    onChange={(e) => setPracticeAnswer(e.target.value)}
                    placeholder="Enter your solution..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && practiceQuestion && practiceAnswer) {
                        handleCheckAnswer();
                      }
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={async () => {
                      if (!practiceQuestion) return;
                      setCheckingAnswer(true);
                      try {
                        const result = await getSimpleAnswer(practiceQuestion);
                        setWolframResult(result);
                      } catch (error) {
                        console.error('Answer checking error:', error);
                      } finally {
                        setCheckingAnswer(false);
                      }
                    }}
                    disabled={!practiceQuestion || checkingAnswer}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg"
                  >
                    {checkingAnswer ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                        </motion.div>
                        Checking...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Check Answer
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={async () => {
                      if (!practiceQuestion || !practiceAnswer) return;
                      
                      const newScore = {
                        ...practiceScore,
                        total: practiceScore.total + 1,
                        correct: practiceScore.correct + (wolframResult?.success ? 1 : 0)
                      };
                      
                      setPracticeScore(newScore);
                      localStorage.setItem('practice_score', JSON.stringify(newScore));
                      
                      // Award XP for practice
                      const xpGained = wolframResult?.success ? 15 : 5;
                      addXP(xpGained, `Practice problem ${wolframResult?.success ? 'solved' : 'attempted'}`);
                      
                      // Reset for next problem
                      setPracticeQuestion('');
                      setPracticeAnswer('');
                      setWolframResult(null);
                    }}
                    disabled={!practiceQuestion || !practiceAnswer}
                    variant="outline"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit & Next
                  </Button>

                  <Button
                    onClick={() => {
                      setShowPractice(false);
                      setPracticeQuestion('');
                      setPracticeAnswer('');
                      setWolframResult(null);
                    }}
                    variant="ghost"
                  >
                    Close
                  </Button>
                </div>

                {/* Wolfram Result */}
                <AnimatePresence>
                  {wolframResult && wolframResult.success && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 bg-white rounded-xl border-2 border-orange-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="w-5 h-5 text-orange-500" />
                        <span className="font-bold text-orange-700">Wolfram Solution:</span>
                      </div>
                      <img
                        src={wolframResult.imageUrl}
                        alt="Solution"
                        className="w-full rounded-lg shadow-md"
                        onError={() => setWolframResult({ ...wolframResult, success: false, error: 'Failed to load image' })}
                      />
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">Compare your answer with Wolfram's solution!</span>
                      </div>
                    </motion.div>
                  )}
                  {wolframResult && !wolframResult.success && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
                    >
                      <p className="text-red-800 text-sm">{wolframResult.error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Examples */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 w-full">Quick examples:</span>
                  {['solve x^2 - 4 = 0', 'integrate x^3', 'derivative of sin(x)', '2x + 5 = 13'].map((example) => (
                    <button
                      key={example}
                      onClick={() => setPracticeQuestion(example)}
                      className="text-xs px-3 py-1.5 bg-white rounded-full hover:bg-gray-100 border border-gray-200 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ═══════════════════════════════════════════════════════════════
              LEFT SIDE - SUBJECT LIST WITH CIRCULAR PROGRESS
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-1 space-y-4">
            {Object.entries(subjects).map(([key, subject], index) => {
              const daysLeft = getDaysUntil(subject.examDate);
              const avgMastery = Math.round(
                subject.topics.reduce((sum, t) => sum + t.mastery, 0) / subject.topics.length
              );
              const isUrgent = daysLeft <= 7;
              const isSelected = key === selectedSubject;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedSubject(key)}
                  className="cursor-pointer"
                >
                  <Card 
                    className={`transition-all ${
                      isSelected 
                        ? 'ring-2 ring-[#C5A3FF] shadow-lg scale-[1.02]' 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Circular Progress */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <CircularProgressbar
                          value={avgMastery}
                          text={`${avgMastery}%`}
                          styles={buildStyles({
                            textSize: '24px',
                            pathColor: getMasteryColor(avgMastery),
                            textColor: getMasteryColor(avgMastery),
                            trailColor: '#F8F6ED',
                          })}
                        />
                      </div>

                      {/* Subject Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#2D3436] mb-1">{subject.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-[#7A8A7D] mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(subject.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className={`ml-2 font-semibold ${isUrgent ? 'text-[#FF9B9B]' : 'text-[#C5A3FF]'}`}>
                            ({daysLeft}d)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#9B8AA3]" />
                          <span className="text-sm text-[#9B8AA3]">
                            {subject.topics.length} topics • {subject.weight}% of grade
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT SIDE - TOPIC DETAILS
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-2">
            <motion.div
              key={selectedSubject}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Subject Header */}
              <Card className="bg-[#E9ECEF] border-2 border-[#D9E4E0]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#2D3436] mb-1">
                      {currentSubject.name}
                    </h2>
                    <p className="text-[#7A8A7D]">
                      Exam: {new Date(currentSubject.examDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#C5A3FF] mb-1">
                      {getDaysUntil(currentSubject.examDate)}d
                    </div>
                    <p className="text-sm text-[#9B8AA3]">until exam</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-[#C5A3FF]">{currentSubject.topics.length}</div>
                    <div className="text-xs text-[#7A8A7D]">Total Topics</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-[#80D6D6]">
                      {currentSubject.topics.filter(t => t.mastery >= 80).length}
                    </div>
                    <div className="text-xs text-[#7A8A7D]">Mastered</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-[#FFB5C0]">{currentSubject.weight}%</div>
                    <div className="text-xs text-[#7A8A7D]">Exam Weight</div>
                  </div>
                </div>
              </Card>

              {/* Topics List */}
              <div className="space-y-3">
                {currentSubject.topics.map((topic, index) => {
                  const revisionBadge = getRevisionBadge(topic);
                  const revisions = Array.isArray(topic.revisions) ? topic.revisions : [];
                  const completedRevisions = revisions.filter(r => r.completed).length;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-[#2D3436] mb-1">{topic.name}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={revisionBadge.variant}>{revisionBadge.text}</Badge>
                              <Badge variant="default">{topic.weight}% weight</Badge>
                              {topic.nextRevision && (
                                <Badge variant="info">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Next: {new Date(topic.nextRevision).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Mastery Circle */}
                          <div className="w-16 h-16 flex-shrink-0">
                            <CircularProgressbar
                              value={topic.mastery}
                              text={`${topic.mastery}%`}
                              styles={buildStyles({
                                textSize: '20px',
                                pathColor: getMasteryColor(topic.mastery),
                                textColor: getMasteryColor(topic.mastery),
                                trailColor: '#F8F6ED',
                              })}
                            />
                          </div>
                        </div>

                        {/* Revision Tracking */}
                        <div className="space-y-2">
                          {(Array.isArray(topic.revisions) ? topic.revisions : []).map((revision, revIndex) => (
                            <div
                              key={revIndex}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                revision.completed
                                  ? 'bg-gradient-to-r from-[#D5F4E6] to-[#E6F7F2]'
                                  : 'bg-[#F8F6ED]'
                              }`}
                            >
                              {revision.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-[#80D6D6] flex-shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-[#D5CDB8] flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`font-semibold ${
                                    revision.completed ? 'text-[#80D6D6]' : 'text-[#7A8A7D]'
                                  }`}>
                                    Revision {revIndex + 1}
                                  </span>
                                  {revision.completed && revision.date && (
                                    <span className="text-xs text-[#9B8AA3]">
                                      • {new Date(revision.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {!revision.completed && (
                                <Button size="sm" variant="ghost">Start</Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
