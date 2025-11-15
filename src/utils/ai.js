// ═══════════════════════════════════════════════════════════════
// AI SERVICE - Luna's Brain 🧠✨
// Powered by Google Gemini AI
// ═══════════════════════════════════════════════════════════════

import { GoogleGenerativeAI } from '@google/generative-ai';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

// Get API key from environment or localStorage (for development)
const getApiKey = () => {
  // Check environment variable first
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey) return envKey;
  
  // Fall back to localStorage
  const storedKey = localStorage.getItem('gemini_api_key');
  if (storedKey) return storedKey;
  
  return null;
};

// Initialize Gemini AI with advanced settings
let genAI = null;
let model = null;
let proModel = null; // For complex tasks

// Simple response cache for common questions (improves efficiency)
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Clear old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      responseCache.delete(key);
    }
  }
}, 60000); // Clean every minute

// Generation config for different use cases
// Optimized for speed and efficiency while maintaining quality
const GENERATION_CONFIG = {
  // Fast responses for chat (optimized)
  chat: {
    temperature: 0.7,        // Reduced from 0.9 for more consistent, faster responses
    topK: 32,                // Reduced from 40 for faster token selection
    topP: 0.9,               // Reduced from 0.95 for better efficiency
    maxOutputTokens: 800,    // Reduced from 1024 - most chat responses don't need more
  },
  // Balanced for planning tasks
  planning: {
    temperature: 0.6,        // Reduced from 0.7 for more focused plans
    topK: 24,                // Reduced from 30 for faster generation
    topP: 0.85,              // Reduced from 0.9 for efficiency
    maxOutputTokens: 1200,   // Reduced from 2048 - adequate for daily plans
  },
  // Precise for analysis (unchanged - already efficient)
  analysis: {
    temperature: 0.5,
    topK: 20,
    topP: 0.85,
    maxOutputTokens: 1000,   // Reduced from 1536
  }
};

export const initializeAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('⚠️ No Gemini API key found');
    return false;
  }
  
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    
    // Try different model names - v1beta API compatibility
    // The model name varies between SDK versions and API versions
    const modelNames = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest', 
      'models/gemini-1.5-flash',
      'gemini-pro',
      'models/gemini-pro'
    ];
    
    console.log('🔧 Attempting to initialize AI with available models...');
    
    // Use Gemini 2.5 Flash - confirmed working model from API
    const modelName = 'gemini-2.5-flash';
    console.log(`🔧 Using model: ${modelName}`);
    
    model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: GENERATION_CONFIG.chat
    });
    proModel = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: GENERATION_CONFIG.planning
    });
    
    console.log('✅ Luna AI initialized successfully!');
    console.log('🔑 API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
    console.log(`� Model: ${modelName}`);
    return true;
  } catch (error) {
    console.error('❌ AI initialization error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    return false;
  }
};

// Save API key to localStorage
export const setApiKey = (key) => {
  localStorage.setItem('gemini_api_key', key);
  initializeAI();
};

// Check if AI is ready
export const isAIReady = () => {
  return model !== null;
};

// Get the Gemini model instance (for external use like YouTube service)
export const getGeminiModel = () => {
  if (!model) {
    console.warn('⚠️ Gemini model not initialized, attempting to initialize...');
    initializeAI();
  }
  return model;
};

// ═══════════════════════════════════════════════════════════════
// CONTEXT BUILDING - Give Luna knowledge about the user
// ═══════════════════════════════════════════════════════════════

/**
 * Build context string from user's data
 * @param {object} userData - User's subjects, schedule, progress
 * @returns {string} - Context for AI
 */
