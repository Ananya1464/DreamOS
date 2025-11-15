// ═══════════════════════════════════════════════════════════════
// CONVERSATION CARD 💬
// Individual conversation display with expand/collapse
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Sparkles, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  Tag,
  BookOpen,
  Copy,
  Check
} from 'lucide-react';
import { Card, Badge } from './UI';

export default function ConversationCard({ conversation, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  /**
   * Truncate text
   */
  const truncate = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  /**
   * Copy conversation to clipboard
   */
  const copyToClipboard = () => {
    const text = `You: ${conversation.userMessage}\n\nLuna: ${conversation.aiResponse}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Get subject color
   */
  const getSubjectColor = (subject) => {
    const colors = {
      'Verbal': '#FFB5C0',
      'Quant': '#80D6D6',
      'AWA': '#C5A3FF',
      'Physics': '#4CAF50',
      'Mathematics': '#2196F3',
      'Chemistry': '#FF9800',
    };
    return colors[subject] || '#9E9E9E';
  };

  const metadata = conversation.metadata || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card hover className="overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {/* Subject Badge */}
                {metadata.subject && (
                  <Badge 
                    variant="default"
                    style={{ 
                      backgroundColor: `${getSubjectColor(metadata.subject)}15`,
                      color: getSubjectColor(metadata.subject),
                      borderColor: getSubjectColor(metadata.subject)
                    }}
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    {metadata.subject}
                  </Badge>
                )}

                {/* Topic Badge */}
                {metadata.topic && (
                  <Badge variant="secondary">
                    <Tag className="w-3 h-3 mr-1" />
                    {metadata.topic}
                  </Badge>
                )}

                {/* Timestamp */}
                <span className="text-xs text-[#7A8A7D] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatTimestamp(conversation.timestamp)}
                </span>
              </div>

              {/* Question Preview */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#FFB5C0] bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#FFB5C0]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2D3436] mb-1">You asked:</p>
                  <p className="text-sm text-[#7A8A7D]">
                    {expanded ? conversation.userMessage : truncate(conversation.userMessage)}
                  </p>
                </div>
              </div>

              {/* Answer Preview */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C5A3FF] bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[#C5A3FF]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2D3436] mb-1">Luna responded:</p>
                  <p className="text-sm text-[#7A8A7D]">
                    {expanded ? conversation.aiResponse : truncate(conversation.aiResponse)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
                title="Copy conversation"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#4CAF50]" />
                ) : (
                  <Copy className="w-4 h-4 text-[#7A8A7D]" />
                )}
              </button>
              
              <button
                onClick={() => onDelete(conversation.id)}
                className="p-2 hover:bg-[#FFE5E8] rounded-lg transition-colors group"
                title="Delete conversation"
              >
                <Trash2 className="w-4 h-4 text-[#7A8A7D] group-hover:text-[#FF6B6B]" />
              </button>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          {(conversation.userMessage?.length > 150 || conversation.aiResponse?.length > 150) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-2 py-2 mt-4 text-sm font-medium text-[#C5A3FF] hover:bg-[#C5A3FF] hover:bg-opacity-5 rounded-lg transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Full Conversation
                </>
              )}
            </button>
          )}

          {/* Full Conversation (Expanded) */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-[#E0E0E0]"
              >
                {/* Full Metadata */}
                {metadata && (
                  <div className="bg-[#F5F5F5] rounded-lg p-4 mb-4 text-sm">
                    <h4 className="font-bold text-[#2D3436] mb-2">Conversation Metadata</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#7A8A7D]">
                      {metadata.subject && (
                        <div>
                          <span className="font-medium">Subject:</span> {metadata.subject}
                        </div>
                      )}
                      {metadata.topic && (
                        <div>
                          <span className="font-medium">Topic:</span> {metadata.topic}
                        </div>
                      )}
                      {metadata.difficulty && (
                        <div>
                          <span className="font-medium">Difficulty:</span> {metadata.difficulty}
                        </div>
                      )}
                      {conversation.timestamp && (
                        <div>
                          <span className="font-medium">Full Date:</span>{' '}
                          {new Date(conversation.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sentiment Analysis (Future Feature) */}
                {metadata.sentiment && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-[#2D3436] mb-2">Sentiment Analysis</h4>
                    <div className="flex gap-2">
                      {metadata.sentiment === 'positive' && (
                        <Badge variant="success">😊 Positive</Badge>
                      )}
                      {metadata.sentiment === 'neutral' && (
                        <Badge variant="default">😐 Neutral</Badge>
                      )}
                      {metadata.sentiment === 'confused' && (
                        <Badge variant="warning">🤔 Needs Clarification</Badge>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
