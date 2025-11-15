import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Archive, PlayCircle, PauseCircle, Trash2, Edit, Download, RotateCcw, CheckCircle2, AlertCircle, Brain, Calculator } from 'lucide-react';
import { Card, Button, Badge, Modal } from './UI';
import INITIAL_DATA from '../data/initialData';
import AddSubjectModal from './AddSubjectModal';
import { saveSubjects, loadSubjects } from '../utils/storage';
import { explainConcept } from '../utils/wolframService';

// ═══════════════════════════════════════════════════════════════
// SUBJECTS MANAGEMENT COMPONENT - Dynamic Subject Lifecycle 🎓
// ═══════════════════════════════════════════════════════════════
export default function SubjectsManage() {
  // Load subjects from localStorage or use initial data
  const [subjects, setSubjects] = useState(() => {
    const saved = loadSubjects();
    return saved || INITIAL_DATA.subjects;
  });
  
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'archived', 'upcoming'
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  
  // Concept Explainer state
  const [showExplainer, setShowExplainer] = useState(false);
  const [conceptToExplain, setConceptToExplain] = useState('');
  const [explanation, setExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  // Save subjects to localStorage whenever they change
  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  // Handle adding new subject
  const handleAddSubject = (newSubject) => {
    setSubjects({
      ...subjects,
      [newSubject.id]: newSubject
    });
    
    console.log('✅ Subject added:', newSubject.name);
  };

  // Handle archiving subject
  const handleArchiveSubject = (subjectId) => {
    setSubjects({
      ...subjects,
      [subjectId]: {
        ...subjects[subjectId],
        status: 'archived',
        archivedDate: new Date().toISOString().split('T')[0]
      }
    });
    
    console.log('📦 Subject archived:', subjects[subjectId].name);
  };

  // Handle restoring subject
  const handleRestoreSubject = (subjectId) => {
    setSubjects({
      ...subjects,
      [subjectId]: {
        ...subjects[subjectId],
        status: 'active',
        archivedDate: null
      }
    });
    
    console.log('♻️ Subject restored:', subjects[subjectId].name);
  };

  // Filter subjects by status
  const getSubjects = (status) => {
    return Object.values(subjects).filter(s => s.status === status);
  };

  const activeSubjects = getSubjects('active');
  const archivedSubjects = getSubjects('archived');
  const upcomingSubjects = getSubjects('upcoming');

  // Calculate subject progress
  const calculateProgress = (subject) => {
    if (!subject.topics || subject.topics.length === 0) return 0;
    const totalMastery = subject.topics.reduce((sum, topic) => sum + topic.mastery, 0);
    return Math.round(totalMastery / subject.topics.length);
  };

  // Calculate days until exam
  const getDaysUntil = (dateString) => {
    const target = new Date(dateString);
    const today = new Date();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFCF6] p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ═══════════════════════════════════════════════════════════════
            HEADER
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[#2D3436] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
                📚 Learning Journey
              </h1>
              <p className="text-[#7A8A7D]" style={{fontFamily: 'Caveat, cursive', fontSize: '18px'}}>
                Manage your subjects across all life stages
              </p>
            </div>
            <Button 
              icon={<Plus className="w-5 h-5" />}
              onClick={() => setShowAddModal(true)}
            >
              Add New Subject
            </Button>
          </div>

          {/* Tab Navigation */}
          <Card className="p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'active'
                    ? 'bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white shadow-md'
                    : 'text-[#7A8A7D] hover:bg-[#F5F1E8]'
                }`}
              >
                <PlayCircle className="w-5 h-5" />
                Active ({activeSubjects.length})
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'archived'
                    ? 'bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white shadow-md'
                    : 'text-[#7A8A7D] hover:bg-[#F5F1E8]'
                }`}
              >
                <Archive className="w-5 h-5" />
                Archived ({archivedSubjects.length})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white shadow-md'
                    : 'text-[#7A8A7D] hover:bg-[#F5F1E8]'
                }`}
              >
                <AlertCircle className="w-5 h-5" />
                Upcoming ({upcomingSubjects.length})
              </button>
            </div>
          </Card>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            ACTIVE SUBJECTS TAB
            ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {activeSubjects.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-2xl font-bold text-[#2D3436] mb-2">No Active Subjects</h3>
                  <p className="text-[#7A8A7D] mb-6">Start your learning journey by adding a subject!</p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Subject
                  </Button>
                </Card>
              ) : (
                activeSubjects.map((subject, index) => {
                  const progress = calculateProgress(subject);
                  const daysLeft = getDaysUntil(subject.examDate);
                  const isUrgent = daysLeft <= 7 && daysLeft > 0;
                  const isPast = daysLeft < 0;

                  return (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between gap-6">
                          {/* Left: Subject Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold text-white"
                                style={{ background: subject.color }}
                              >
                                {subject.name.substring(0, 2)}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-[#2D3436]">{subject.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-[#7A8A7D]">
                                  <Badge variant={subject.importance === 'high' ? 'danger' : 'default'}>
                                    {subject.type}
                                  </Badge>
                                  <span>•</span>
                                  <span>{subject.semester}</span>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-[#7A8A7D]">Progress</span>
                                <span className="text-sm font-bold" style={{ color: subject.color }}>
                                  {progress}%
                                </span>
                              </div>
                              <div className="w-full h-3 bg-[#F8F6ED] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                  className="h-full rounded-full"
                                  style={{ background: subject.color }}
                                />
                              </div>
                            </div>

                            {/* Exam Date */}
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-[#9B8AA3]">Exam: </span>
                                <span className="font-semibold text-[#2D3436]">
                                  {formatDate(subject.examDate)}
                                </span>
                              </div>
                              <div className={`font-bold ${
                                isPast ? 'text-[#FF9B9B]' : 
                                isUrgent ? 'text-[#FFB4A4]' : 
                                'text-[#7DD3C0]'
                              }`}>
                                {isPast ? '⚠️ Exam passed!' : `📍 ${daysLeft} days left`}
                              </div>
                            </div>
                          </div>

                          {/* Right: Stats & Actions */}
                          <div className="text-right">
                            <div className="mb-4">
                              <div className="text-3xl font-bold" style={{ color: subject.color }}>
                                {subject.targetScore}
                              </div>
                              <div className="text-xs text-[#9B8AA3]">Target Score</div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setConceptToExplain(subject.name);
                                  setShowExplainer(true);
                                }}
                                className="p-2 rounded-lg hover:bg-orange-50 transition-colors group"
                                title="Explain with Wolfram"
                              >
                                <Brain className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                              </button>
                              <button
                                className="p-2 rounded-lg hover:bg-[#F5F1E8] transition-colors"
                                title="View Details"
                              >
                                <Edit className="w-4 h-4 text-[#9B8AA3]" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedSubject(subject);
                                  setShowCompleteModal(true);
                                }}
                                className="p-2 rounded-lg hover:bg-[#E6FFE6] transition-colors"
                                title="Mark Complete"
                              >
                                <CheckCircle2 className="w-4 h-4 text-[#7DD3C0]" />
                              </button>
                              <button
                                onClick={() => handleArchiveSubject(subject.id)}
                                className="p-2 rounded-lg hover:bg-[#FFE5E8] transition-colors"
                                title="Archive"
                              >
                                <Archive className="w-4 h-4 text-[#FFB4A4]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              ARCHIVED SUBJECTS TAB
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'archived' && (
            <motion.div
              key="archived"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {archivedSubjects.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-2xl font-bold text-[#2D3436] mb-2">No Archived Subjects Yet</h3>
                  <p className="text-[#7A8A7D] mb-6">Completed subjects will appear here after you archive them.</p>
                  
                  {/* Info Box */}
                  <div className="max-w-2xl mx-auto mt-8 p-6 bg-gradient-to-br from-[#E6D4F5] to-[#FFE5E8] rounded-2xl">
                    <h4 className="text-lg font-bold text-[#2D3436] mb-3">
                      💡 What happens when you archive a subject?
                    </h4>
                    <div className="text-left space-y-2 text-[#7A8A7D]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#7DD3C0]" />
                        <span>Progress & scores are preserved forever</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#7DD3C0]" />
                        <span>Resources remain accessible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#7DD3C0]" />
                        <span>Removed from daily planning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#7DD3C0]" />
                        <span>Can be restored anytime</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#7DD3C0]" />
                        <span>Exported to PDF/JSON for records</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {archivedSubjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="opacity-75 hover:opacity-100 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CheckCircle2 className="w-8 h-8 text-[#7DD3C0]" />
                              <div>
                                <h3 className="text-xl font-bold text-[#2D3436]">{subject.name}</h3>
                                <div className="text-sm text-[#7A8A7D]">
                                  Completed: {formatDate(subject.completedDate || subject.examDate)}
                                </div>
                              </div>
                            </div>

                            {subject.actualScore && (
                              <div className="flex items-center gap-4 mt-3">
                                <div>
                                  <span className="text-2xl font-bold text-[#7DD3C0]">
                                    {subject.actualScore}
                                  </span>
                                  <span className="text-sm text-[#9B8AA3]">/{subject.targetScore} target</span>
                                </div>
                                {subject.actualScore >= subject.targetScore && (
                                  <Badge variant="success">🎉 Target Met!</Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRestoreSubject(subject.id)}
                              className="p-2 rounded-lg hover:bg-[#E6F3FF] transition-colors"
                              title="Restore"
                            >
                              <RotateCcw className="w-4 h-4 text-[#90C8E8]" />
                            </button>
                            <button
                              className="p-2 rounded-lg hover:bg-[#E6FFE6] transition-colors"
                              title="Export"
                            >
                              <Download className="w-4 h-4 text-[#7DD3C0]" />
                            </button>
                            <button
                              className="p-2 rounded-lg hover:bg-[#FFE5E8] transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-[#FF9B9B]" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSubject}
      />

      {/* Concept Explainer Modal - Wolfram Powered! */}
      <AnimatePresence>
        {showExplainer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExplainer(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Concept Explainer</h2>
                      <p className="text-sm text-gray-600">Learn with Wolfram Alpha's knowledge engine</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowExplainer(false);
                      setConceptToExplain('');
                      setExplanation(null);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What concept do you want to understand?
                  </label>
                  <input
                    type="text"
                    value={conceptToExplain}
                    onChange={(e) => setConceptToExplain(e.target.value)}
                    placeholder="e.g., quadratic formula, Newton's laws, photosynthesis"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && conceptToExplain.trim()) {
                        handleExplainConcept();
                      }
                    }}
                    disabled={explaining}
                  />
                </div>

                {/* Action Button */}
                <Button
                  onClick={async () => {
                    if (!conceptToExplain.trim()) return;
                    
                    setExplaining(true);
                    try {
                      const result = await explainConcept(conceptToExplain);
                      setExplanation(result);
                    } catch (error) {
                      console.error('Explanation error:', error);
                      setExplanation({ success: false, error: 'Failed to get explanation' });
                    } finally {
                      setExplaining(false);
                    }
                  }}
                  disabled={!conceptToExplain.trim() || explaining}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg mb-4"
                >
                  {explaining ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="mr-2"
                      >
                        <Calculator className="w-4 h-4" />
                      </motion.div>
                      Explaining...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Explain with Wolfram
                    </>
                  )}
                </Button>

                {/* Result */}
                <AnimatePresence>
                  {explanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {explanation.success && explanation.pods ? (
                        <div className="space-y-4">
                          {explanation.pods.map((pod, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200"
                            >
                              <h3 className="font-bold text-purple-800 mb-3 text-lg">{pod.title}</h3>
                              {pod.image && (
                                <img
                                  src={pod.image}
                                  alt={pod.title}
                                  className="w-full rounded-lg shadow-md mb-3"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              )}
                              {pod.text && (
                                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                  {pod.text}
                                </p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                          <p className="text-red-800 text-sm">{explanation.error || 'Failed to get explanation'}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Examples */}
                {!explanation && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-700 mb-2">💡 Popular concepts:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'quadratic formula',
                        "Newton's laws",
                        'pythagorean theorem',
                        'photosynthesis',
                        'speed of light',
                        'golden ratio'
                      ].map((example) => (
                        <button
                          key={example}
                          onClick={() => setConceptToExplain(example)}
                          className="text-xs px-3 py-1.5 bg-white rounded-full hover:bg-gray-100 border border-gray-200 transition-colors"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t-2 border-gray-100 text-center">
                  <p className="text-xs text-gray-500">
                    Powered by <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Wolfram|Alpha</span>
                  </p>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