export const buildUserContext = (userData) => {
  const { subjects, schedule, user, gre } = userData;
  
  let context = `You are Luna, a warm and supportive AI study companion. You understand each student's unique journey and adapt your advice to their specific situation. Be conversational, encouraging, and practical.\n\n`;
  
  // Current date
  const today = new Date();
  context += `📅 TODAY: ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
  
  // Check if user is starting fresh (no subjects or all at 0% progress)
  const hasSubjects = subjects && Object.keys(subjects).length > 0;
  const activeSubjects = hasSubjects ? Object.values(subjects).filter(s => s.status === 'active') : [];
  
  if (!hasSubjects || activeSubjects.length === 0) {
    context += `🆕 STUDENT STATUS: Just getting started! No subjects added yet.\n`;
    context += `YOUR ROLE: Help them:\n`;
    context += `- Understand how to add their first subject\n`;
    context += `- Plan their study approach from scratch\n`;
    context += `- Feel motivated to begin their journey\n`;
    context += `- Ask about their goals, exams, and what they want to achieve\n\n`;
    context += `TONE: Extra encouraging, patient, and guide them step-by-step.\n\n`;
  } else {
    // Calculate overall progress
    let totalMastery = 0;
    let totalTopics = 0;
    
    activeSubjects.forEach(subject => {
      if (subject.topics && subject.topics.length > 0) {
        subject.topics.forEach(topic => {
          totalMastery += (topic.mastery || 0);
          totalTopics++;
        });
      }
    });
    
    const overallProgress = totalTopics > 0 ? Math.round(totalMastery / totalTopics) : 0;
    
    // Determine student phase
    let phase = '';
    if (overallProgress === 0) {
      phase = 'JUST STARTING - No progress recorded yet';
    } else if (overallProgress < 30) {
      phase = 'EARLY STAGE - Building foundation';
    } else if (overallProgress < 70) {
      phase = 'MID-JOURNEY - Making solid progress';
    } else {
      phase = 'ADVANCED - Nearing completion';
    }
    
    context += `📊 STUDENT PHASE: ${phase}\n`;
    context += `Overall Progress: ${overallProgress}%\n`;
    context += `Active Subjects: ${activeSubjects.length}\n\n`;
    
    // List subjects with details
    context += `📚 ACTIVE SUBJECTS:\n`;
    activeSubjects.forEach(subject => {
      const daysLeft = Math.ceil((new Date(subject.examDate) - new Date()) / (1000 * 60 * 60 * 24));
      const subjectProgress = subject.topics && subject.topics.length > 0
        ? Math.round(subject.topics.reduce((sum, t) => sum + (t.mastery || 0), 0) / subject.topics.length)
        : 0;
      
      context += `\n📖 ${subject.name}:\n`;
      context += `   - Exam: ${subject.examDate} (${daysLeft} days away)\n`;
      context += `   - Target Score: ${subject.targetScore}\n`;
      context += `   - Progress: ${subjectProgress}%\n`;
      
      // List topics with their status (optimized - only show critical/incomplete)
      if (subject.topics && subject.topics.length > 0) {
        // Show only incomplete or critical topics to reduce context size
        const importantTopics = subject.topics.filter(t => 
          (t.mastery || 0) < 80 || t.priority === 'CRITICAL'
        );
        
        if (importantTopics.length > 0) {
          context += `   - Active Topics (${importantTopics.length} of ${subject.topics.length}):\n`;
          importantTopics.slice(0, 5).forEach(topic => { // Limit to 5 topics per subject
            const mastery = topic.mastery || 0;
            const status = mastery === 0 ? '🔴' : mastery < 50 ? '🟡' : '🟢';
            context += `     • ${topic.name}: ${mastery}% ${status}`;
            
            if (topic.priority === 'CRITICAL') {
              context += ` ⚠️ CRITICAL`;
            }
            context += `\n`;
          });
          if (importantTopics.length > 5) {
            context += `     ... and ${importantTopics.length - 5} more topics\n`;
          }
        } else {
          context += `   - All topics progressing well! ✅\n`;
        }
      } else {
        context += `   - No topics added yet\n`;
      }
    });
    context += `\n`;
  }
  
  // Study streak
  if (user?.currentStreak !== undefined) {
    context += `🔥 STUDY STREAK: ${user.currentStreak} days\n`;
    if (user.currentStreak === 0) {
      context += `   Encourage them to start building a streak!\n`;
    } else if (user.currentStreak < 7) {
      context += `   Great start! Keep the momentum going!\n`;
    } else {
      context += `   Impressive dedication! Celebrate this achievement!\n`;
    }
    context += `\n`;
  }
  
  // GRE status (if applicable)
  if (gre) {
    const daysToGRE = Math.ceil((new Date(gre.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    context += `📝 GRE PREP:\n`;
    context += `- Exam in ${daysToGRE} days (${gre.examDate})\n`;
    context += `- Vocab: ${gre.vocab?.learned || 0}/${gre.vocab?.target || 1000} words (${Math.round(((gre.vocab?.learned || 0) / (gre.vocab?.target || 1000)) * 100)}%)\n`;
    context += `- Reading: ${gre.reading?.completed || 0}/${gre.reading?.target || 600} pages (${Math.round(((gre.reading?.completed || 0) / (gre.reading?.target || 600)) * 100)}%)\n\n`;
  }
  
  // Today's schedule (if available)
  if (schedule?.blocks && schedule.blocks.length > 0) {
    context += `📅 TODAY'S SCHEDULE:\n`;
    schedule.blocks.forEach(block => {
      context += `- ${block.time}: ${block.activity} (${block.duration}min)\n`;
    });
    context += `\n`;
  }
  
  // Instructions for Luna's behavior
  context += `═══════════════════════════════════════════════════\n`;
  context += `🎯 YOUR MISSION AS LUNA:\n\n`;
  context += `1. BE PERSONAL: Use the student's actual data in your responses\n`;
  context += `2. BE SPECIFIC: Reference real subjects, topics, and exam dates\n`;
  context += `3. BE ACTIONABLE: Give concrete next steps, not generic advice\n`;
  context += `4. BE ENCOURAGING: Celebrate wins, be gentle with struggles\n`;
  context += `5. BE ADAPTIVE:\n`;
  context += `   - If they're at 0% → Help them START (add subjects, plan first study session)\n`;
  context += `   - If they're stuck → Break it down into tiny steps\n`;
  context += `   - If they're progressing → Keep momentum, optimize their approach\n`;
  context += `   - If they're stressed → Provide reassurance and prioritization\n\n`;
  context += `6. UNDERSTAND CONTEXT: When they ask questions, consider:\n`;
  context += `   - What subjects they have\n`;
  context += `   - Their current progress levels\n`;
  context += `   - How many days until exams\n`;
  context += `   - What topics are critical vs. optional\n\n`;
  context += `7. FORMAT RESPONSES:\n`;
  context += `   - Keep responses 2-3 paragraphs for chat (unless they ask for detailed plans)\n`;
  context += `   - Use emojis naturally to make it friendly\n`;
  context += `   - Use bullet points for action items\n`;
  context += `   - Reference specific data points (e.g., "Your VLSI exam in 6 days...")\n\n`;
  context += `8. WHEN GIVING ADVICE:\n`;
  context += `   - If no progress → Focus on getting started, not perfection\n`;
  context += `   - If behind schedule → Prioritize ruthlessly, be realistic\n`;
  context += `   - If on track → Maintain pace, add depth\n`;
  context += `   - If ahead → Challenge them, add advanced topics\n\n`;
  context += `9. TOPIC EXTRACTION CAPABILITY:\n`;
  context += `   - When user shares syllabus/question papers/topic lists, recognize it!\n`;
  context += `   - Ask: "Would you like me to extract these topics and add them to your subject?"\n`;
  context += `   - Be proactive: If they mention a subject without topics, offer to help\n`;
  context += `   - Handle detailed content: Understand marks, weightage, frequency, units\n`;
  context += `   - Example: User: "Here's my VLSI syllabus..." → You: "I see 6 high-priority topics. Should I add them?"\n\n`;
  context += `10. ACTION EXECUTION - YOU CAN NOW TAKE ACTIONS! 🎯\n`;
  context += `   When you want to help by DOING something (not just suggesting), use this format:\n`;
  context += `   [ACTION:type|param1:value1|param2:value2]\n\n`;
  context += `   Available Actions:\n`;
  context += `   • add_schedule - Add study session to calendar\n`;
  context += `     Format: [ACTION:add_schedule|subject:Mathematics|startTime:14:00|duration:60|date:2025-11-13]\n`;
  context += `   • create_task - Create a new task/todo\n`;
  context += `     Format: [ACTION:create_task|subject:Physics|title:Solve kinematics problems|priority:high]\n`;
  context += `   • extract_topics - Add topics to a subject\n`;
  context += `     Format: [ACTION:extract_topics|subject:Chemistry|topics:Thermodynamics,Electrochemistry,Organic Reactions]\n`;
  context += `   • update_subject - Modify subject properties\n`;
  context += `     Format: [ACTION:update_subject|subject:Biology|priority:high|color:green]\n\n`;
  context += `   When to use actions:\n`;
  context += `   - User says "add", "create", "schedule", "extract" → Include action in response\n`;
  context += `   - User shares syllabus/topics → Suggest AND include extract_topics action\n`;
  context += `   - User asks for study plan → Suggest AND include add_schedule actions\n`;
  context += `   - Be proactive! If you suggest something, include the action to do it\n\n`;
  context += `   Important:\n`;
  context += `   - Put action tags at the END of your response\n`;
  context += `   - Explain what you're doing BEFORE the action tag\n`;
  context += `   - User will see a confirmation dialog before action executes\n`;
  context += `   - Example response: "I'll add a 60-minute session for Math today at 2pm! [ACTION:add_schedule|subject:Mathematics|startTime:14:00|duration:60|date:2025-11-13]"\n\n`;
  context += `11. RESPONSE LENGTH:\n`;
  context += `   - Quick questions: 1-2 paragraphs\n`;
  context += `   - Topic extraction: List extracted topics, ask confirmation\n`;
  context += `   - Study plans: Detailed breakdown with time blocks\n`;
  context += `   - Encouragement: Short and energizing\n\n`;
  context += `═══════════════════════════════════════════════════\n\n`;
  
  return context;
};

