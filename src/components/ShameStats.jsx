// ═══════════════════════════════════════════════════════════════
// SHAME STATS DASHBOARD 💀
// Shows brutal truth about saved vs watched content
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Instagram, Youtube, TrendingDown, TrendingUp, ExternalLink, Trash2 } from 'lucide-react';
import { Card, Badge } from './UI';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShameStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, unwatched, oldest

  useEffect(() => {
    loadStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Load stats from extension or localStorage
   */
  const loadStats = () => {
    // Try to get from extension (if available)
    if (window.chrome && chrome.runtime) {
      try {
        chrome.runtime.sendMessage(
          'your-extension-id', // Replace with actual extension ID
          { type: 'GET_STATS' },
          (response) => {
            if (response && response.success) {
              setStats(response.stats);
              setLoading(false);
            } else {
              loadFromLocalStorage();
            }
          }
        );
      } catch (error) {
        loadFromLocalStorage();
      }
    } else {
      loadFromLocalStorage();
    }
  };

  /**
   * Fallback: load from localStorage
   */
  const loadFromLocalStorage = () => {
    const savedStats = localStorage.getItem('content_tracker_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    setLoading(false);
  };

  /**
   * Calculate watch rate
   */
  const getWatchRate = (watched, total) => {
    if (total === 0) return 0;
    return Math.round((watched / total) * 100);
  };

  /**
   * Get shame message
   */
  const getShameMessage = (watchRate) => {
    if (watchRate >= 80) return { emoji: '🎉', text: 'Amazing! You actually watch what you save!', color: '#4CAF50' };
    if (watchRate >= 60) return { emoji: '👍', text: 'Pretty good! But there\'s room for improvement.', color: '#80D6D6' };
    if (watchRate >= 40) return { emoji: '😬', text: 'You\'re saving more than you\'re watching...', color: '#FFB5C0' };
    if (watchRate >= 20) return { emoji: '🙈', text: 'This is getting embarrassing...', color: '#FF9800' };
    return { emoji: '💀', text: 'You have a serious hoarding problem!', color: '#FF6B6B' };
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-[#FFB5C0] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#7A8A7D]">Loading shame stats...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!stats || stats.totalSaved === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-[#2D3436] mb-2">No Content Tracked Yet</h2>
            <p className="text-[#7A8A7D] mb-6">
              Install the Brutal Learning OS Chrome Extension to start tracking your saved content.
            </p>
            <div className="bg-[#FFF5F7] rounded-lg p-6 max-w-md mx-auto text-left">
              <h3 className="font-bold text-[#2D3436] mb-3">📥 Installation Steps:</h3>
              <ol className="space-y-2 text-sm text-[#7A8A7D]">
                <li>1. Open Chrome and go to <code className="bg-white px-2 py-1 rounded">chrome://extensions</code></li>
                <li>2. Enable "Developer mode" (top right toggle)</li>
                <li>3. Click "Load unpacked"</li>
                <li>4. Select the <code className="bg-white px-2 py-1 rounded">extension</code> folder</li>
                <li>5. Visit Instagram Saved or YouTube Watch Later</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const totalWatched = stats.totalWatched || 0;
  const totalSaved = stats.totalSaved || 0;
  const watchRate = getWatchRate(totalWatched, totalSaved);
  const shameData = getShameMessage(watchRate);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D3436] mb-2">Content Shame Stats 💀</h1>
          <p className="text-[#7A8A7D]">The brutal truth about what you save vs what you actually watch</p>
        </div>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-white border border-[#E0E0E0] rounded-lg hover:bg-[#F5F5F5] transition-colors text-sm font-medium text-[#7A8A7D]"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Shame Zone - Big Watch Rate */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          gradient
          style={{
            background: `linear-gradient(135deg, ${shameData.color}15 0%, ${shameData.color}25 100%)`,
            borderLeft: `6px solid ${shameData.color}`
          }}
        >
          <div className="text-center py-8">
            <div className="text-6xl mb-4">{shameData.emoji}</div>
            <div className="text-7xl font-bold mb-4" style={{ color: shameData.color }}>
              {watchRate}%
            </div>
            <h2 className="text-2xl font-bold text-[#2D3436] mb-2">Your Watch Rate</h2>
            <p className="text-lg text-[#7A8A7D] mb-6">{shameData.text}</p>
            
            <div className="max-w-md mx-auto">
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    watchRate >= 60 ? 'bg-green-500' : watchRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${watchRate}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-6 text-sm">
              <div>
                <span className="text-2xl font-bold text-[#4CAF50]">{totalWatched}</span>
                <p className="text-[#7A8A7D]">Watched</p>
              </div>
              <div className="text-3xl text-[#E0E0E0]">÷</div>
              <div>
                <span className="text-2xl font-bold text-[#FF6B6B]">{totalSaved}</span>
                <p className="text-[#7A8A7D]">Saved</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Platform Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instagram Stats */}
        <Card gradient className="border-l-4 border-[#E1306C]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#E1306C] bg-opacity-10 flex items-center justify-center">
              <Instagram className="w-6 h-6 text-[#E1306C]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#2D3436]">Instagram</h3>
              <p className="text-sm text-[#7A8A7D]">Saved posts & reels</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#E1306C]">{stats.instagram?.total || 0}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#7A8A7D]">Watched</span>
              <span className="text-lg font-bold text-[#4CAF50]">✅ {stats.instagram?.watched || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#7A8A7D]">Unwatched</span>
              <span className="text-lg font-bold text-[#FF6B6B]">⏳ {stats.instagram?.unwatched || 0}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${getWatchRate(stats.instagram?.watched || 0, stats.instagram?.total || 0)}%` }}
              />
            </div>
            <div className="text-xs text-center text-gray-600 mt-1">
              {getWatchRate(stats.instagram?.watched || 0, stats.instagram?.total || 0)}% watched
            </div>
          </div>
        </Card>

        {/* YouTube Stats */}
        <Card gradient className="border-l-4 border-[#FF0000]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#FF0000] bg-opacity-10 flex items-center justify-center">
              <Youtube className="w-6 h-6 text-[#FF0000]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#2D3436]">YouTube</h3>
              <p className="text-sm text-[#7A8A7D]">Watch Later videos</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#FF0000]">{stats.youtube?.total || 0}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#7A8A7D]">Watched</span>
              <span className="text-lg font-bold text-[#4CAF50]">✅ {stats.youtube?.watched || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#7A8A7D]">Unwatched</span>
              <span className="text-lg font-bold text-[#FF6B6B]">⏳ {stats.youtube?.unwatched || 0}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${getWatchRate(stats.youtube?.watched || 0, stats.youtube?.total || 0)}%` }}
              />
            </div>
            <div className="text-xs text-center text-gray-600 mt-1">
              {getWatchRate(stats.youtube?.watched || 0, stats.youtube?.total || 0)}% watched
            </div>
          </div>
        </Card>
      </div>

      {/* Action Required Banner (if watch rate < 50%) */}
      {watchRate < 50 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-[#FF6B6B] to-[#FF9800] rounded-lg p-6 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Action Required!</h3>
              <p className="text-white text-opacity-90">
                You have {totalSaved - totalWatched} unwatched items piling up. 
                Stop saving and start watching! Or just admit you'll never watch them 😅
              </p>
            </div>
            <button className="bg-white text-[#FF6B6B] px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all">
              Clear Backlog
            </button>
          </div>
        </motion.div>
      )}

      {/* Last Sync Info */}
      {stats.lastSync && (
        <div className="text-center text-sm text-[#7A8A7D]">
          Last synced: {new Date(stats.lastSync).toLocaleString()}
        </div>
      )}
    </div>
  );
}
