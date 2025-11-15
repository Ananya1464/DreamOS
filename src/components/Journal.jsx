import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Moon, Sparkles, Heart, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { Card, Button, Badge, TextArea } from './UI';
import INITIAL_DATA from '../data/initialData';

// ═══════════════════════════════════════════════════════════════
// JOURNAL COMPONENT - DAILY REFLECTIONS 📔
// ═══════════════════════════════════════════════════════════════
export default function Journal() {
  const { journal } = INITIAL_DATA;
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'weekly', 'dreams'
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedFeelings, setSelectedFeelings] = useState([]);

  // Mood options for daily reflection
  const moodOptions = [
    { emoji: '😊', label: 'Happy', color: '#80D6D6' },
    { emoji: '😌', label: 'Calm', color: '#C5A3FF' },
    { emoji: '🤔', label: 'Thoughtful', color: '#FFB5C0' },
    { emoji: '😤', label: 'Determined', color: '#FFC59B' },
    { emoji: '😰', label: 'Anxious', color: '#FF9B9B' },
    { emoji: '😴', label: 'Tired', color: '#D5CDB8' },
    { emoji: '🥳', label: 'Excited', color: '#FFE5D9' },
    { emoji: '😔', label: 'Down', color: '#9B8AA3' },
  ];

  // Feelings checkboxes for weekly check-in
  const feelingsOptions = [
    'Proud of myself', 'Overwhelmed', 'Motivated', 'Burnt out',
    'Focused', 'Distracted', 'Confident', 'Anxious',
    'Energized', 'Exhausted', 'Grateful', 'Frustrated',
  ];

  // Toggle feeling selection
  const toggleFeeling = (feeling) => {
    if (selectedFeelings.includes(feeling)) {
      setSelectedFeelings(selectedFeelings.filter(f => f !== feeling));
    } else {
      setSelectedFeelings([...selectedFeelings, feeling]);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFCF6] p-6">
      {/* Wider container for generous writing space - ADHD friendly! */}
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#2D3436] mb-2">Your Journal</h1>
          <p className="text-[#7A8A7D]">A safe space for reflection, growth, and dreams ✨</p>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            TABS
            ═══════════════════════════════════════════════════════════════ */}
        <div className="mb-8">
          <Card>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab('daily')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'daily'
                    ? 'bg-gradient-to-r from-[#FFE5D9] to-[#FFE5E8] text-[#FFB5C0] shadow-md'
                    : 'bg-[#F8F6ED] text-[#7A8A7D] hover:bg-white'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Daily Reflection
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'weekly'
                    ? 'bg-gradient-to-r from-[#E6E3F5] to-[#D5F4E6] text-[#C5A3FF] shadow-md'
                    : 'bg-[#F8F6ED] text-[#7A8A7D] hover:bg-white'
                }`}
              >
                <Calendar className="w-5 h-5" />
                Weekly Check-In
              </button>
              <button
                onClick={() => setActiveTab('dreams')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'dreams'
                    ? 'bg-gradient-to-r from-[#E6E3F5] to-[#C5E3F6] text-[#9B8AA3] shadow-md'
                    : 'bg-[#F8F6ED] text-[#7A8A7D] hover:bg-white'
                }`}
              >
                <Moon className="w-5 h-5" />
                Dream Journal
              </button>
            </div>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CONTENT SECTIONS
            ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          
          {/* DAILY REFLECTION */}
          {activeTab === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Today's Entry */}
              <Card className="bg-gradient-to-br from-[#FFE5D9] to-white">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#2D3436]">Today's Reflection</h2>
                  <Badge variant="info">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Badge>
                </div>

                {/* Mood Selector */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#2D3436] mb-4">How are you feeling today?</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.label}
                        onClick={() => setSelectedMood(mood.label)}
                        className={`p-4 rounded-2xl transition-all ${
                          selectedMood === mood.label
                            ? 'bg-white shadow-lg scale-105 ring-2'
                            : 'bg-white/50 hover:bg-white hover:shadow-md'
                        }`}
                        style={{
                          ringColor: selectedMood === mood.label ? mood.color : 'transparent'
                        }}
                      >
                        <div className="text-4xl mb-2">{mood.emoji}</div>
                        <div className="text-sm font-semibold text-[#7A8A7D]">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reflection Prompts - BIGGER FOR GENEROUS WRITING SPACE */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#7A8A7D] mb-2">
                      🌟 What went well today?
                    </label>
                    <TextArea 
                      placeholder="Celebrate your wins, big or small..."
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#7A8A7D] mb-2">
                      💭 What challenged you?
                    </label>
                    <TextArea 
                      placeholder="It's okay to acknowledge struggles..."
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#7A8A7D] mb-2">
                      📚 What did you learn?
                    </label>
                    <TextArea 
                      placeholder="Knowledge, insights, or lessons..."
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#7A8A7D] mb-2">
                      🎯 Tomorrow's intention?
                    </label>
                    <TextArea 
                      placeholder="Set your focus for tomorrow..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button icon={<Sparkles className="w-5 h-5" />}>
                    Save Reflection
                  </Button>
                </div>
              </Card>

              {/* Past Entries */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#2D3436]">Past Reflections</h2>
                {journal.daily.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{entry.mood}</div>
                          <div>
                            <h3 className="font-bold text-[#2D3436]">{formatDate(entry.date)}</h3>
                            <p className="text-sm text-[#7A8A7D]">Daily Reflection</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-bold text-[#80D6D6] mb-1">🌟 What went well:</p>
                          <p className="text-[#2D3436]">{entry.wentWell}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-bold text-[#FFB5C0] mb-1">💭 Challenges:</p>
                          <p className="text-[#2D3436]">{entry.challenges}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-bold text-[#C5A3FF] mb-1">📚 Learned:</p>
                          <p className="text-[#2D3436]">{entry.learned}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* WEEKLY CHECK-IN */}
          {activeTab === 'weekly' && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* This Week's Check-In */}
              <Card className="bg-gradient-to-br from-[#E6E3F5] to-white">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#2D3436]">This Week's Check-In</h2>
                  <Badge variant="success">Week of Nov 9</Badge>
                </div>

                {/* Mood Calendar */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#2D3436] mb-4">This week's mood:</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div
                        key={day}
                        className="bg-white rounded-xl p-3 text-center"
                      >
                        <div className="text-xs font-semibold text-[#7A8A7D] mb-2">{day}</div>
                        <div className="text-3xl cursor-pointer hover:scale-110 transition-transform">
                          {index < 4 ? '😊' : '⚪'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#9B8AA3] mt-2 text-center">Click to add your daily mood</p>
                </div>

                {/* Feelings Checkboxes */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#2D3436] mb-4">How have you been feeling?</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {feelingsOptions.map((feeling) => (
                      <label
                        key={feeling}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          selectedFeelings.includes(feeling)
                            ? 'bg-[#E9ECEF] border-2 border-[#C5B9E5]'
                            : 'bg-white border-2 border-[#E5E5E5] hover:bg-[#F8F6ED]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFeelings.includes(feeling)}
                          onChange={() => toggleFeeling(feeling)}
                          className="w-5 h-5 text-[#C5B9E5] rounded focus:ring-[#C5B9E5]"
                        />
                        <span className={`text-sm font-semibold ${
                          selectedFeelings.includes(feeling) ? 'text-[#8B7AA3]' : 'text-[#7A8A7D]'
                        }`}>
                          {feeling}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Weekly Prompts */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#7A8A7D] mb-2">
                      🏆 Biggest win this week?
                    </label>
                    <TextArea 
                      placeholder="What are you most proud of?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#7A8A7D] mb-2">
                      🌱 What did you learn about yourself?
                    </label>
                    <TextArea 
                      placeholder="Growth, patterns, insights..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#7A8A7D] mb-2">
                      🔄 What needs to change next week?
                    </label>
                    <TextArea 
                      placeholder="Adjustments, new strategies..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button icon={<Heart className="w-5 h-5" />}>
                    Save Check-In
                  </Button>
                </div>
              </Card>

              {/* Past Check-Ins */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#2D3436]">Past Check-Ins</h2>
                {journal.weekly.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-all">
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-[#2D3436]">{entry.week}</h3>
                          <div className="flex gap-1">
                            {entry.moodCalendar.map((mood, i) => (
                              <span key={i} className="text-lg">{mood}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-[#7A8A7D]">Weekly Reflection</p>
                      </div>

                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {entry.feelings.map((feeling, i) => (
                            <Badge key={i} variant="default">{feeling}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-bold text-[#C5A3FF] mb-1">🏆 Biggest win:</p>
                          <p className="text-[#2D3436]">{entry.biggestWin}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-bold text-[#80D6D6] mb-1">🌱 Learned:</p>
                          <p className="text-[#2D3436]">{entry.learned}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* DREAM JOURNAL */}
          {activeTab === 'dreams' && (
            <motion.div
              key="dreams"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* New Dream Entry */}
              <Card className="bg-gradient-to-br from-[#E6E3F5] via-[#C5E3F6] to-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Moon className="w-8 h-8 text-[#9B8AA3]" />
                    <h2 className="text-2xl font-bold text-[#2D3436]">Dream Journal</h2>
                  </div>
                  <Badge variant="info">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#7A8A7D] mb-2">
                      🌙 Describe your dream
                    </label>
                    <TextArea 
                      placeholder="What did you dream about? Capture every detail you remember..."
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#7A8A7D] mb-2">
                      💭 How did it make you feel?
                    </label>
                    <TextArea 
                      placeholder="Emotions, sensations, overall vibe..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#7A8A7D] mb-2">
                      ✨ Any insights or meanings?
                    </label>
                    <TextArea 
                      placeholder="What do you think it means? Any connections to your life?"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="ghost">Save Draft</Button>
                  <Button 
                    icon={<Star className="w-5 h-5" />}
                    className="bg-gradient-to-r from-[#9B8AA3] to-[#C5A3FF]"
                  >
                    Save Forever ✨
                  </Button>
                </div>
              </Card>

              {/* Past Dreams */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#2D3436]">Your Dream Archive</h2>
                {journal.dreams.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-all bg-gradient-to-br from-white to-[#E6E3F5]/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Moon className="w-6 h-6 text-[#9B8AA3]" />
                          <div>
                            <h3 className="font-bold text-[#2D3436]">{formatDate(entry.date)}</h3>
                            <p className="text-sm text-[#7A8A7D]">Dream Entry</p>
                          </div>
                        </div>
                        <Star className="w-5 h-5 text-[#FFB5C0]" fill="#FFB5C0" />
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-bold text-[#9B8AA3] mb-1">🌙 The Dream:</p>
                          <p className="text-[#2D3436] leading-relaxed">{entry.description}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-bold text-[#C5A3FF] mb-1">💭 Feelings:</p>
                          <p className="text-[#2D3436]">{entry.feelings}</p>
                        </div>
                        
                        {entry.insights && (
                          <div>
                            <p className="text-sm font-bold text-[#80D6D6] mb-1">✨ Insights:</p>
                            <p className="text-[#2D3436]">{entry.insights}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