// ═══════════════════════════════════════════════════════════════
// AI CHAT - Send messages to Luna
// ═══════════════════════════════════════════════════════════════

/**
 * Chat with Luna
 * @param {string} userMessage - User's message
 * @param {object} userData - User's context data
 * @param {array} chatHistory - Previous messages
 * @returns {Promise<string>} - Luna's response
 */
export const chatWithLuna = async (userMessage, userData = {}, chatHistory = []) => {
  if (!isAIReady()) {
    console.error('❌ AI not ready - initializing now...');
    const initialized = initializeAI();
    if (!initialized) {
      return "I need an API key to talk! Go to AI Agent page → Click 'Set API Key' button 🔑";
    }
  }
  
  // Check cache for common questions (improves efficiency)
  const cacheKey = userMessage.toLowerCase().trim();
  const cached = responseCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    console.log('✨ Using cached response (faster!)');
    return cached.response;
  }
  
  try {
    // Build context
    let context = buildUserContext(userData);
    
    // Add mode-specific context
    if (userData.mode) {
      const modeInstructions = {
        'Morning Planner': '\n\n🌅 MODE: Morning Planner - Help the user plan their day. Be energetic and motivating! Suggest specific study blocks and breaks.',
        'Progress Tracker': '\n\n📊 MODE: Progress Tracker - Analyze their progress. Give specific feedback on subjects, highlight improvements, and suggest areas to focus on.',
        'Study Buddy': '\n\n🤔 MODE: Study Buddy - Help with homework and learning. Break down complex topics, provide examples, and encourage questions. Use Wolfram for math/science!',
        'Problem Solver': '\n\n🧮 MODE: Problem Solver - Solve math and science problems! Explain step-by-step. Note: Wolfram Alpha provides computational results - explain them in simple terms.',
        'Evening Reflection': '\n\n🌙 MODE: Evening Reflection - Help reflect on the day. Ask about accomplishments, challenges, and plans for tomorrow. Be supportive and encouraging.'
      };
      context += modeInstructions[userData.mode] || '';
    }
    
    // Add Wolfram result if available
    if (userData.wolframResult && userData.wolframResult.success) {
      context += '\n\n🔬 WOLFRAM RESULT AVAILABLE:\n';
      context += 'Wolfram Alpha has provided a computational solution for this question.\n';
      context += 'Explain the Wolfram result in simple, student-friendly terms.\n';
      context += 'Help them understand WHY this is the answer, not just WHAT the answer is.\n';
    }
    
    // Build conversation history (optimized - only last 4 messages instead of 6)
    let prompt = context + "\n---\n\nRECENT CONVERSATION:\n";
    
    // Only include last 4 messages to reduce context size and improve speed
    const recentMessages = Array.isArray(chatHistory) ? chatHistory.slice(-4) : [];
    recentMessages.forEach(msg => {
      // Handle both 'text' and 'message' properties (different message formats)
      const messageText = msg.text || msg.message || '';
      
      if (msg.sender === 'user') {
        prompt += `User: ${messageText}\n`;
      } else {
        // Truncate long AI responses in history to save tokens
        const truncatedText = messageText.length > 200 
          ? messageText.substring(0, 200) + '...' 
          : messageText;
        prompt += `Luna: ${truncatedText}\n`;
      }
    });
    
    prompt += `\nUser: ${userMessage}\nLuna:`;
    
    console.log('🤖 Sending to Gemini AI...');
    
    // Generate response
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('✅ Got response from Gemini:', text.substring(0, 50) + '...');
    
    // Cache response for common questions (only if short - < 500 chars)
    if (userMessage.length < 100 && text.length < 500 && chatHistory.length < 2) {
      responseCache.set(cacheKey, {
        response: text,
        timestamp: Date.now()
      });
      console.log('💾 Cached response for faster future access');
    }
    
    return text;
  } catch (error) {
    console.error('❌ AI chat error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // Handle 503 - Service Overloaded (retry-able)
    if (error.message?.includes('503') || error.message?.includes('overloaded')) {
      return `🌙 Luna is taking a quick breather...\n\nGoogle's AI is a bit busy right now (503 error). This happens during peak usage.\n\n💡 What to do:\n• Wait 30-60 seconds and try again\n• Or try asking a simpler question\n• The service usually recovers quickly!\n\nYour message wasn't lost - just ask again in a moment! 😊`;
    }
    
    // Show detailed error for debugging
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return `⚠️ Model not found error!\n\nThe AI model name might be incorrect. Full error:\n${error.message}\n\nTry:\n1. Check console (F12) for details\n2. Your API key might need to enable the model at: https://aistudio.google.com`;
    }
    
    if (error.message?.includes('API_KEY') || error.message?.includes('API key') || error.message?.includes('401')) {
      return "⚠️ Invalid API key! Please check your Gemini API key.\n\n1. Go to https://aistudio.google.com/app/apikey\n2. Create a new API key\n3. Click 'Set API Key' button on AI Agent page";
    }
    
    if (error.message?.includes('quota') || error.message?.includes('QUOTA')) {
      return "⚠️ API quota exceeded. Your free tier limit might be reached. Try again in a few minutes.";
    }
    
    // Don't hide errors - show them for debugging
    return `⚠️ AI Error: ${error.message}\n\nCheck console (F12) for full details.`;
  }
};

