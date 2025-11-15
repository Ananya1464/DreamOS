// ═══════════════════════════════════════════════════════════════
// FLOATING WOLFRAM BUTTON
// ═══════════════════════════════════════════════════════════════
// Quick access to Wolfram from anywhere in the app!

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, Sparkles, Zap } from 'lucide-react';
import { Card } from './UI';
import { getSimpleAnswer } from '../utils/wolframService';

const FloatingWolfram = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('wolfram_recent');
    return saved ? JSON.parse(saved) : [];
  });

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await getSimpleAnswer(query);
      
      if (response.success) {
        setResult(response);
        
        // Save to recent searches
        const newRecent = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('wolfram_recent', JSON.stringify(newRecent));
      } else {
        setError(response.error || 'No results found');
      }
    } catch (err) {
      setError('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleQuery();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-orange-500/50 transition-shadow"
        style={{ zIndex: 9999 }}
      >
        <Calculator className="w-7 h-7" />
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              style={{ zIndex: 9998 }}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
              style={{ zIndex: 9999 }}
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Quick Wolfram
                        <Sparkles className="w-5 h-5 text-orange-500" />
                      </h2>
                      <p className="text-sm text-gray-600">Instant computational answers</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask anything... e.g., integrate x^2"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                      autoFocus
                      disabled={loading}
                    />
                    <motion.button
                      onClick={handleQuery}
                      disabled={loading || !query.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          <Zap className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <Zap className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Recent Searches */}
                {recentSearches.length > 0 && !result && !error && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Recent:</p>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="text-xs px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg mb-4"
                  >
                    <p className="text-red-800 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Result */}
                {result && result.success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-bold text-orange-700">Result:</span>
                    </div>
                    {result.imageUrl && (
                      <img
                        src={result.imageUrl}
                        alt="Wolfram Result"
                        className="w-full rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          setError('Failed to load result image');
                        }}
                      />
                    )}
                  </motion.div>
                )}

                {/* Tips */}
                {!result && !error && !loading && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <p className="text-sm text-gray-700 font-medium mb-2">💡 Try asking:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• "solve x^2 + 5x + 6 = 0"</li>
                      <li>• "integrate sin(x)"</li>
                      <li>• "plot x^2"</li>
                      <li>• "speed of light"</li>
                    </ul>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t-2 border-gray-100 text-center">
                  <p className="text-xs text-gray-500">
                    Powered by <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Wolfram|Alpha</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Press ESC to close
                  </p>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ESC key handler */}
      {isOpen && (
        <div
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          tabIndex={-1}
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 10000 }}
        />
      )}
    </>
  );
};

export default FloatingWolfram;
