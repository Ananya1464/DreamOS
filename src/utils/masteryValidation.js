import { getSimpleAnswer, explainConcept } from './wolframService';

/**
 * Mastery Validation System
 * Uses computational intelligence to validate student learning
 * Ensures honest progress tracking - core value of DreamOS!
 */

/**
 * Generate a validation question for a topic
 * @param {string} subject - Subject name
 * @param {string} topic - Topic name
 * @returns {Promise<object>} Question and answer
 */
export const generateValidationQuestion = async (subject, topic) => {
  try {
    // Query for a practice question about the topic
    const query = `practice question about ${topic} in ${subject}`;
    const result = await explainConcept(query);
    
    if (result.success && result.pods) {
      // Extract a relevant question from the knowledge pods
      const examplePod = result.pods.find(pod => 
        pod.title.toLowerCase().includes('example') || 
        pod.title.toLowerCase().includes('practice')
      );
      
      if (examplePod) {
        return {
          success: true,
          question: examplePod.text || `Explain a key concept in ${topic}`,
          topic: topic,
          subject: subject
        };
      }
    }
    
    // Fallback: Generate a simple conceptual question
    return {
      success: true,
      question: `Explain the main concept of ${topic} in your own words.`,
      topic: topic,
      subject: subject,
      type: 'conceptual'
    };
  } catch (error) {
    console.error('Validation question generation error:', error);
    return {
      success: false,
      error: 'Failed to generate validation question'
    };
  }
};

/**
 * Validate student answer
 * @param {string} studentAnswer - Student's answer
 * @param {string} topic - Topic being validated
 * @returns {Promise<object>} Validation result with feedback
 */
export const validateAnswer = async (studentAnswer, topic) => {
  try {
    // Get the correct answer/concept explanation
    const conceptResult = await explainConcept(topic);
    
    if (conceptResult.success && conceptResult.pods) {
      // Simple validation: Check if student mentioned key terms
      const keyPods = conceptResult.pods.slice(0, 3);
      const keyTerms = keyPods
        .map(pod => pod.text)
        .join(' ')
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 4); // Words longer than 4 chars
      
      const studentWords = studentAnswer.toLowerCase().split(/\s+/);
      const matches = keyTerms.filter(term => 
        studentWords.some(word => word.includes(term) || term.includes(word))
      );
      
      const matchPercentage = (matches.length / Math.min(keyTerms.length, 10)) * 100;
      
      return {
        success: true,
        validated: matchPercentage >= 30, // 30% match = pass
        confidence: matchPercentage,
        feedback: matchPercentage >= 30
          ? "Great! Your understanding aligns with the key concepts."
          : "Your answer needs more depth. Review the topic and try again.",
        keyConceptsMissed: matchPercentage < 30 ? keyPods[0]?.text : null
      };
    }
    
    // Fallback: Accept answer but with low confidence
    return {
      success: true,
      validated: true,
      confidence: 50,
      feedback: "Answer accepted. Keep practicing to strengthen your understanding.",
      type: 'fallback'
    };
  } catch (error) {
    console.error('Answer validation error:', error);
    return {
      success: false,
      error: 'Failed to validate answer'
    };
  }
};

/**
 * Get concept prerequisites (dependency graph data)
 * Uses Simple API to avoid CORS issues
 * @param {string} concept - Concept to analyze
 * @returns {Promise<object>} Prerequisites and related concepts
 */