// ═══════════════════════════════════════════════════════════════
// STUDY PLAN GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a daily study plan
 * @param {object} userData - User's subjects and progress
 * @returns {Promise<string>} - Study plan
 */
export const generateDailyPlan = async (userData) => {
  if (!isAIReady()) {
    console.error('❌ AI not ready for daily plan');
    const initialized = initializeAI();
    if (!initialized) {
      return "I need an API key to create plans! Click 'Set API Key' button on this page 🔑";
    }
  }
  
  try {
    const context = buildUserContext(userData);
    
    const prompt = `${context}\n\n---\n\nCreate a prioritized study plan for TODAY based on:\n1. Exam urgency (closer exams = higher priority)\n2. Critical topics that need attention\n3. Balanced approach (don't burnout!)\n\nFormat:\n📚 PRIORITY 1: [Subject] - [Topic] (Why: [reason])\n📝 PRIORITY 2: ...\n💡 BONUS: ...\n⚡ ENERGY TIP: [one tip for staying focused]\n\nKeep it actionable and specific. Include time estimates.`;
    
    console.log('🗓️ Generating daily plan with Gemini...');
    
    const result = await model.generateContent(prompt);
    const planText = result.response.text();
    
    console.log('✅ Daily plan generated successfully');
    
    return planText;
  } catch (error) {
    console.error('❌ Plan generation error:', error);
    console.error('Error details:', error.message);
    
    // Handle 503 - Service Overloaded
    if (error.message?.includes('503') || error.message?.includes('overloaded')) {
      return "🌙 Google's AI is taking a quick break (503 error - service overloaded).\n\nWait 30-60 seconds and try again, or ask me for a plan in the chat instead! The service usually recovers quickly. 😊";
    }
    
    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      return "⚠️ Invalid API key! Get a free key at: https://makersuite.google.com/app/apikey";
    }
    
    return `Couldn't generate a plan right now. Error: ${error.message}\n\nTry asking me directly in chat! 💬`;
  }
};

