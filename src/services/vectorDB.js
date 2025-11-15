// Pinecone Vector Database Service - Long-term conversational memory
import { Pinecone } from '@pinecone-database/pinecone';
import { generateQueryEmbedding, prepareConversationForStorage } from './embeddings';

let pineconeClient = null;
let index = null;

const PINECONE_INDEX_NAME = 'dreamos-memory'; // You'll create this in Pinecone dashboard
const PINECONE_DIMENSION = 768; // Google text-embedding-004 dimension

/**
 * Initialize Pinecone client
 */
export const initializePinecone = async () => {
  try {
    const apiKey = import.meta.env.VITE_PINECONE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ Pinecone API key not found - RAG memory disabled');
      return false;
    }

    pineconeClient = new Pinecone({
      apiKey: apiKey,
    });

    // Get or create index
    index = pineconeClient.index(PINECONE_INDEX_NAME);
    
    console.log('✅ Pinecone initialized - Luna has long-term memory!');
    return true;
  } catch (error) {
    console.error('❌ Pinecone initialization failed:', error);
    return false;
  }
};

/**
 * Store a conversation in Pinecone
 * @param {string} userMessage - What the user said
 * @param {string} aiResponse - Luna's response
 * @param {object} metadata - Context (subject, topic, etc.)
 */
export const storeConversation = async (userMessage, aiResponse, metadata = {}) => {
  if (!index) {
    console.warn('⚠️ Pinecone not initialized - skipping storage');
    return;
  }

  try {
    const record = await prepareConversationForStorage(userMessage, aiResponse, metadata);
    
    await index.upsert([record]);
    
    console.log('💾 Conversation stored in long-term memory');
  } catch (error) {
    console.error('❌ Failed to store conversation:', error);
  }
};

/**
 * Retrieve relevant past conversations based on current query
 * This is the RAG (Retrieval-Augmented Generation) magic! ✨
 * 
 * @param {string} query - Current user message
 * @param {number} topK - Number of relevant conversations to retrieve (default: 5)
 * @param {object} filter - Optional metadata filters (e.g., subject: "VLSI")
 * @returns {Promise<Array>} - Relevant past conversations
 */
export const retrieveRelevantConversations = async (query, topK = 5, filter = {}) => {
  if (!index) {
    console.warn('⚠️ Pinecone not initialized - no memory retrieval');
    return [];
  }

  try {
    // Convert query to embedding
    const queryEmbedding = await generateQueryEmbedding(query);
    
    // Search for similar conversations
    const results = await index.query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
      filter: Object.keys(filter).length > 0 ? filter : undefined
    });

    // Format results for easy use
    const relevantConversations = results.matches.map(match => ({
      score: match.score, // Similarity score (0-1)
      userMessage: match.metadata.userMessage,
      aiResponse: match.metadata.aiResponse,
      subject: match.metadata.subject,
      topic: match.metadata.topic,
      timestamp: match.metadata.timestamp,
      importance: match.metadata.importance
    }));

    console.log(`🧠 Retrieved ${relevantConversations.length} relevant memories (scores: ${relevantConversations.map(c => c.score.toFixed(2)).join(', ')})`);
    
    return relevantConversations;
  } catch (error) {
    console.error('❌ Failed to retrieve conversations:', error);
    return [];
  }
};

/**
 * Build context string from retrieved conversations
 * Use this to augment Luna's prompt with relevant history
 */
export const buildMemoryContext = (conversations) => {
  if (conversations.length === 0) {
    return '';
  }

  const contextLines = conversations.map((conv, idx) => {
    const timeAgo = getTimeAgo(conv.timestamp);
    return `
[Memory ${idx + 1} - ${timeAgo} ago, relevance: ${(conv.score * 100).toFixed(0)}%]
You discussed: ${conv.userMessage}
You responded: ${conv.aiResponse.substring(0, 200)}...
${conv.subject ? `Subject: ${conv.subject}` : ''}
${conv.topic ? `Topic: ${conv.topic}` : ''}
    `.trim();
  });

  return `
📚 RELEVANT PAST CONVERSATIONS:
${contextLines.join('\n\n')}

Based on these past conversations, provide a response that:
1. Acknowledges what the user has learned before
2. Builds on previous discussions
3. Identifies patterns in their learning (struggles, strengths)
4. Suggests reviews if they haven't revisited a topic in a while

---
  `.trim();
};

/**
 * Get human-readable time ago
 */
const getTimeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffMs / 604800000);

  if (diffMins < 60) return `${diffMins} minutes`;
  if (diffHours < 24) return `${diffHours} hours`;
  if (diffDays < 7) return `${diffDays} days`;
  return `${diffWeeks} weeks`;
};

/**
 * Delete all conversations for a user (GDPR compliance)
 */
export const deleteUserConversations = async (userId) => {
  if (!index) return;
  
  try {
    await index.deleteMany({ userId });
    console.log('🗑️ User conversations deleted');
  } catch (error) {
    console.error('❌ Failed to delete conversations:', error);
  }
};

/**
 * Get conversation stats
 */
export const getMemoryStats = async () => {
  if (!index) return null;
  
  try {
    const stats = await index.describeIndexStats();
    return {
      totalVectors: stats.totalRecordCount,
      dimension: stats.dimension,
      indexFullness: stats.indexFullness
    };
  } catch (error) {
    console.error('❌ Failed to get stats:', error);
    return null;
  }
};

export { pineconeClient, index };