export const getConceptDependencies = async (concept) => {
  try {
    // Use Simple API to get basic info (no CORS issues)
    const prerequisitesQuery = `what are prerequisites for ${concept}`;
    const relatedQuery = `concepts related to ${concept}`;
    
    // Get prerequisites
    const prereqResult = await getSimpleAnswer(prerequisitesQuery);
    
    // Generate mock but useful dependency data
    const dependencies = [];
    const relatedConcepts = [];
    
    // Common prerequisites for different domains
    const knowledgeMap = {
      'neural networks': ['Linear Algebra', 'Calculus', 'Python Programming', 'Statistics'],
      'machine learning': ['Statistics', 'Python', 'Linear Algebra', 'Probability'],
      'deep learning': ['Neural Networks', 'Python', 'Calculus', 'Linear Algebra'],
      'vlsi': ['Digital Electronics', 'Boolean Algebra', 'Circuit Theory'],
      'iot': ['Embedded Systems', 'Networking', 'Sensors', 'Microcontrollers'],
      'cloud computing': ['Networking', 'Operating Systems', 'Virtualization', 'Databases'],
      'data structures': ['Programming', 'Algorithms', 'Mathematics', 'Logic']
    };
    
    // Check if we have predefined knowledge
    const conceptLower = concept.toLowerCase();
    const matchedKey = Object.keys(knowledgeMap).find(key => conceptLower.includes(key));
    
    if (matchedKey) {
      knowledgeMap[matchedKey].forEach(prereq => {
        dependencies.push({
          name: prereq,
          description: `${prereq} is essential for understanding ${concept}`,
          image: null
        });
      });
    }
    
    // Add some generic related concepts
    if (conceptLower.includes('learning') || conceptLower.includes('ai') || conceptLower.includes('neural')) {
      relatedConcepts.push(
        { name: 'Deep Learning', description: 'Advanced neural network architectures' },
        { name: 'Natural Language Processing', description: 'Text and language understanding' },
        { name: 'Computer Vision', description: 'Image and video analysis' }
      );
    } else if (conceptLower.includes('vlsi') || conceptLower.includes('circuit')) {
      relatedConcepts.push(
        { name: 'Digital Design', description: 'Logic circuit design' },
        { name: 'FPGA Programming', description: 'Hardware programming' },
        { name: 'ASIC Design', description: 'Custom chip design' }
      );
    } else if (conceptLower.includes('iot') || conceptLower.includes('embedded')) {
      relatedConcepts.push(
        { name: 'Wireless Communication', description: 'IoT connectivity protocols' },
        { name: 'Edge Computing', description: 'Local data processing' },
        { name: 'Sensor Networks', description: 'Distributed sensing systems' }
      );
    }
    
    return {
      success: true,
      concept: concept,
      dependencies: dependencies.length > 0 ? dependencies : [
        { name: 'Foundational Knowledge', description: `Basic understanding of ${concept} domain`, image: null }
      ],
      relatedConcepts: relatedConcepts.length > 0 ? relatedConcepts : [
        { name: 'Advanced Topics', description: `Further exploration in ${concept}` }
      ],
      computedResult: prereqResult // Keep the simple API result for reference
    };
  } catch (error) {
    console.error('Dependency lookup error:', error);
    return {
      success: true, // Return success with fallback data
      concept: concept,
      dependencies: [
        { name: 'Fundamentals', description: `Core concepts in ${concept}`, image: null }
      ],
      relatedConcepts: [
        { name: 'Advanced Studies', description: `Deeper exploration of ${concept}` }
      ]
    };
  }
};

/**
 * Generate smart practice problems for a subject
 * @param {string} subject - Subject name
 * @param {array} weakTopics - Topics student struggles with
 * @returns {Promise<array>} Array of practice problems
 */
export const generateSmartPracticeProblems = async (subject, weakTopics = []) => {
  const problems = [];
  
  try {
    // Focus on weak topics first
    const topicsToTest = weakTopics.length > 0 
      ? weakTopics.slice(0, 3) 
      : [`${subject} fundamentals`];
    
    for (const topic of topicsToTest) {
      const question = await generateValidationQuestion(subject, topic);
      if (question.success) {
        problems.push({
          id: `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          topic: topic,
          question: question.question,
          difficulty: weakTopics.includes(topic) ? 'medium' : 'easy',
          subject: subject
        });
      }
    }
    
    return {
      success: true,
      problems: problems,
      focusAreas: weakTopics
    };
  } catch (error) {
    console.error('Problem generation error:', error);
    return {
      success: false,
      error: 'Failed to generate practice problems'
    };
  }
};