/**
 * Generate a weekly study plan
 * @param {object} userData - User's subjects and progress
 * @returns {Promise<string>} - Weekly plan
 */
export const generateWeeklyPlan = async (userData) => {
  if (!isAIReady()) {
    return "I need an API key to create plans! Go to Settings → Add Gemini API Key 🔑";
  }
  
  try {
    const context = buildUserContext(userData);
    
    const prompt = `${context}\n\n---\n\nCreate a weekly study plan (next 7 days) that:\n1. Distributes subjects based on exam proximity\n2. Includes revision cycles (R1, R2, R3)\n3. Balances workload (no burnout!)\n4. Builds in rest days\n\nFormat:\n📅 MONDAY:\n- Morning: [Subject] [Topic]\n- Afternoon: [Subject] [Topic]\n- Evening: Review\n\n[Continue for each day...]\n\n💡 WEEKLY TIPS:\n- [3 specific tips]\n\nBe specific with topics and realistic with time.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('❌ Weekly plan error:', error);
    return "Couldn't generate a weekly plan. Ask me in chat for help! 💬";
  }
};

// ═══════════════════════════════════════════════════════════════
// QUICK SUGGESTIONS - Fast responses for common needs
// ═══════════════════════════════════════════════════════════════

/**
 * Get quick study suggestion based on current state
 * @param {object} userData - User's data
 * @returns {Promise<string>} - Quick suggestion
 */
export const getQuickSuggestion = async (userData) => {
  if (!isAIReady()) {
    // Fallback to hardcoded suggestion
    const subjects = Object.values(userData.subjects || {}).filter(s => s.status === 'active');
    if (subjects.length === 0) return "Add some subjects to get started! 📚";
    
    const nearest = subjects.sort((a, b) => {
      const daysA = Math.ceil((new Date(a.examDate) - new Date()) / (1000 * 60 * 60 * 24));
      const daysB = Math.ceil((new Date(b.examDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysA - daysB;
    })[0];
    
    return `Focus on ${nearest.name} - exam in ${Math.ceil((new Date(nearest.examDate) - new Date()) / (1000 * 60 * 60 * 24))} days! 🎯`;
  }
  
  try {
    const context = buildUserContext(userData);
    const prompt = `${context}\n\n---\n\nIn ONE sentence (max 15 words), what should the user study RIGHT NOW? Be specific.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('❌ Quick suggestion error:', error);
    return "Check your critical topics! 💡";
  }
};

/**
 * Get progress report
 * @param {object} userData - User's data
 * @returns {Promise<string>} - Progress analysis
 */
