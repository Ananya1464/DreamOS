import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Play, HelpCircle, Calculator, Save } from 'lucide-react';
import { Card, Button, Badge, Modal } from './UI';
import INITIAL_DATA from '../data/initialData';
import StudySessionModal from './StudySessionModal';
import { getTodaySchedule, getCurrentBlock, getScheduleStats, initializeTodaySchedule } from '../utils/realTimeSchedule';
import { getSimpleAnswer, getStepByStep } from '../utils/wolframService';
import { addXP } from '../utils/xpSystem';
import { loadSchedule } from '../utils/storage';

// ═══════════════════════════════════════════════════════════════
// SCHEDULE COMPONENT - VISUAL TIME BLOCKS 📅 - NOW WITH REAL-TIME! ⏱️
// ═══════════════════════════════════════════════════════════════

// Current Time Indicator - THE #1 ADHD FEATURE
function CurrentTimeIndicator() {
  const [position, setPosition] = useState(0);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Calculate position (6 AM = 0%, 11 PM = 100%)
      const minutesSince6AM = (hours - 6) * 60 + minutes;
      const totalMinutes = 17 * 60; // 6 AM to 11 PM (17 hours)
      const percentage = (minutesSince6AM / totalMinutes) * 100;
      
      setPosition(Math.max(0, Math.min(100, percentage)));
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      }));
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Only show if within schedule hours (6 AM - 11 PM)
  const now = new Date();
  const currentHour = now.getHours();
  if (currentHour < 6 || currentHour >= 23) return null;

  const pixelPosition = (position / 100) * 1440; // 1440px = 18 hours * 80px

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute',
        top: `${pixelPosition}px`,
        left: 0,
        right: 0,
        zIndex: 20,
        pointerEvents: 'none'
      }}
    >
      {/* Red Line */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '3px',
          background: '#F5A5A5',
          boxShadow: '0 0 8px rgba(245, 165, 165, 0.6)'
        }}
      />
      
      {/* Pulsing Dot */}
      <motion.div
        style={{
          position: 'absolute',
          left: '-8px',
          top: '-7px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#F5A5A5',
          border: '3px solid white',
          boxShadow: '0 0 12px rgba(245, 165, 165, 0.8)'
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Time Label */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{
          position: 'absolute',
          left: '20px',
          top: '-12px',
          background: '#F5A5A5',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(245, 165, 165, 0.4)',
          whiteSpace: 'nowrap'
        }}
      >
        📍 YOU ARE HERE • {currentTime}
      </motion.div>
    </motion.div>
  );
}

