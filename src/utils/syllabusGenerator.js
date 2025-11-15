// ═══════════════════════════════════════════════════════════════
// SYLLABUS GENERATOR - AI-Powered Topic List Generator 📚
// Generates topics based on hours, CO mappings, and exam patterns
// ═══════════════════════════════════════════════════════════════

import { initializeAI, isAIReady } from './ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generate complete syllabus/topic list for a subject
 * @param {object} subjectData - Subject information
 * @returns {Promise<object>} - Generated topics with hours, COs, priorities
 */
export const generateSyllabus = async (subjectData) => {
  const { name, totalHours, examDate, targetScore, coMappings, additionalInfo } = subjectData;
  
  if (!isAIReady()) {
    return {
      success: false,
      message: "AI not initialized. Add API key in Settings."
    };
  }
  
  try {
    const daysUntilExam = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    const apiKey = localStorage.getItem('gemini_api_key');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 30,
        topP: 0.9,
        maxOutputTokens: 3000,
      }
    });
    
    const prompt = `You are an expert academic syllabus analyzer. Generate a comprehensive topic breakdown for exam preparation.

SUBJECT: ${name}
TOTAL HOURS AVAILABLE: ${totalHours} hours
EXAM DATE: ${examDate} (${daysUntilExam} days away)
TARGET SCORE: ${targetScore}
${coMappings ? `CO MAPPINGS: ${JSON.stringify(coMappings)}` : ''}
${additionalInfo ? `ADDITIONAL INFO: ${additionalInfo}` : ''}

Generate a complete topic list with the following JSON structure:

{
  "topics": [
    {
      "name": "Topic name",
      "hours": number (allocated hours based on importance),
      "cos": ["CO1", "CO2"] (relevant course outcomes),
      "priority": "CRITICAL" | "HIGH" | "NORMAL" | "OPTIONAL",
      "examWeight": number (estimated % of exam marks),
      "difficulty": "Easy" | "Medium" | "Hard",
      "dependencies": ["Other topic names this depends on"],
      "subtopics": ["Subtopic 1", "Subtopic 2"],
      "studyTips": "Brief study strategy",
      "expectedQuestions": number (likely questions in exam)
    }
  ],
  "studyStrategy": "Overall approach to tackle this subject",
  "criticalPath": ["Topic order for optimal learning"],
  "timeAllocation": {
    "learning": percentage,
    "revision": percentage,
    "practice": percentage
  }
}

INSTRUCTIONS:
1. Allocate hours based on:
   - Topic complexity
   - Exam weight (questions asked)
   - CO mappings (frequently tested outcomes)
   - Prerequisites and dependencies

2. Mark CRITICAL topics:
   - High exam weight (>15%)
   - Multiple CO mappings
   - Foundation topics (needed for others)

3. Ensure total hours ≤ ${totalHours}

4. Provide realistic time estimates

5. Order topics by:
   - Dependencies (prerequisites first)
   - Exam proximity (urgent topics)
   - Difficulty (foundation → advanced)

Return ONLY valid JSON, no markdown or explanations.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText;
    if (responseText.includes('```json')) {
      jsonText = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('```')) {
      jsonText = responseText.split('```')[1].split('```')[0].trim();
    }
    
    const syllabusData = JSON.parse(jsonText);
    
    // Add metadata
    syllabusData.generatedAt = new Date().toISOString();
    syllabusData.subjectName = name;
    syllabusData.totalHours = totalHours;
    
    return {
      success: true,
      syllabus: syllabusData
    };
  } catch (error) {
    console.error('❌ Syllabus generation error:', error);
    return {
      success: false,
      message: "Failed to generate syllabus. Try again or add topics manually.",
      error: error.message
    };
  }
};

/**
 * Generate revision schedule based on topics
 * @param {array} topics - List of topics
 * @param {string} examDate - Exam date
 * @returns {object} - Revision schedule
 */
export const generateRevisionSchedule = (topics, examDate) => {
  const daysUntilExam = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  // Calculate total study hours
  const totalHours = topics.reduce((sum, t) => sum + (t.hours || 0), 0);
  
  // Allocate time phases
  const learningPhase = Math.floor(daysUntilExam * 0.6); // 60% for learning
  const revisionPhase = Math.floor(daysUntilExam * 0.3); // 30% for revision
  const finalPhase = daysUntilExam - learningPhase - revisionPhase; // 10% final prep
  
  const schedule = {
    phases: {
      learning: {
        days: learningPhase,
        hoursPerDay: Math.ceil(totalHours / learningPhase),
        focus: "Complete all topics, take detailed notes"
      },
      revision: {
        days: revisionPhase,
        hoursPerDay: 4,
        cycles: ['R1', 'R2', 'R3'],
        focus: "Revise all topics 3 times with increasing speed"
      },
      final: {
        days: finalPhase,
        hoursPerDay: 3,
        focus: "Quick revision, practice tests, important formulas"
      }
    },
    topicSchedule: []
  };
  
  // Create day-by-day schedule
  let currentDay = 0;
  let remainingTopics = [...topics].sort((a, b) => {
    // Sort by priority, then dependencies
    const priorityOrder = { CRITICAL: 0, HIGH: 1, NORMAL: 2, OPTIONAL: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  remainingTopics.forEach(topic => {
    const startDay = currentDay;
    const endDay = currentDay + Math.ceil(topic.hours / schedule.phases.learning.hoursPerDay);
    
    schedule.topicSchedule.push({
      topic: topic.name,
      phase: 'learning',
      startDay,
      endDay,
      hours: topic.hours,
      revisionDates: {
        r1: new Date(Date.now() + (endDay + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        r2: new Date(Date.now() + (endDay + 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        r3: new Date(Date.now() + (daysUntilExam - 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    });
    
    currentDay = endDay;
  });
  
  return schedule;
};

/**
 * Analyze topic importance based on exam patterns
 * @param {string} topicName - Topic name
 * @param {object} examData - Historical exam data
 * @returns {object} - Importance analysis
 */
export const analyzeTopicImportance = (topicName, examData) => {
  // This would analyze past exam patterns
  // For now, return estimated importance
  return {
    examWeight: Math.floor(Math.random() * 25) + 5, // 5-30%
    frequencyScore: Math.floor(Math.random() * 10) + 1, // 1-10
    recommendedHours: Math.floor(Math.random() * 8) + 2 // 2-10 hours
  };
};

export default {
  generateSyllabus,
  generateRevisionSchedule,
  analyzeTopicImportance
};