export const getProgressReport = async (userData) => {
  if (!isAIReady()) {
    return "Connect API key to get AI-powered progress analysis! 📊";
  }
  
  try {
    const context = buildUserContext(userData);
    const prompt = `${context}\n\n---\n\nAnalyze the user's progress:\n1. What's going well?\n2. What needs attention?\n3. Are they on track for their exams?\n4. One specific action to improve\n\nBe honest but encouraging. Use emojis. Keep it under 150 words.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('❌ Progress report error:', error);
    return "Couldn't analyze progress. Ask me directly! 💬";
  }
};

// ═══════════════════════════════════════════════════════════════
// ADVANCED AI FEATURES
// ═══════════════════════════════════════════════════════════════

/**
 * Analyze a specific topic and provide deep insights
 * @param {string} topicName - Topic to analyze
 * @param {object} topicData - Topic details (mastery, priority, etc)
 * @param {object} subjectData - Parent subject data
 * @returns {Promise<object>} - Analysis with recommendations
 */
export const analyzeTopicDeep = async (topicName, topicData, subjectData) => {
  if (!isAIReady()) {
    return {
      success: false,
      message: "AI not initialized. Add API key in Settings."
    };
  }
  
  try {
    const daysToExam = Math.ceil((new Date(subjectData.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    const prompt = `You're analyzing a specific study topic for a student.

SUBJECT: ${subjectData.name}
EXAM DATE: ${subjectData.examDate} (${daysToExam} days away)
TARGET SCORE: ${subjectData.targetScore}

TOPIC: ${topicName}
CURRENT MASTERY: ${topicData.mastery || 0}%
PRIORITY: ${topicData.priority || 'NORMAL'}
TIME SPENT: ${topicData.timeSpent || 0} hours

Provide:
1. 📊 Status Assessment (1-2 sentences): Is this on track?
2. 🎯 Focus Areas (3-5 specific subtopics to master)
3. 📚 Study Strategy (concrete actions, not generic advice)
4. ⏱️ Time Allocation (realistic hours needed)
5. 🚨 Red Flags (what could go wrong if not addressed)
6. ✅ Quick Win (one thing to master TODAY)

Be brutally honest but motivating. Use bullet points.`;

    const result = await proModel.generateContent(prompt);
    const analysis = result.response.text();
    
    return {
      success: true,
      analysis,
      topicName,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Topic analysis error:', error);
    return {
      success: false,
      message: "Analysis failed. Try again or ask in chat."
    };
  }
};

/**
 * Generate optimal revision schedule (R1, R2, R3)
 * @param {object} topicData - Topic that needs revision
 * @param {object} subjectData - Parent subject
 * @returns {Promise<object>} - Revision dates and strategy
 */
export const generateRevisionSchedule = async (topicData, subjectData) => {
  if (!isAIReady()) {
    return { success: false, message: "AI not ready" };
  }
  
  try {
    const daysToExam = Math.ceil((new Date(subjectData.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    const prompt = `Create a spaced repetition revision schedule.

TOPIC: ${topicData.name}
DAYS TO EXAM: ${daysToExam}
MASTERY LEVEL: ${topicData.mastery}%

Using science-backed spacing:
- R1 (First revision): 1 day after learning
- R2 (Second revision): 3-7 days after R1
- R3 (Final revision): 14-21 days after R2 (or 3 days before exam)

Generate:
1. 📅 R1 DATE: [specific date]
   - Focus: [what to review]
   - Duration: [minutes needed]

2. 📅 R2 DATE: [specific date]
   - Focus: [what to review]
   - Duration: [minutes needed]

3. 📅 R3 DATE: [specific date]
   - Focus: [what to review]
   - Duration: [minutes needed]

Adjust dates based on exam proximity. Be specific.`;

    const result = await proModel.generateContent(prompt);
    const schedule = result.response.text();
    
    return {
      success: true,
      schedule,
      generated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Revision schedule error:', error);
    return { success: false, message: "Schedule generation failed" };
  }
};

/**
 * Get motivational message based on current progress and mood
 * @param {object} userData - User's complete data
 * @param {string} mood - User's current mood (optional)
 * @returns {Promise<string>} - Personalized motivation
 */
export const getMotivationalBoost = async (userData, mood = null) => {
  if (!isAIReady()) {
    const fallbackMessages = [
      "You've got this! Every small step counts. 💪",
      "Progress isn't linear. Bad days happen. Keep going. 🚀",
      "Your future self is cheering for you! 🎯",
      "Discipline > Motivation. Show up anyway. 🔥"
    ];
    return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
  }
  
  try {
    const context = buildUserContext(userData);
    const moodContext = mood ? `\nUSER'S CURRENT MOOD: ${mood}` : '';
    
    const prompt = `${context}${moodContext}\n\n---\n\nProvide a 2-3 sentence motivational message that:
1. Acknowledges their current situation (exams, progress, streak)
2. Is genuinely encouraging (not generic)
3. Includes ONE specific action they can take RIGHT NOW
4. Ends with an emoji

Be warm and real, like a supportive friend.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('❌ Motivation error:', error);
    return "You're doing better than you think. Keep pushing! 💪";
  }
};

/**
 * Analyze study patterns and suggest improvements
 * @param {object} userData - User's data including schedule and habits
 * @returns {Promise<object>} - Pattern analysis and recommendations
 */
export const analyzeStudyPatterns = async (userData) => {
  if (!isAIReady()) {
    return { success: false, message: "AI not ready" };
  }
  
  try {
    const context = buildUserContext(userData);
    
    const prompt = `${context}\n\n---\n\nAnalyze the user's study patterns and provide insights:

1. 🔍 PATTERN ANALYSIS
   - What's working well?
   - What needs improvement?
   - Any concerning trends?

2. ⚡ OPTIMIZATION OPPORTUNITIES
   - Time management suggestions
   - Energy optimization (when to study what)
   - Efficiency improvements

3. 🎯 SPECIFIC RECOMMENDATIONS
   - 3 concrete actions to implement THIS WEEK
   - Each should be specific and measurable

4. 📊 EXPECTED IMPACT
   - How will these changes help?
   - Timeline for seeing results

Be data-driven and actionable. No fluff.`;

    const result = await proModel.generateContent(prompt);
    const analysis = result.response.text();
    
    return {
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Pattern analysis error:', error);
    return { success: false, message: "Analysis failed" };
  }
};

/**
 * Generate practice questions for a topic
 * @param {string} topicName - Topic to generate questions for
 * @param {string} subjectName - Subject name
 * @param {string} difficulty - easy, medium, hard
 * @param {number} count - Number of questions
 * @returns {Promise<object>} - Questions with answers
 */
export const generatePracticeQuestions = async (topicName, subjectName, difficulty = 'medium', count = 5) => {
  if (!isAIReady()) {
    return { success: false, message: "AI not ready" };
  }
  
  try {
    const prompt = `Generate ${count} practice questions for exam preparation.

SUBJECT: ${subjectName}
TOPIC: ${topicName}
DIFFICULTY: ${difficulty}

For each question, provide:
1. ❓ QUESTION: [Clear, exam-style question]
2. 💡 ANSWER: [Detailed answer with explanation]
3. 🎯 KEY CONCEPT: [What this tests]
4. ⏱️ TIME: [Expected time to solve]

Make questions realistic and challenging. Test understanding, not memorization.`;

    const result = await proModel.generateContent(prompt);
    const questions = result.response.text();
    
    return {
      success: true,
      questions,
      topic: topicName,
      difficulty,
      generated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Question generation error:', error);
    return { success: false, message: "Question generation failed" };
  }
};

/**
 * Explain a difficult concept in simple terms
 * @param {string} concept - Concept to explain
 * @param {string} subject - Subject context
 * @param {string} level - eli5, basic, intermediate, advanced
 * @returns {Promise<string>} - Simplified explanation
 */
export const explainConcept = async (concept, subject, level = 'basic') => {
  if (!isAIReady()) {
    return "AI not ready. Add API key in Settings.";
  }
  
  try {
    const prompts = {
      eli5: "Explain like I'm 5 years old. Use simple analogies and everyday examples.",
      basic: "Explain clearly for a beginner. Use analogies when helpful.",
      intermediate: "Explain with some depth. Assume basic background knowledge.",
      advanced: "Explain comprehensively with technical details and nuances."
    };
    
    const prompt = `${prompts[level] || prompts.basic}

SUBJECT: ${subject}
CONCEPT: ${concept}

Provide:
1. 🎯 Core Idea (1-2 sentences)
2. 📖 Detailed Explanation (use analogies, examples)
3. 🔗 Connection to other concepts (how does this fit?)
4. 💡 Why It Matters (practical application)
5. ⚠️ Common Mistakes (what students often get wrong)

Make it clear, engaging, and memorable.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('❌ Concept explanation error:', error);
    return "Couldn't explain that concept. Try asking in a different way!";
  }
};