export default function Schedule() {
  // const { schedule } = INITIAL_DATA; // OLD - replaced with todaySchedule
  const [view, setView] = useState('day'); // 'day' or 'week'
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [currentBlockData, setCurrentBlockData] = useState(null);
  
  // Homework Helper state
  const [showHomeworkHelper, setShowHomeworkHelper] = useState(false);
  const [homeworkQuestion, setHomeworkQuestion] = useState('');
  const [homeworkAnswer, setHomeworkAnswer] = useState(null);
  const [homeworkLoading, setHomeworkLoading] = useState(false);
  
  // Date navigation state
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get real-time schedule data
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [scheduleStats, setScheduleStats] = useState(null);
  
  // Load schedule data for selected date
  useEffect(() => {
    const dateKey = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // Load all schedule data
    const allSchedules = loadSchedule() || {};
    const dayEventsRaw = allSchedules[dateKey] || [];
    // Ensure dayEvents is always an array
    const dayEvents = Array.isArray(dayEventsRaw) ? dayEventsRaw : [];
    
    // Convert to schedule format (merge with today's schedule if it's today)
    const isToday = dateKey === new Date().toISOString().split('T')[0];
    
    if (isToday) {
      // For today, use real-time schedule + Luna events
      const realTimeSchedule = getTodaySchedule() || initializeTodaySchedule();
      const lunaEvents = dayEvents.map(event => ({
        id: event.id,
        time: event.time,
        activity: event.activity,
        duration: event.duration,
        type: event.type,
        color: event.type === 'study' ? '#C5E1FF' : event.type === 'break' ? '#FFE5D9' : '#E8F5E9',
        createdBy: event.createdBy,
        completed: event.completed
      }));
      
      // Merge real-time blocks with Luna events
      const existingBlocks = Array.isArray(realTimeSchedule?.blocks) ? realTimeSchedule.blocks : [];
      const mergedSchedule = {
        date: dateKey,
        blocks: [...existingBlocks, ...lunaEvents]
      };
      
      setTodaySchedule(mergedSchedule);
      setScheduleStats(getScheduleStats(mergedSchedule));
    } else {
      // For other dates, show only Luna-created events
      const lunaSchedule = {
        date: dateKey,
        blocks: dayEvents.map(event => ({
          id: event.id,
          time: event.time,
          activity: event.activity,
          duration: event.duration,
          type: event.type,
          color: event.type === 'study' ? '#C5E1FF' : event.type === 'break' ? '#FFE5D9' : '#E8F5E9',
          createdBy: event.createdBy,
          completed: event.completed
        }))
      };
      
      setTodaySchedule(lunaSchedule);
      setScheduleStats(null); // No stats for future dates
    }
  }, [selectedDate]);
  
  // Date navigation functions
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  // Format selected date for display
  const formatDisplayDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Get current/next block
  useEffect(() => {
    const updateCurrentBlock = () => {
      const current = getCurrentBlock();
      setCurrentBlockData(current);
    };
    
    updateCurrentBlock();
    const interval = setInterval(updateCurrentBlock, 10000); // Update every 10s
    
    return () => clearInterval(interval);
  }, []);

  // Get schedule blocks (handle empty schedule)
  const scheduleBlocks = todaySchedule?.blocks || [];
  
  // Calculate stats for today - map real stats to expected format
  const defaultStats = {
    totalHours: scheduleBlocks.reduce((sum, b) => sum + b.duration, 0) / 60,
    studyHours: scheduleBlocks.filter(b => b.type === 'study').reduce((sum, b) => sum + b.duration, 0) / 60,
    breaks: scheduleBlocks.filter(b => b.type === 'break').length,
    completion: 0,
  };
  
  // Map getScheduleStats response to our expected format
  const todayStats = scheduleStats ? {
    totalHours: (scheduleStats.totalPlannedTime || 0) / 60,
    studyHours: (scheduleStats.actualStudyTime || 0) / 60,
    breaks: scheduleBlocks.filter(b => b.type === 'break').length,
    completion: scheduleStats.completionRate || 0,
  } : defaultStats;

  // Time slots (6 AM to 11 PM)
  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = 6 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Get block position and height
  const getBlockStyle = (block) => {
    if (!block.time || typeof block.time !== 'string') {
      // Default to 10:00 AM if time is missing
      return { top: '240px', height: '80px' }; // 4 hours from 6 AM = 240px, 1 hour height
    }
    const [hour, minute] = block.time.split(':').map(Number);
    const startMinutes = (hour - 6) * 60 + minute;
    const top = (startMinutes / 60) * 80; // 80px per hour
    const height = (block.duration / 60) * 80;
    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div className="min-h-screen bg-[#FDFCF6] p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ═══════════════════════════════════════════════════════════════
            HEADER & CONTROLS
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[#2D3436] mb-2">Your Schedule</h1>
              <p className="text-[#7A8A7D]">Visual time-blocked planning 🗓️</p>
            </div>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex bg-white rounded-2xl p-1 shadow-sm border-2 border-[#E5E5E5]">
                <button
                  onClick={() => setView('day')}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                    view === 'day'
                      ? 'bg-[#C5B9E5] text-white border-2 border-[#B5A8D5]'
                      : 'text-[#9B8AA3] border-2 border-transparent'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                    view === 'week'
                      ? 'bg-[#C5B9E5] text-white border-2 border-[#B5A8D5]'
                      : 'text-[#9B8AA3] border-2 border-transparent'
                  }`}
                >
                  Week
                </button>
              </div>
              
              {/* Homework Helper Button - NEW! */}
              <Button 
                icon={<HelpCircle className="w-5 h-5" />} 
                onClick={() => setShowHomeworkHelper(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg"
              >
                Help Me
              </Button>
              
              {/* Add Block Button */}
              <Button icon={<Plus className="w-5 h-5" />} onClick={() => setShowAddModal(true)}>
                Add Block
              </Button>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={goToPreviousDay}
                className="p-2 rounded-xl hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#9B8AA3]" />
              </button>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#C5A3FF]" />
                <span className="text-xl font-semibold text-[#2D3436]">
                  {formatDisplayDate(selectedDate)}
                </span>
              </div>
              <button 
                onClick={goToNextDay}
                className="p-2 rounded-xl hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#9B8AA3]" />
              </button>
            </div>
            <Button variant="ghost" size="sm" onClick={goToToday}>Today</Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* ═══════════════════════════════════════════════════════════════
              STATS SIDEBAR
              ═══════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card>
              <h3 className="text-lg font-bold text-[#2D3436] mb-4">Today's Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[#7A8A7D]">Total Study Hours</span>
                    <span className="font-bold text-[#C5A3FF]">{(todayStats?.studyHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="w-full h-2 bg-[#F8F6ED] rounded-full overflow-hidden border border-[#E5E5E5]">
                    <div
                      className="h-full bg-[#C5B9E5]"
                      style={{ width: `${((todayStats?.studyHours || 0) / 8) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[#7A8A7D]">Breaks Taken</span>
                    <span className="font-bold text-[#80D6D6]">{todayStats?.breaks || 0}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[#7A8A7D]">Completion Rate</span>
                    <span className="font-bold text-[#FFB5C0]">{todayStats?.completion || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F8F6ED] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FFB5C0] to-[#FFE5E8]"
                      style={{ width: `${todayStats?.completion || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#F8F6ED]">
                <h4 className="text-sm font-bold text-[#2D3436] mb-3">Activity Types</h4>
                <div className="space-y-2">
                  {[
                    { type: 'Study', color: '#C5A3FF', count: 4 },
                    { type: 'Break', color: '#D5F4E6', count: 3 },
                    { type: 'GRE', color: '#C5E3F6', count: 2 },
                    { type: 'Personal', color: '#FFE5D9', count: 3 },
                  ].map((activity) => (
                    <div key={activity.type} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: activity.color }}
                      />
                      <span className="text-sm text-[#7A8A7D] flex-1">{activity.type}</span>
                      <span className="text-sm font-semibold text-[#2D3436]">{activity.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════════
              DAY VIEW - VISUAL TIME BLOCKS
              ═══════════════════════════════════════════════════════════════ */}
          {view === 'day' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:col-span-3"
            >
              <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-[#F8F6ED]">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#C5A3FF]" />
                    <h3 className="text-lg font-bold text-[#2D3436]">Time Blocks</h3>
                    <Badge variant="default">{scheduleBlocks.length} blocks</Badge>
                  </div>
                </div>

                <div className="relative p-6">
                  {/* Time Labels */}
                  <div className="absolute left-0 top-6 w-20 space-y-[60px]">
                    {timeSlots.map((time) => (
                      <div key={time} className="text-sm text-[#9B8AA3] text-right pr-4">
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Time Grid & Blocks */}
                  <div className="ml-24 relative" style={{ height: '1440px' }}>
                    {/* Grid Lines */}
                    {timeSlots.map((time, index) => (
                      <div
                        key={time}
                        className="absolute left-0 right-0 border-t border-[#F8F6ED]"
                        style={{ top: `${index * 80}px` }}
                      />
                    ))}

                    {/* ⚡ CURRENT TIME INDICATOR - CRITICAL ADHD FEATURE */}
                    <CurrentTimeIndicator />

                    {/* Activity Blocks */}
                    {scheduleBlocks.map((block, index) => {
                      const style = getBlockStyle(block);
                      const isCurrentBlock = currentBlockData && 
                        currentBlockData.current && 
                        currentBlockData.current.id === block.id;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ 
                            scale: 1.02,
                            zIndex: 10,
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                          }}
                          className={`absolute left-0 right-0 mx-2 rounded-2xl p-3 shadow-sm transition-all group ${
                            isCurrentBlock ? 'ring-4 ring-[#B5A3E5] ring-opacity-50 animate-pulse' : ''
                          }`}
                          style={{
                            ...style,
                            backgroundColor: block.color,
                            minHeight: '60px',
                          }}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-bold text-[#2D3436]">
                              {block.time}
                            </span>
                            <div className="flex items-center gap-1">
                              {block.createdBy === 'luna' && (
                                <Badge 
                                  size="sm" 
                                  className="bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white text-[10px] px-1.5 py-0.5"
                                  title="AI-scheduled by Luna"
                                >
                                  🤖 Luna
                                </Badge>
                              )}
                              <Badge size="sm" variant="default">
                                {block.duration}m
                              </Badge>
                            </div>
                          </div>
                          <h4 className="font-semibold text-[#2D3436] mb-1">
                            {block.activity}
                          </h4>
                          {block.subject && (
                            <span className="text-xs text-[#7A8A7D]">
                              {block.subject} {block.topic && `• ${block.topic}`}
                            </span>
                          )}
                          
                          {/* Current Block Indicator */}
                          {isCurrentBlock && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs font-bold text-[#B5A3E5] animate-pulse">
                                📍 HAPPENING NOW
                              </span>
                            </div>
                          )}
                          
                          {/* Start Session Button for Study Blocks */}
                          {block.type === 'study' && (
                            <motion.button
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1, scale: 1.05 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBlock(block);
                                setShowSessionModal(true);
                              }}
                              className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white text-xs font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
                            >
                              <Play className="w-3 h-3" />
                              Start
                            </motion.button>
                          )}
                          
                          {/* Hover Mini-Menu */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            className="absolute bottom-2 right-2 hidden group-hover:flex gap-1 bg-white rounded-lg p-1 shadow-lg border border-[#E5E5E5]"
                          >
                            <button 
                              className="px-2 py-1 text-xs font-semibold text-[#7DD3C0] hover:bg-[#F5F1E8] rounded" 
                              title="Mark Complete"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Mark block complete
                              }}
                            >
                              ✓
                            </button>
                            <button 
                              className="px-2 py-1 text-xs font-semibold text-[#FFAA8F] hover:bg-[#F5F1E8] rounded" 
                              title="Reschedule"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Reschedule block
                              }}
                            >
                              ↻
                            </button>
                            <button 
                              className="px-2 py-1 text-xs font-semibold text-[#B5A3E5] hover:bg-[#F5F1E8] rounded" 
                              title="Notes"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBlock(block);
                              }}
                            >
                              📝
                            </button>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              WEEK VIEW - MINI TIME BLOCKS
              ═══════════════════════════════════════════════════════════════ */}
          {view === 'week' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:col-span-3"
            >
              <Card>
                <div className="grid grid-cols-7 gap-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                    <div key={day} className="space-y-2">
                      <div className="text-center">
                        <div className="text-xs text-[#9B8AA3] mb-1">{day}</div>
                        <div className={`text-lg font-bold ${dayIndex === 3 ? 'text-[#C5A3FF]' : 'text-[#2D3436]'}`}>
                          {11 + dayIndex}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {/* Mock mini blocks for each day */}
                        {[1, 2, 3, 4, 5].map((block) => (
                          <div
                            key={block}
                            className="h-12 rounded-lg"
                            style={{
                              backgroundColor: dayIndex === 3
                                ? scheduleBlocks[block - 1]?.color
                                : '#F8F6ED',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ADD TIME BLOCK MODAL
            ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showAddModal && (
            <Modal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              title="Add Time Block"
              size="md"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                    Activity Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., VLSI Study Session"
                    className="w-full px-4 py-3 border-2 border-[#F8F6ED] rounded-2xl focus:border-[#C5A3FF] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 border-2 border-[#F8F6ED] rounded-2xl focus:border-[#C5A3FF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      placeholder="90"
                      className="w-full px-4 py-3 border-2 border-[#F8F6ED] rounded-2xl focus:border-[#C5A3FF] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                    Activity Type
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-[#F8F6ED] rounded-2xl focus:border-[#C5A3FF] focus:outline-none">
                    <option value="study">📚 Study</option>
                    <option value="gre">🎓 GRE</option>
                    <option value="break">☕ Break</option>
                    <option value="personal">✨ Personal</option>
                    <option value="meal">🍽️ Meal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2D3436] mb-3">
                    Color
                  </label>
                  <div className="flex gap-3">
                    {['#C5A3FF', '#80D6D6', '#FFB5C0', '#FFFACD', '#D5F4E6', '#FFE5D9'].map((color) => (
                      <button
                        key={color}
                        className="w-10 h-10 rounded-xl border-2 border-[#F8F6ED] hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="secondary" fullWidth onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button fullWidth onClick={() => setShowAddModal(false)}>
                    Add Block
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════════
            BLOCK DETAILS MODAL
            ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {selectedBlock && (
            <Modal
              isOpen={!!selectedBlock}
              onClose={() => setSelectedBlock(null)}
              title="Activity Details"
              size="sm"
            >
              <div className="space-y-4">
                <div
                  className="w-full h-24 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: selectedBlock.color }}
                >
                  <h3 className="text-2xl font-bold text-[#2D3436]">
                    {selectedBlock.activity}
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#7A8A7D]">Time:</span>
                    <span className="font-semibold">{selectedBlock.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A8A7D]">Duration:</span>
                    <span className="font-semibold">{selectedBlock.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A8A7D]">Type:</span>
                    <Badge variant="default">{selectedBlock.type}</Badge>
                  </div>
                  {selectedBlock.subject && (
                    <div className="flex justify-between">
                      <span className="text-[#7A8A7D]">Subject:</span>
                      <span className="font-semibold">{selectedBlock.subject}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="danger" fullWidth size="sm">
                    Delete
                  </Button>
                  <Button fullWidth size="sm">
                    Mark Complete
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>
        
        {/* ═══════════════════════════════════════════════════════════════
            STUDY SESSION MODAL - REAL-TIME TRACKING! ⏱️
            ═══════════════════════════════════════════════════════════════ */}
        {showSessionModal && selectedBlock && (
          <StudySessionModal
            block={selectedBlock}
            onClose={() => {
              setShowSessionModal(false);
              setSelectedBlock(null);
            }}
            onComplete={(sessionData) => {
              console.log('✅ Session completed:', sessionData);
              // Refresh schedule stats
              const today = new Date().toISOString().split('T')[0];
              setScheduleStats(getScheduleStats(today));
            }}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════
            HOMEWORK HELPER MODAL - WOLFRAM-POWERED! 🧮
            ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showHomeworkHelper && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHomeworkHelper(false)}
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
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Homework Helper</h2>
                        <p className="text-sm text-gray-600">Stuck on a problem? Get help from Wolfram!</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowHomeworkHelper(false);
                        setHomeworkQuestion('');
                        setHomeworkAnswer(null);
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Input */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        What problem are you stuck on?
                      </label>
                      <textarea
                        value={homeworkQuestion}
                        onChange={(e) => setHomeworkQuestion(e.target.value)}
                        placeholder="e.g., solve x^2 + 5x + 6 = 0  OR  integrate x^3  OR  explain quadratic formula"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none min-h-[100px]"
                        disabled={homeworkLoading}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={async () => {
                          if (!homeworkQuestion.trim()) return;
                          
                          setHomeworkLoading(true);
                          try {
                            // Try step-by-step first, fallback to simple
                            let result = await getStepByStep(homeworkQuestion);
                            if (!result.success) {
                              result = await getSimpleAnswer(homeworkQuestion);
                            }
                            setHomeworkAnswer(result);
                            
                            if (result.success) {
                              addXP(10, 'Used Homework Helper');
                            }
                          } catch (error) {
                            console.error('Homework helper error:', error);
                            setHomeworkAnswer({ success: false, error: 'Failed to get help' });
                          } finally {
                            setHomeworkLoading(false);
                          }
                        }}
                        disabled={!homeworkQuestion.trim() || homeworkLoading}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg"
                      >
                        {homeworkLoading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                              className="mr-2"
                            >
                              <Calculator className="w-4 h-4" />
                            </motion.div>
                            Getting Help...
                          </>
                        ) : (
                          <>
                            <Calculator className="w-4 h-4 mr-2" />
                            Get Help from Wolfram
                          </>
                        )}
                      </Button>

                      {homeworkAnswer && homeworkAnswer.success && (
                        <Button
                          onClick={() => {
                            // Save to journal/notes
                            const notes = JSON.parse(localStorage.getItem('homework_notes') || '[]');
                            notes.unshift({
                              id: Date.now(),
                              question: homeworkQuestion,
                              timestamp: new Date().toISOString(),
                              saved: true
                            });
                            localStorage.setItem('homework_notes', JSON.stringify(notes.slice(0, 50)));
                            
                            addXP(5, 'Saved homework solution');
                            alert('✅ Solution saved to your notes!');
                          }}
                          variant="outline"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save to Notes
                        </Button>
                      )}
                    </div>

                    {/* Result */}
                    <AnimatePresence>
                      {homeworkAnswer && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {homeworkAnswer.success ? (
                            <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                              <div className="flex items-center gap-2 mb-4">
                                <Calculator className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-green-800">Solution:</span>
                              </div>

                              {/* Step-by-step solution */}
                              {homeworkAnswer.solution && (
                                <div className="mb-4">
                                  <h4 className="font-semibold text-green-700 mb-2">Answer:</h4>
                                  <div className="p-4 bg-white rounded-lg">
                                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                      {homeworkAnswer.solution}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {homeworkAnswer.steps && (
                                <div className="mb-4">
                                  <h4 className="font-semibold text-blue-700 mb-2">Steps:</h4>
                                  <div className="p-4 bg-white rounded-lg">
                                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                      {homeworkAnswer.steps}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {/* Simple answer image */}
                              {homeworkAnswer.imageUrl && (
                                <img
                                  src={homeworkAnswer.imageUrl}
                                  alt="Solution"
                                  className="w-full rounded-lg shadow-md"
                                  onError={() => setHomeworkAnswer({ ...homeworkAnswer, success: false, error: 'Failed to load image' })}
                                />
                              )}

                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  💡 <strong>Tip:</strong> Make sure you understand each step. Try solving a similar problem on your own!
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                              <p className="text-red-800 text-sm">{homeworkAnswer.error}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Quick Examples */}
                    {!homeworkAnswer && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-700 mb-2">💡 Try asking:</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            'solve 2x + 5 = 13',
                            'integrate sin(x)',
                            'derivative of x^2',
                            'factor x^2 - 9'
                          ].map((example) => (
                            <button
                              key={example}
                              onClick={() => setHomeworkQuestion(example)}
                              className="text-xs px-3 py-1.5 bg-white rounded-full hover:bg-gray-100 border border-gray-200 transition-colors"
                            >
                              {example}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t-2 border-gray-100 text-center">
                    <p className="text-xs text-gray-500">
                      Powered by <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Wolfram|Alpha</span>
                    </p>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
