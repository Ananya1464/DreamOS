// ═══════════════════════════════════════════════════════════════
// MEMORY MANAGEMENT DASHBOARD 🧠
// View, search, export, and manage Luna AI's conversation history
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { 
  Brain, 
  Search, 
  Download, 
  Trash2, 
  Filter, 
  Calendar,
  MessageSquare,
  Tag,
  TrendingUp,
  Database,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge } from './UI';
import ConversationCard from './ConversationCard';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const MEMORY_KEY = 'agent_conversations';

export default function MemoryDashboard() {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, relevance
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    filterAndSortConversations();
  }, [conversations, searchQuery, selectedSubject, selectedTopic, sortBy]);

  /**
   * Load conversations from storage
   */
  const loadConversations = async () => {
    setLoading(true);
    
    try {
      // Try to load from Pinecone first (future feature)
      // For now, load from localStorage
      const stored = loadFromStorage(MEMORY_KEY, []);
      
      setConversations(stored);
      calculateStats(stored);
      
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
    
    setLoading(false);
  };

  /**
   * Calculate memory stats
   */
  const calculateStats = (convos) => {
    const subjects = new Set();
    const topics = new Set();
    let totalMessages = 0;
    
    convos.forEach(conv => {
      if (conv.metadata?.subject) subjects.add(conv.metadata.subject);
      if (conv.metadata?.topic) topics.add(conv.metadata.topic);
      totalMessages += 2; // User + AI message
    });

    setStats({
      totalConversations: convos.length,
      uniqueSubjects: subjects.size,
      uniqueTopics: topics.size,
      totalMessages: totalMessages,
      storageSize: calculateStorageSize(convos)
    });
  };

  /**
   * Calculate approximate storage size
   */
  const calculateStorageSize = (convos) => {
    const jsonString = JSON.stringify(convos);
    const bytes = new Blob([jsonString]).size;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  /**
   * Filter and sort conversations
   */
  const filterAndSortConversations = () => {
    let filtered = [...conversations];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.userMessage?.toLowerCase().includes(query) ||
        conv.aiResponse?.toLowerCase().includes(query) ||
        conv.metadata?.subject?.toLowerCase().includes(query) ||
        conv.metadata?.topic?.toLowerCase().includes(query)
      );
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(conv => 
        conv.metadata?.subject === selectedSubject
      );
    }

    // Topic filter
    if (selectedTopic !== 'all') {
      filtered = filtered.filter(conv => 
        conv.metadata?.topic === selectedTopic
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sortBy === 'date-asc') {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
      return 0; // Relevance sorting would require more complex logic
    });

    setFilteredConversations(filtered);
  };

  /**
   * Get unique subjects for filter
   */
  const getUniqueSubjects = () => {
    const subjects = new Set();
    conversations.forEach(conv => {
      if (conv.metadata?.subject) subjects.add(conv.metadata.subject);
    });
    return Array.from(subjects).sort();
  };

  /**
   * Get unique topics for filter
   */
  const getUniqueTopics = () => {
    const topics = new Set();
    conversations.forEach(conv => {
      if (conv.metadata?.topic) topics.add(conv.metadata.topic);
    });
    return Array.from(topics).sort();
  };

  /**
   * Delete a conversation
   */
  const deleteConversation = (conversationId) => {
    const updated = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updated);
    saveToStorage(MEMORY_KEY, updated);
    calculateStats(updated);
    setShowDeleteModal(false);
    setConversationToDelete(null);
  };

  /**
   * Delete all conversations
   */
  const deleteAllConversations = () => {
    if (window.confirm('⚠️ Are you sure? This will delete ALL conversation history permanently!')) {
      setConversations([]);
      saveToStorage(MEMORY_KEY, []);
      calculateStats([]);
    }
  };

  /**
   * Export conversations as JSON
   */
  const exportAsJSON = () => {
    const dataStr = JSON.stringify(conversations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luna-conversations-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Export conversations as CSV
   */
  const exportAsCSV = () => {
    const headers = ['Timestamp', 'Subject', 'Topic', 'Your Question', 'Luna\'s Response'];
    const rows = conversations.map(conv => [
      new Date(conv.timestamp).toLocaleString(),
      conv.metadata?.subject || '',
      conv.metadata?.topic || '',
      `"${conv.userMessage?.replace(/"/g, '""') || ''}"`,
      `"${conv.aiResponse?.replace(/"/g, '""') || ''}"`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luna-conversations-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-[#C5A3FF] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#7A8A7D]">Loading memory...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D3436] mb-2 flex items-center gap-3">
            <Brain className="w-8 h-8 text-[#C5A3FF]" />
            Memory Management
          </h1>
          <p className="text-[#7A8A7D]">View and manage Luna AI's conversation history</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportAsJSON}
            className="px-4 py-2 bg-white border border-[#E0E0E0] rounded-lg hover:bg-[#F5F5F5] transition-colors text-sm font-medium text-[#7A8A7D] flex items-center gap-2"
            disabled={conversations.length === 0}
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
          <button
            onClick={exportAsCSV}
            className="px-4 py-2 bg-white border border-[#E0E0E0] rounded-lg hover:bg-[#F5F5F5] transition-colors text-sm font-medium text-[#7A8A7D] flex items-center gap-2"
            disabled={conversations.length === 0}
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={deleteAllConversations}
            className="px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors text-sm font-medium flex items-center gap-2"
            disabled={conversations.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card gradient className="border-l-4 border-[#C5A3FF]">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-[#C5A3FF]" />
              <div>
                <p className="text-sm text-[#7A8A7D]">Conversations</p>
                <p className="text-2xl font-bold text-[#C5A3FF]">{stats.totalConversations}</p>
              </div>
            </div>
          </Card>

          <Card gradient className="border-l-4 border-[#80D6D6]">
            <div className="flex items-center gap-3">
              <Tag className="w-8 h-8 text-[#80D6D6]" />
              <div>
                <p className="text-sm text-[#7A8A7D]">Subjects</p>
                <p className="text-2xl font-bold text-[#80D6D6]">{stats.uniqueSubjects}</p>
              </div>
            </div>
          </Card>

          <Card gradient className="border-l-4 border-[#FFB5C0]">
            <div className="flex items-center gap-3">
              <Tag className="w-8 h-8 text-[#FFB5C0]" />
              <div>
                <p className="text-sm text-[#7A8A7D]">Topics</p>
                <p className="text-2xl font-bold text-[#FFB5C0]">{stats.uniqueTopics}</p>
              </div>
            </div>
          </Card>

          <Card gradient className="border-l-4 border-[#4CAF50]">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-[#4CAF50]" />
              <div>
                <p className="text-sm text-[#7A8A7D]">Messages</p>
                <p className="text-2xl font-bold text-[#4CAF50]">{stats.totalMessages}</p>
              </div>
            </div>
          </Card>

          <Card gradient className="border-l-4 border-[#9E9E9E]">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-[#9E9E9E]" />
              <div>
                <p className="text-sm text-[#7A8A7D]">Storage</p>
                <p className="text-xl font-bold text-[#9E9E9E]">{stats.storageSize}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7A8A7D]" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A3FF] focus:border-transparent"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A3FF] focus:border-transparent"
          >
            <option value="all">All Subjects</option>
            {getUniqueSubjects().map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A3FF] focus:border-transparent"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
          </select>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedSubject !== 'all' || selectedTopic !== 'all') && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#E0E0E0]">
            <span className="text-sm text-[#7A8A7D]">Active filters:</span>
            {searchQuery && (
              <Badge variant="default">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-2">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {selectedSubject !== 'all' && (
              <Badge variant="default">
                Subject: {selectedSubject}
                <button onClick={() => setSelectedSubject('all')} className="ml-2">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setSelectedTopic('all');
              }}
              className="text-sm text-[#FF6B6B] hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#7A8A7D]">
          Showing {filteredConversations.length} of {conversations.length} conversations
        </p>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-[#E0E0E0] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#2D3436] mb-2">
              {conversations.length === 0 ? 'No Conversations Yet' : 'No Results Found'}
            </h3>
            <p className="text-[#7A8A7D] mb-4">
              {conversations.length === 0 
                ? 'Start chatting with Luna AI to build conversation history'
                : 'Try adjusting your search or filters'
              }
            </p>
            {conversations.length === 0 && (
              <button
                onClick={() => window.location.hash = '#agent'}
                className="px-6 py-3 bg-gradient-to-r from-[#C5A3FF] to-[#80D6D6] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Chat with Luna
              </button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredConversations.map((conversation, index) => (
              <ConversationCard
                key={conversation.id || index}
                conversation={conversation}
                onDelete={(id) => {
                  setConversationToDelete(id);
                  setShowDeleteModal(true);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FF6B6B] bg-opacity-10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-[#FF6B6B]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2D3436]">Delete Conversation?</h3>
                  <p className="text-sm text-[#7A8A7D]">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-[#7A8A7D] mb-6">
                Are you sure you want to delete this conversation? It will be permanently removed from your memory.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-[#E0E0E0] rounded-lg hover:bg-[#F5F5F5] transition-colors font-medium text-[#7A8A7D]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConversation(conversationToDelete)}
                  className="flex-1 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