/**
 * Get exam day strategy and tips
 * @param {object} subjectData - Subject with upcoming exam
 * @param {number} daysUntil - Days until exam
 * @returns {Promise<string>} - Exam strategy
 */
export const getExamStrategy = async (subjectData, daysUntil) => {
  if (!isAIReady()) {
    return "AI not ready. Add API key to get exam strategies.";
  }
  
  try {
    const prompt = `Create an exam preparation strategy.

SUBJECT: ${subjectData.name}
EXAM DATE: ${subjectData.examDate}
DAYS LEFT: ${daysUntil}
TARGET SCORE: ${subjectData.targetScore}
CURRENT PROGRESS: ${subjectData.topics ? 
  Math.round(subjectData.topics.reduce((sum, t) => sum + (t.mastery || 0), 0) / subjectData.topics.length) : 0}%

Provide a phased strategy:

📅 PHASE 1: Coverage (Days ${daysUntil} to ${Math.ceil(daysUntil * 0.6)})
- What to complete
- Daily targets
- Priority topics

📚 PHASE 2: Revision (Days ${Math.ceil(daysUntil * 0.6)} to ${Math.ceil(daysUntil * 0.2)})
- Revision cycles (R1, R2, R3)
- Practice tests
- Weak areas

🎯 PHASE 3: Final Push (Last ${Math.ceil(daysUntil * 0.2)} days)
- Quick revision
- Mock tests
- Last-minute tips

⚡ EXAM DAY TACTICS
- Time management
- Question selection
- Stress management

Be specific with daily targets and realistic about time.`;

    const result = await proModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('❌ Exam strategy error:', error);
    return "Couldn't generate strategy. Ask me in chat!";
  }
};

// ═══════════════════════════════════════════════════════════════
// LEARNING ANALYTICS & INSIGHTS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate learning velocity (topics mastered per week)
 * @param {object} userData - User's subjects data
 * @returns {object} - Velocity metrics
 */
export const calculateLearningVelocity = (userData) => {
  const subjects = Object.values(userData.subjects || {});
  const activeSubjects = subjects.filter(s => s.status === 'active');
  
  let totalTopics = 0;
  let masteredTopics = 0;
  let inProgressTopics = 0;
  
  activeSubjects.forEach(subject => {
    if (subject.topics) {
      totalTopics += subject.topics.length;
      masteredTopics += subject.topics.filter(t => (t.mastery || 0) >= 80).length;
      inProgressTopics += subject.topics.filter(t => (t.mastery || 0) > 0 && (t.mastery || 0) < 80).length;
    }
  });
  
  const completionRate = totalTopics > 0 ? (masteredTopics / totalTopics) * 100 : 0;
  
  return {
    totalTopics,
    masteredTopics,
    inProgressTopics,
    notStarted: totalTopics - masteredTopics - inProgressTopics,
    completionRate: Math.round(completionRate),
    estimatedWeeksToComplete: inProgressTopics > 0 ? Math.ceil((totalTopics - masteredTopics) / 5) : 0
  };
};

/**
 * Identify at-risk subjects (exams approaching with low progress)
 * @param {object} userData - User's subjects
 * @returns {array} - At-risk subjects with urgency scores
 */
