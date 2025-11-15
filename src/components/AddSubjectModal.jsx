import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Calendar, Target, BookOpen, Brain } from 'lucide-react';
import { Button, Badge } from './UI';

// ═══════════════════════════════════════════════════════════════
// ADD SUBJECT MODAL - Create New Learning Journey 🎓
// ═══════════════════════════════════════════════════════════════
export default function AddSubjectModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    color: '#B5A3E5',
    type: 'technical',
    importance: 'high',
    semester: '',
    startDate: new Date().toISOString().split('T')[0],
    examDate: '',
    targetScore: 50,
    totalHours: 40,
    status: 'active'
  });

  const [showAIHelp, setShowAIHelp] = useState(false);

  // Color palette
  const COLORS = [
    { name: 'Lavender', value: '#B5A3E5' },
    { name: 'Mint', value: '#7DD3C0' },
    { name: 'Peach', value: '#FFAA8F' },
    { name: 'Sky', value: '#90C8E8' },
    { name: 'Pink', value: '#FFB4D1' },
    { name: 'Coral', value: '#FF9B9B' },
    { name: 'Lemon', value: '#FFE66D' },
    { name: 'Sage', value: '#A8D5BA' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate ID from name
    const id = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Create new subject object
    const newSubject = {
      id,
      name: formData.name,
      color: formData.color,
      status: formData.status,
      startDate: formData.startDate,
      examDate: formData.examDate,
      completedDate: null,
      archivedDate: null,
      targetScore: parseInt(formData.targetScore),
      actualScore: null,
      totalHours: parseInt(formData.totalHours),
      hoursCompleted: 0,
      type: formData.type,
      semester: formData.semester,
      importance: formData.importance,
      keepAfterCompletion: true,
      exportBeforeArchive: true,
      topics: []
    };

    onAdd(newSubject);
    
    // Reset form
    setFormData({
      name: '',
      color: '#B5A3E5',
      type: 'technical',
      importance: 'high',
      semester: '',
      startDate: new Date().toISOString().split('T')[0],
      examDate: '',
      targetScore: 50,
      totalHours: 40,
      status: 'active'
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#E6D4F5] to-[#FFE5E8] p-6 rounded-t-3xl border-b-2 border-[#FFE5E8]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B5A3E5] to-[#FFB4D1] flex items-center justify-center shadow-md">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2D3436]" style={{fontFamily: 'Playfair Display, serif'}}>
                    Add New Subject
                  </h2>
                  <p className="text-sm text-[#7A8A7D]" style={{fontFamily: 'Caveat, cursive', fontSize: '16px'}}>
                    Start a new learning adventure ✨
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/50 transition-colors"
              >
                <X className="w-6 h-6 text-[#9B8AA3]" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Subject Name */}
            <div>
              <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                Subject Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Deep Learning, Spanish A1, AWS Certification..."
                className="w-full px-4 py-3 rounded-xl border-2 border-[#F5F1E8] focus:border-[#B5A3E5] focus:outline-none transition-colors"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#2D3436] mb-3">
                Choose Your Color 🎨
              </label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-14 h-14 rounded-xl transition-all ${
                      formData.color === color.value
                        ? 'ring-4 ring-[#2D3436] scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Type & Importance Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                  Subject Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#F5F1E8] focus:border-[#B5A3E5] focus:outline-none transition-colors"
                >
                  <option value="technical">📚 Technical</option>
                  <option value="language">🗣️ Language</option>
                  <option value="certification">🏆 Certification</option>
                  <option value="creative">🎨 Creative</option>
                  <option value="business">💼 Business</option>
                  <option value="other">✨ Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                  Importance
                </label>
                <select
                  value={formData.importance}
                  onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#F5F1E8] focus:border-[#B5A3E5] focus:outline-none transition-colors"
                >
                  <option value="high">🔥 High</option>
                  <option value="medium">⚡ Medium</option>
                  <option value="low">💫 Low</option>
                </select>
              </div>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                Semester / Period
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                placeholder="e.g., Spring 2026, Q1 2026, Self-paced..."
                className="w-full px-4 py-3 rounded-xl border-2 border-[#F5F1E8] focus:border-[#B5A3E5] focus:outline-none transition-colors"
              />
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#F5F1E8] focus:border-[#B5A3E5] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Exam Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#F5F1E8] focus:border-[#B5A3E5] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Goals Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                  Target Score
                </label>
                <input
                  type="number"
                  value={formData.targetScore}
                  onChange={(e) => setFormData({ ...formData, targetScore: e.target.value })}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#F5F1E8] focus:border-[#B5A3E5] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                  Total Hours Needed
                </label>
                <input
                  type="number"
                  value={formData.totalHours}
                  onChange={(e) => setFormData({ ...formData, totalHours: e.target.value })}
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#F5F1E8] focus:border-[#B5A3E5] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#F5F1E8] focus:border-[#B5A3E5] focus:outline-none transition-colors"
              >
                <option value="active">✅ Active (Start learning now)</option>
                <option value="upcoming">📅 Upcoming (Planning phase)</option>
              </select>
            </div>

            {/* AI Help Toggle */}
            <motion.div
              className="p-4 rounded-xl bg-gradient-to-br from-[#E6D4F5] to-[#FFE5E8] cursor-pointer"
              onClick={() => setShowAIHelp(!showAIHelp)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#B5A3E5]" />
                  <span className="font-semibold text-[#2D3436]">
                    Need help planning? Ask Luna! 🌙
                  </span>
                </div>
                <Sparkles className="w-5 h-5 text-[#FFB4D1]" />
              </div>
              {showAIHelp && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 text-sm text-[#7A8A7D]"
                >
                  After creating your subject, visit the AI Agent to get personalized study plans,
                  resource recommendations, and topic breakdowns! Luna can analyze your PDFs and
                  videos to help you learn faster. ✨
                </motion.p>
              )}
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-[#F5F1E8] text-[#7A8A7D] font-semibold hover:bg-[#F5F1E8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#B5A3E5] to-[#FFB4D1] text-white font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Create Subject ✨
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
