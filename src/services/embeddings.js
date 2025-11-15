// Embedding Service - Convert text to vectors using Google's embedding model
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Generate embeddings for text using Google's text-embedding-004 model
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Vector embedding (768 dimensions)
 */
export const generateEmbedding = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('❌ Embedding generation failed:', error);
    throw error;
  }
};

/**
 * Generate embeddings for a conversation message
 * Combines user message + AI response + metadata for richer context
 */
export const generateConversationEmbedding = async (userMessage, aiResponse, metadata = {}) => {
  const combinedText = `
User: ${userMessage}
Assistant: ${aiResponse}
Context: ${metadata.subject || ''} ${metadata.topic || ''}
Timestamp: ${metadata.timestamp || new Date().toISOString()}
  `.trim();
  
  return generateEmbedding(combinedText);
};

/**
 * Prepare conversation for storage in vector DB
 * @param {string} userMessage - User's message
 * @param {string} aiResponse - Luna's response
 * @param {object} metadata - Additional context (subject, topic, timestamp, etc.)
 * @returns {Promise<object>} - Ready-to-store vector record
 */
export const prepareConversationForStorage = async (userMessage, aiResponse, metadata = {}) => {
  const embedding = await generateConversationEmbedding(userMessage, aiResponse, metadata);
  
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    values: embedding,
    metadata: {
      userMessage,
      aiResponse,
      subject: metadata.subject || '',
      topic: metadata.topic || '',
      timestamp: metadata.timestamp || new Date().toISOString(),
      userId: metadata.userId || 'local',
      // Add sentiment/importance scoring later
      importance: metadata.importance || 'normal'
    }
  };
};

/**
 * Generate embedding for a search query
 * Use this to find relevant past conversations
 */
export const generateQueryEmbedding = async (query) => {
  return generateEmbedding(query);
};