export const identifyAtRiskSubjects = (userData) => {
  const subjects = Object.values(userData.subjects || {});
  const activeSubjects = subjects.filter(s => s.status === 'active');
  
  const atRisk = activeSubjects.map(subject => {
    const daysToExam = Math.ceil((new Date(subject.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    const progress = subject.topics ? 
      Math.round(subject.topics.reduce((sum, t) => sum + (t.mastery || 0), 0) / subject.topics.length) : 0;
    
    // Calculate urgency score (0-100, higher = more urgent)
    const timeUrgency = Math.max(0, 100 - (daysToExam / 2)); // Closer exam = higher urgency
    const progressGap = 100 - progress; // Lower progress = higher gap
    const urgencyScore = (timeUrgency * 0.6) + (progressGap * 0.4);
    
    return {
      subject: subject.name,
      daysToExam,
      progress,
      urgencyScore: Math.round(urgencyScore),
      risk: urgencyScore > 70 ? 'HIGH' : urgencyScore > 40 ? 'MEDIUM' : 'LOW'
    };
  }).filter(s => s.urgencyScore > 40).sort((a, b) => b.urgencyScore - a.urgencyScore);
  
  return atRisk;
};

/**
 * Extract topics from conversation with Luna
 * AI analyzes chat and suggests topics for a subject
 * @param {string} conversation - User's description of syllabus/topics
 * @param {string} subjectName - Subject name
 * @returns {Promise<array>} - Array of topic objects
 */
export const extractTopicsFromConversation = async (conversation, subjectName) => {
  if (!isAIReady()) {
    console.error('❌ AI not ready for topic extraction');
    const initialized = initializeAI();
    if (!initialized) {
      return [];
    }
  }

  try {
    const prompt = `You are an expert academic advisor analyzing syllabus content for "${subjectName}".

STUDENT'S SYLLABUS DESCRIPTION:
"""
${conversation}
"""

TASK: Extract ALL topics/units/modules mentioned and intelligently prioritize them based on:
- Exam weightage (marks mentioned)
- Frequency in question papers (if mentioned)
- Explicit importance indicators ("high-priority", "critical", "frequently asked", etc.)
- Hours/time allocation mentioned
- Conceptual importance (core vs supporting topics)

OUTPUT (JSON ONLY - no markdown, no explanations):
{
  "topics": [
    {
      "name": "Concise Topic Name (e.g., MOSFET & CMOS Inverters)",
      "priority": "CRITICAL",
      "estimatedHours": 8,
      "reason": "Brief explanation (e.g., '15-20 marks every exam, Unit 2 core concept')",
      "weightage": "15-20 marks (if mentioned, otherwise null)"
    }
  ]
}

PRIORITY RULES:
- CRITICAL: 15-20 marks, "frequently asked", "always tested", "core foundation", or 8+ hours
- HIGH: 10-15 marks, "important", "common", or 5-7 hours  
- MEDIUM: 5-10 marks, "occasionally asked", or 3-4 hours
- LOW: Optional, rare, or <3 hours

TOPIC NAMING: Be specific but concise:
✅ "MOSFET & CMOS Inverters" 
✅ "Semiconductor Memories (SRAM/DRAM)"
❌ "Unit 2" (too vague)
❌ "Detailed analysis of MOSFET characteristics including threshold voltage, transconductance, body effect, channel length modulation..." (too detailed)

Return ONLY valid JSON. Extract ALL topics mentioned, even if many.`;

    console.log('🤖 Extracting topics with AI...');

    const result = await proModel.generateContent(prompt); // Use proModel for better reasoning
    const responseText = result.response.text();

    console.log('📝 AI Response:', responseText);

    // Parse JSON response (handle markdown code blocks)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Could not find JSON in response');
      console.error('Full response:', responseText);
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const topics = parsed.topics || [];

    console.log(`✅ Extracted ${topics.length} topics`);

    // Transform to app format
    return topics.map((topic, index) => ({
      id: `${subjectName.toLowerCase().replace(/\s+/g, '_')}_topic${Date.now()}_${index}`,
      name: topic.name,
      priority: topic.priority || 'MEDIUM',
      mastery: 0,
      estimatedHours: topic.estimatedHours || 3,
      co: `CO${index + 1}`,
      notes: topic.reason || '',
      weightage: topic.weightage || null
    }));
  } catch (error) {
    console.error('❌ Topic extraction error:', error);
    console.error('Error details:', error.message);
    return [];
  }
};

/**
 * Generate topic suggestions for a subject (if user doesn't provide details)
 * @param {string} subjectName - Subject name
 * @returns {Promise<array>} - Array of suggested topics
 */
export const generateDefaultTopics = async (subjectName) => {
  if (!isAIReady()) {
    return [];
  }

  try {
    const prompt = `Generate a standard topic list for "${subjectName}" course.

OUTPUT FORMAT (JSON only):
{
  "topics": [
    {
      "name": "Topic Name",
      "priority": "CRITICAL" | "HIGH" | "MEDIUM",
      "estimatedHours": <number>
    }
  ]
}

Generate 8-12 core topics that would typically be covered in this subject.
Return ONLY the JSON.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    const topics = parsed.topics || [];

    return topics.map((topic, index) => ({
      id: `${subjectName.toLowerCase().replace(/\s+/g, '_')}_topic${index + 1}`,
      name: topic.name,
      priority: topic.priority || 'MEDIUM',
      mastery: 0,
      estimatedHours: topic.estimatedHours || 3,
      co: `CO${index + 1}`
    }));
  } catch (error) {
    console.error('❌ Default topic generation error:', error);
    return [];
  }
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  initializeAI,
  setApiKey,
  isAIReady,
  chatWithLuna,
  generateDailyPlan,
  generateWeeklyPlan,
  getQuickSuggestion,
  getProgressReport,
  buildUserContext,
  // AI-powered topic extraction
  extractTopicsFromConversation,
  generateDefaultTopics,
  // Advanced features
  analyzeTopicDeep,
  generateRevisionSchedule,
  getMotivationalBoost,
  analyzeStudyPatterns,
  generatePracticeQuestions,
  explainConcept,
  getExamStrategy,
  // Analytics
  calculateLearningVelocity,
  identifyAtRiskSubjects
};
