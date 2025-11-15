import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Calendar, BookOpen, AlertCircle, Key, Loader2, Calculator, TrendingUp, Brain } from 'lucide-react';
import { Card, Button, Badge } from './UI';
import INITIAL_DATA from '../data/initialData';
import { loadSubjects, loadGREProgress, loadUser, loadFromStorage, saveToStorage, addScheduleEvent } from '../utils/storage';
import { 
  initializeAI, 
  isAIReady, 
  chatWithLuna, 
  generateDailyPlan,
  getQuickSuggestion,
  getProgressReport,
  setApiKey 
} from '../utils/ai';
import { parseActions, stripActions } from '../utils/intentParser';
import ActionConfirmation from './ActionConfirmation';
import { getSimpleAnswer, getStepByStep, explainConcept } from '../utils/wolframService';
import { detectSchedulingIntent, parseScheduleRequest, formatUserFriendlyDate, formatUserFriendlyTime, formatDateKey } from '../utils/scheduling';

// Helper function to generate unique message IDs
const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ═══════════════════════════════════════════════════════════════
// AGENT COMPONENT - AI CHAT COMPANION 🤖
// Now powered by REAL AI with REAL-TIME data! ✨
// ═══════════════════════════════════════════════════════════════
export default function Agent() {
  const { agent, savedContent } = INITIAL_DATA;
  
  // Load REAL data from localStorage (updates when changed)
  const [subjects, setSubjects] = useState(() => loadSubjects() || INITIAL_DATA.subjects);
  const [greData, setGreData] = useState(() => loadGREProgress() || INITIAL_DATA.gre);
  const [userData, setUserData] = useState(() => loadUser() || INITIAL_DATA.user);
  
  // Start with empty messages - no static content
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [pendingActions, setPendingActions] = useState(null);
  const [activeMode, setActiveMode] = useState('Morning Planner');
  const [wolframLoading, setWolframLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize AI on mount
  useEffect(() => {
    const ready = initializeAI();
    setAiReady(ready);
  }, []);
  
  // Refresh data periodically to stay in sync
  useEffect(() => {
    const refreshData = () => {
      const newSubjects = loadSubjects();
      const newGre = loadGREProgress();
      const newUser = loadUser();
      
      if (newSubjects) setSubjects(newSubjects);
      if (newGre) setGreData(newGre);
      if (newUser) setUserData(newUser);
    };
    
    // Refresh every 5 seconds to catch changes
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get nearest exam with REAL-TIME calculation
  const getDaysUntil = (dateString) => {
    const target = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  };

  const nearestExam = Object.entries(subjects || {})
    .filter(([key, data]) => data.status === 'active' && data.examDate)
    .map(([key, data]) => ({ name: data.name, daysLeft: getDaysUntil(data.examDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)[0] || null;

  // Count topics due for revision
  const topicsDueForRevision = Object.values(subjects || {}).reduce((count, subject) => {
    if (!subject.topics) return count;
    return count + subject.topics.filter(t => 
      t.nextRevision && getDaysUntil(t.nextRevision) <= 0
    ).length;
  }, 0);

  // Count unwatched saved content
  const unwatchedContent = 
    savedContent.instagram.filter(i => !i.watched).length +
    savedContent.youtube.filter(i => !i.watched).length;

  // Quick action buttons
  const quickActions = [
    { text: "What's next?", icon: "🎯", action: "suggestion" },
    { text: "Daily plan", icon: "📋", action: "daily_plan" },
    { text: "Progress report", icon: "📊", action: "progress" },
    { text: "I'm stuck", icon: "🤔", action: "chat" },
  ];

  // Handle API key submission
  const handleSetApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput);
      setAiReady(isAIReady());
      setShowApiKeyModal(false);
      setApiKeyInput('');
      
      // Add success message
      const successMsg = {
        id: messages.length + 1,
        timestamp: new Date().toISOString(),
        sender: 'agent',
        message: "✅ API key set! I'm now powered by Google Gemini AI. Ask me anything! 🧠✨"
      };
      setMessages([...messages, successMsg]);
    }
  };

  // Handle quick actions
  const handleQuickAction = async (action, text) => {
    setLoading(true);
    
    try {
      // Use REAL-TIME data from state
      const contextData = {
        subjects,
        gre: greData,
        user: userData,
        schedule: INITIAL_DATA.schedule
      };
      
      let response = '';
      
      switch (action) {
        case 'suggestion':
          response = await getQuickSuggestion(contextData);
          break;
        case 'daily_plan':
          response = await generateDailyPlan(contextData);
          break;
        case 'progress':
          response = await getProgressReport(contextData);
          break;
        default:
          // For "I'm stuck", just use chat
          const userMsg = {
            id: messages.length + 1,
            timestamp: new Date().toISOString(),
            sender: 'user',
            message: text
          };
          setMessages(prev => [...prev, userMsg]);
          
          response = await chatWithLuna(text, contextData, messages);
      }
      
      const agentMessage = {
        id: messages.length + 2,
        timestamp: new Date().toISOString(),
        sender: 'agent',
        message: response
      };
      
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Quick action error:', error);
      const errorMsg = {
        id: messages.length + 1,
        timestamp: new Date().toISOString(),
        sender: 'agent',
        message: "Oops! Something went wrong. Try again? 🤔"
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Detect if message is math/science related
  const detectMathScience = (text) => {
    const mathKeywords = /\b(solve|integrate|derivative|differentiate|calculate|compute|simplify|factor|expand|plot|graph|formula|equation|theorem|proof)\b/i;
    const hasEquation = /[x-z]\s*[\^+\-*/=]\s*[\d\w]/i.test(text) || /\d+x/i.test(text);
    const hasOperators = /[\^²³∫∑∏√]/i.test(text);
    
    return mathKeywords.test(text) || hasEquation || hasOperators;
  };

  // Query Wolfram for mathematical/scientific help
  const queryWolfram = async (query, mode = 'simple') => {
    setWolframLoading(true);
    try {
      let result;
      if (mode === 'stepbystep') {
        result = await getStepByStep(query);
      } else if (mode === 'explain') {
        result = await explainConcept(query);
      } else {
        result = await getSimpleAnswer(query);
      }
      return result;
    } catch (error) {
      console.error('Wolfram query error:', error);
      return { success: false, error: 'Failed to query Wolfram' };
    } finally {
      setWolframLoading(false);
    }
  };

  // Handle sending message with AI + Wolfram integration
  const handleSend = async () => {
    if (!input.trim()) return;
    if (loading) return;

    const userMessageText = input; // Save before clearing input

    // Add user message
    const userMessage = {
      id: generateMessageId(),
      timestamp: new Date().toISOString(),
      sender: 'user',
      message: userMessageText
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // �️ CHECK IF THIS IS A SCHEDULING REQUEST FIRST
      if (detectSchedulingIntent(userMessageText)) {
        console.log('📅 Scheduling request detected!');
        const event = parseScheduleRequest(userMessageText, new Date());
        
        if (event.success) {
          // Add event to schedule
          const dateKey = formatDateKey(event.date);
          const added = addScheduleEvent({
            date: dateKey,
            time: event.startTime,
            activity: event.activity,
            duration: event.duration,
            type: event.type,
            createdBy: 'luna'
          });
          
          if (added) {
            // Check if defaults were used
            const hasTime = userMessageText.toLowerCase().match(/\d{1,2}\s*(am|pm|:\d{2})/i);
            const hasDuration = userMessageText.toLowerCase().match(/\d+\s*(minute|minutes|min|hour|hours|hr)/i);
            
            // Create confirmation message with hints about defaults
            let confirmMsg = `✅ **Scheduled!**\n\n` +
              `📚 **${event.activity}**\n` +
              `📅 ${formatUserFriendlyDate(event.date)}\n` +
              `⏰ ${formatUserFriendlyTime(event.startTime)}`;
            
            // Add note if time was defaulted
            if (!hasTime) {
              confirmMsg += ` *(defaulted to 10 AM)*`;
            }
            
            confirmMsg += `\n⏱️ ${event.duration} minutes`;
            
            // Add note if duration was defaulted
            if (!hasDuration) {
              confirmMsg += ` *(default)*`;
            }
            
            confirmMsg += `\n\n📅 View in Schedule tab to adjust time if needed! 🤖`;
            
            const agentMessage = {
              id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString(),
              sender: 'agent',
              message: confirmMsg,
              scheduleCreated: true
            };
            
            setMessages(prev => [...prev, agentMessage]);
            setLoading(false);
            return;
          }
        } else {
          // Parsing failed - ask for clarification
          const clarifyMsg = `I want to schedule that for you! 📅\n\n` +
            `Could you clarify:\n` +
            `• What activity? (e.g., "VLSI study")\n` +
            `• What date? (e.g., "tomorrow", "Monday")\n` +
            `• What time? (e.g., "2 PM", "14:00")\n` +
            `• How long? (e.g., "90 minutes", "2 hours")\n\n` +
            `Example: *"Schedule VLSI tomorrow at 2 PM for 90 minutes"*`;
          
          const agentMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            sender: 'agent',
            message: clarifyMsg
          };
          
          setMessages(prev => [...prev, agentMessage]);
          setLoading(false);
          return;
        }
      }

      // �🔥 CHECK IF THIS IS A MATH/SCIENCE QUESTION
      const isMathScience = detectMathScience(userMessageText);
      const isProblemSolverMode = activeMode === 'Problem Solver';
      const isStudyBuddyMode = activeMode === 'Study Buddy';

      let wolframResult = null;

      // Auto-query Wolfram for math/science questions or in Problem Solver mode
      if (isMathScience || isProblemSolverMode) {
        console.log('🧮 Math/Science detected! Querying Wolfram...');
        wolframResult = await queryWolfram(userMessageText, 'simple');
      }

      // Use REAL-TIME data from state
      const contextData = {
        subjects,
        gre: greData,
        user: userData,
        schedule: INITIAL_DATA.schedule,
        mode: activeMode,
        wolframResult: wolframResult // Pass Wolfram result to Luna
      };

      // Get AI response
      const response = await chatWithLuna(userMessageText, contextData, messages);

      // Check for action proposals in response
      const detectedActions = parseActions(response);
      const cleanResponse = stripActions(response);

      const agentMessage = {
        id: generateMessageId(),
        timestamp: new Date().toISOString(),
        sender: 'agent',
        message: cleanResponse,
        wolframResult: wolframResult // Attach Wolfram result to display
      };
      
      setMessages(prev => [...prev, agentMessage]);

      // If actions detected, show confirmation UI
      if (detectedActions.length > 0) {
        setPendingActions(detectedActions);
      }

      // Save conversation to memory (with clean response)
      saveConversationToMemory(userMessageText, cleanResponse);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = {
        id: messages.length + 2,
        timestamp: new Date().toISOString(),
        sender: 'agent',
        message: "Sorry, I'm having trouble thinking right now. Try again? 🤔"
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save conversation to memory dashboard
   */
  const saveConversationToMemory = (userMsg, aiResponse) => {
    const MEMORY_KEY = 'agent_conversations';
    const conversations = loadFromStorage(MEMORY_KEY, []);

    const newConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userMessage: userMsg,
      aiResponse: aiResponse,
      metadata: {
        subject: null, // Can be extracted from message context if needed
        topic: null,
        // Future: Add sentiment analysis, difficulty level, etc.
      }
    };

    conversations.unshift(newConversation); // Add to beginning (newest first)

    // Keep only last 500 conversations to avoid storage bloat
    if (conversations.length > 500) {
      conversations.length = 500;
    }

    saveToStorage(MEMORY_KEY, conversations);
  };

  /**
   * Handle action confirmation
   */
  const handleActionConfirm = (results) => {
    // Add success message to chat
    const successCount = results.filter(r => r.result?.success).length;
    const totalCount = results.length;

    const successMessage = {
      id: messages.length + 1,
      timestamp: new Date().toISOString(),
      sender: 'system',
      message: `✅ Successfully executed ${successCount} of ${totalCount} actions!`,
      type: 'success'
    };

    setMessages(prev => [...prev, successMessage]);
    setPendingActions(null);

    // Refresh data to show updates
    setTimeout(() => {
      const newSubjects = loadSubjects();
      const newGre = loadGREProgress();
      const newUser = loadUser();
      
      if (newSubjects) setSubjects(newSubjects);
      if (newGre) setGreData(newGre);
      if (newUser) setUserData(newUser);
    }, 500);
  };

  /**
   * Handle action cancellation
   */
  const handleActionCancel = () => {
    setPendingActions(null);
    
    const cancelMessage = {
      id: messages.length + 1,
      timestamp: new Date().toISOString(),
      sender: 'system',
      message: '❌ Actions cancelled. Let me know if you need anything else!',
      type: 'info'
    };

    setMessages(prev => [...prev, cancelMessage]);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF6] p-6">
      <div className="max-w-7xl mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2D3436] mb-2">Your AI Companion</h1>
              <p className="text-[#7A8A7D]">Luna is here to guide, support, and celebrate with you 🌙</p>
            </div>
            
            {/* AI Status Indicator */}
            <div>
              {aiReady ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D5F4E6] to-[#E6F3FF]">
                  <Sparkles className="w-5 h-5 text-[#7DD3C0]" />
                  <span className="text-sm font-bold text-[#2D3436]">AI Active</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFE5E8] to-[#FFE5D9] hover:shadow-lg transition-all"
                >
                  <Key className="w-5 h-5 text-[#FFB4A4]" />
                  <span className="text-sm font-bold text-[#2D3436]">Add API Key</span>
                </button>
              )}
            </div>
          </div>
          
          {/* API Key Warning Banner */}
          {!aiReady && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#FFF9E6] to-[#FFE5E8] border-2 border-[#FFE66D]"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-[#D4A017] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#2D3436] mb-1">
                    🧠 Luna needs a brain! Connect Gemini AI
                  </p>
                  <p className="text-xs text-[#8B7355] mb-2">
                    Get a <strong>free API key</strong> from Google: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-[#B5A3E5]">makersuite.google.com</a>
                  </p>
                  <button
                    onClick={() => setShowApiKeyModal(true)}
                    className="text-xs font-bold text-[#B5A3E5] hover:text-[#9B8AA3] transition-colors"
                  >
                    → Add API Key Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ═══════════════════════════════════════════════════════════════
              LEFT SIDE - AGENT INFO PANEL (30%)
              ═══════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Agent Profile */}
            <Card>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#C5B9E5] border-2 border-[#B5A8D5] flex items-center justify-center text-5xl">
                  {agent.avatar}
                </div>
                <h2 className="text-2xl font-bold text-[#2D3436] mb-1">{agent.name}</h2>
                <p className="text-sm text-[#7A8A7D] mb-4">Your AI Study Companion</p>
                
                {/* Current Mode */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E9ECEF] border-2 border-[#D9E4E0]">
                  <Sparkles className="w-4 h-4 text-[#8B7AA3]" />
                  <span className="text-sm font-semibold text-[#8B7AA3]">{agent.mode}</span>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card>
              <h3 className="text-lg font-bold text-[#2D3436] mb-4">Quick Stats</h3>
              <div className="space-y-4">
                {nearestExam ? (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFE5E8] flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[#FF9B9B]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#7A8A7D]">Days until first exam</p>
                      <p className="text-xl font-bold text-[#FF9B9B]">{nearestExam.daysLeft} days</p>
                      <p className="text-xs text-[#9B8AA3] mt-1">{nearestExam.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E5E5E5] flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[#7A8A7D]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#7A8A7D]">No exams scheduled</p>
                      <p className="text-xs text-[#9B8AA3] mt-1">Add subjects to get started!</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFE5D9] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-[#FFB5C0]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#7A8A7D]">Topics due for revision</p>
                    <p className="text-xl font-bold text-[#FFB5C0]">{topicsDueForRevision} topics</p>
                    <p className="text-xs text-[#9B8AA3] mt-1">Review today!</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E6E3F5] flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-[#C5A3FF]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#7A8A7D]">Saved content unwatched</p>
                    <p className="text-xl font-bold text-[#C5A3FF]">{unwatchedContent} items</p>
                    <p className="text-xs text-[#9B8AA3] mt-1">Time to watch!</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Modes */}
            <Card>
              <h3 className="text-lg font-bold text-[#2D3436] mb-3">Luna's Modes</h3>
              <div className="space-y-2">
                {[
                  { icon: '🌅', name: 'Morning Planner', description: 'Plan your day' },
                  { icon: '📊', name: 'Progress Tracker', description: 'Track your progress' },
                  { icon: '🤔', name: 'Study Buddy', description: 'Get homework help' },
                  { icon: '🧮', name: 'Problem Solver', description: 'Solve math & science', badge: 'NEW' },
                  { icon: '🌙', name: 'Evening Reflection', description: 'Reflect on your day' },
                ].map((mode) => (
                  <motion.div
                    key={mode.name}
                    onClick={() => {
                      setActiveMode(mode.name);
                      // Add welcome message for each mode
                      const welcomeMessages = {
                        'Morning Planner': '🌅 Good morning! Let\'s plan your day together. What subjects do you want to focus on today?',
                        'Progress Tracker': '📊 Let\'s review your progress! Ask me about any subject or check your overall performance.',
                        'Study Buddy': '🤔 I\'m here to help with your homework! Share what you\'re working on, and I\'ll assist you.',
                        'Problem Solver': '🧮 I can solve math and science problems! Try asking me to solve equations, integrate functions, or explain concepts.',
                        'Evening Reflection': '🌙 How was your day? Let\'s reflect on what you accomplished and plan for tomorrow.'
                      };
                      
                      if (messages.length === 0 || messages[messages.length - 1].sender === 'user') {
                        setMessages(prev => [...prev, {
                          id: prev.length + 1,
                          timestamp: new Date().toISOString(),
                          sender: 'agent',
                          message: welcomeMessages[mode.name]
                        }]);
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                      activeMode === mode.name
                        ? 'bg-gradient-to-r from-[#B5A3E5] to-[#C5B9E5] border-2 border-[#9B89D5] shadow-lg'
                        : 'bg-[#FEFEFE] border-2 border-[#E5E5E5] hover:bg-[#F8F6ED] hover:border-[#C5B9E5]'
                    }`}
                  >
                    <span className="text-2xl">{mode.icon}</span>
                    <div className="flex-1">
                      <div className={`font-semibold ${activeMode === mode.name ? 'text-white' : 'text-[#7A8A7D]'}`}>
                        {mode.name}
                      </div>
                      <div className={`text-xs ${activeMode === mode.name ? 'text-white/80' : 'text-gray-500'}`}>
                        {mode.description}
                      </div>
                    </div>
                    {mode.badge && (
                      <Badge className="bg-orange-500 text-white text-xs px-2 py-1">
                        {mode.badge}
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT SIDE - CHAT INTERFACE (70%)
              ═══════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex gap-3 ${
                        msg.sender === 'system' 
                          ? 'justify-center' 
                          : msg.sender === 'user' 
                          ? 'justify-end' 
                          : 'justify-start'
                      }`}
                    >
                      {/* System Message (centered, different style) */}
                      {msg.sender === 'system' ? (
                        <div className={`px-4 py-2 rounded-xl text-sm font-medium ${
                          msg.type === 'success' 
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : msg.type === 'error'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {msg.message}
                        </div>
                      ) : (
                        <>
                          {/* Luna's Avatar - ALWAYS VISIBLE */}
                          {msg.sender === 'agent' && (
                            <motion.div
                              className="flex-shrink-0"
                              animate={{
                                scale: [1, 1.05, 1],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut'
                              }}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #E6D4F5 0%, #B4A5D8 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                alignSelf: 'flex-start'
                              }}
                            >
                              {agent.avatar}
                            </motion.div>
                          )}

                          <div
                            className={`max-w-[80%] ${
                              msg.sender === 'user'
                                ? 'bg-[#C5B9E5] text-white border-2 border-[#B5A8D5]'
                                : 'bg-gradient-to-br from-[#F5F1E8] to-[#FFFEF7] text-[#2D3436] border-l-4 border-[#B4A5D8] shadow-md'
                            } rounded-3xl px-6 py-4`}
                          >
                            {msg.sender === 'agent' && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-[#8B7AA3]" style={{fontFamily: 'Playfair Display, serif'}}>{agent.name}</span>
                              </div>
                            )}
                            <p className="whitespace-pre-line leading-relaxed">
                              {msg.message}
                            </p>
                            
                            {/* Mathematical Result Display (powered silently) */}
                            {msg.wolframResult && msg.wolframResult.success && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-4 h-4 text-purple-500" />
                                  <span className="text-sm font-bold text-purple-700">Solution:</span>
                                </div>
                                {msg.wolframResult.imageUrl && (
                                  <img
                                    src={msg.wolframResult.imageUrl}
                                    alt="Solution"
                                    className="w-full rounded-lg shadow-md"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                {msg.wolframResult.solution && (
                                  <div className="mt-2 p-3 bg-white/50 rounded-lg">
                                    <pre className="text-sm text-purple-800 whitespace-pre-wrap font-semibold">{msg.wolframResult.solution}</pre>
                                  </div>
                                )}
                                {msg.wolframResult.steps && (
                                  <div className="mt-2 p-3 bg-white/50 rounded-lg">
                                    <div className="text-xs font-semibold text-purple-700 mb-1">Step-by-step:</div>
                                    <pre className="text-sm text-purple-800 whitespace-pre-wrap">{msg.wolframResult.steps}</pre>
                                  </div>
                                )}
                              </motion.div>
                            )}
                            
                            <div className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-white/90' : 'text-[#9B8AA3]'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="px-6 py-3 border-t border-[#F8F6ED]">
                <div className="flex gap-2 flex-wrap">
                  {quickActions.map((action) => (
                    <button
                      key={action.text}
                      onClick={() => handleQuickAction(action.action, action.text)}
                      disabled={loading}
                      className="px-4 py-2 rounded-full bg-white border-2 border-[#F8F6ED] hover:border-[#C5A3FF] hover:bg-[#C5A3FF]/5 transition-all text-sm font-semibold text-[#7A8A7D] hover:text-[#C5A3FF] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{action.icon}</span>
                      <span>{action.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Box */}
              <div className="p-6 border-t border-[#F8F6ED]">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                    disabled={loading}
                    placeholder={loading ? "Luna is thinking..." : "Type your message..."}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-[#F8F6ED] focus:border-[#C5A3FF] focus:outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C5A3FF] to-[#B5A3E5] text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
        
        {/* API Key Modal */}
        <AnimatePresence>
          {showApiKeyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowApiKeyModal(false)}
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
              >
                <h3 className="text-2xl font-bold text-[#2D3436] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
                  🔑 Add Gemini API Key
                </h3>
                <p className="text-sm text-[#7A8A7D] mb-4">
                  Get a free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#B5A3E5] underline">Google AI Studio</a>
                </p>
                
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSetApiKey()}
                  placeholder="Paste your API key here..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#F8F6ED] focus:border-[#B5A3E5] focus:outline-none transition-colors mb-4"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-[#F8F6ED] text-[#7A8A7D] font-semibold hover:bg-[#F8F6ED] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSetApiKey}
                    disabled={!apiKeyInput.trim()}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#B5A3E5] to-[#FFB4D1] text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Key
                  </button>
                </div>
                
                <p className="text-xs text-[#9B8AA3] mt-4">
                  💡 Your API key is stored locally in your browser. It's never sent anywhere except to Google's Gemini API.
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Action Confirmation Modal */}
        <AnimatePresence>
          {pendingActions && (
            <ActionConfirmation
              actions={pendingActions}
              onConfirm={handleActionConfirm}
              onCancel={handleActionCancel}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
