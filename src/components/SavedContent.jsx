import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Youtube, Clock, Calendar, TrendingDown, Eye, EyeOff, Trash2, CheckCircle2, Filter, RefreshCw } from 'lucide-react';
import { Card, Button, Badge, ProgressBar } from './UI';
import { getSavedContent, markAsWatched, deleteSavedItem } from '../services/savedContentService';
import INITIAL_DATA from '../data/initialData';

// ═══════════════════════════════════════════════════════════════
// SAVED CONTENT COMPONENT - CONTENT GRAVEYARD 💀
// ═══════════════════════════════════════════════════════════════
export default function SavedContent() {
  const [savedContent, setSavedContent] = useState({ instagram: [], youtube: [] });
  const [activeTab, setActiveTab] = useState('youtube'); // Start with youtube since we have YouTube integration
  const [filter, setFilter] = useState('all'); // 'all', 'watched', 'unwatched'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'age', 'duration'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load saved content from localStorage
  useEffect(() => {
    const loadContent = () => {
      const content = getSavedContent();
      // If no saved content yet, use demo data
      if (content.instagram.length === 0 && content.youtube.length === 0) {
        setSavedContent(INITIAL_DATA.savedContent);
      } else {
        setSavedContent(content);
      }
    };
    loadContent();
  }, []);

  // Refresh content (useful after YouTube import)
  const handleRefresh = () => {
    setIsRefreshing(true);
    const content = getSavedContent();
    setSavedContent(content);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Handle marking content as watched
  const handleMarkWatched = (itemId) => {
    markAsWatched(activeTab, itemId);
    const updatedContent = getSavedContent();
    setSavedContent(updatedContent);
  };

  // Handle deleting content
  const handleDelete = (itemId) => {
    deleteSavedItem(activeTab, itemId);
    const updatedContent = getSavedContent();
    setSavedContent(updatedContent);
  };


  // Calculate shame stats
  const calculateStats = () => {
    const allContent = [...savedContent.instagram, ...savedContent.youtube];
    const totalSaved = allContent.length;
    const watched = allContent.filter(item => item.watched).length;
    const watchedPercent = Math.round((watched / totalSaved) * 100);
    
    // Find oldest unwatched
    const unwatched = allContent.filter(item => !item.watched);
    const oldest = unwatched.sort((a, b) => new Date(a.savedDate) - new Date(b.savedDate))[0];
    
    // Calculate days ago
    const daysAgo = oldest ? Math.floor((new Date() - new Date(oldest.savedDate)) / (1000 * 60 * 60 * 24)) : 0;

    // Total time wasted on watched content
    const totalMinutes = allContent
      .filter(item => item.watched && item.duration)
      .reduce((sum, item) => sum + item.duration, 0);

    return { totalSaved, watched, watchedPercent, oldestUnwatched: oldest, daysAgo, totalMinutes };
  };

  const stats = calculateStats();

  // Get filtered and sorted content
  const getContent = () => {
    let content = activeTab === 'instagram' ? savedContent.instagram : savedContent.youtube;

    // Apply filter
    if (filter === 'watched') content = content.filter(item => item.watched);
    if (filter === 'unwatched') content = content.filter(item => !item.watched);

    // Apply sort
    if (sortBy === 'date') {
      content = [...content].sort((a, b) => new Date(b.savedDate) - new Date(a.savedDate));
    } else if (sortBy === 'age') {
      content = [...content].sort((a, b) => new Date(a.savedDate) - new Date(b.savedDate));
    } else if (sortBy === 'duration' && activeTab === 'youtube') {
      content = [...content].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    }

    return content;
  };

  const content = getContent();

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return 'Unknown';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Calculate days ago
  const getDaysAgo = (dateString) => {
    return Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-[#FDFCF6] p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#2D3436] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>Content Graveyard 💀</h1>
          <p className="text-[#7A8A7D]" style={{fontFamily: 'Caveat, cursive', fontSize: '18px'}}>Time to face the saved content you'll probably never watch...</p>
          
          {/* Real-time YouTube connection indicator */}
          {savedContent.youtube.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-2 border-red-200 flex items-center gap-3"
            >
              <Youtube className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  🎬 Connected to YouTube
                </p>
                <p className="text-xs text-gray-600">
                  {savedContent.youtube.length} videos imported from your liked videos • Real-time sync enabled
                </p>
              </div>
              <Badge className="bg-green-500 text-white">Live</Badge>
            </motion.div>
          )}
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            SHAME STATS BANNER - MAKE IT SCREAM! 🚨
            ═══════════════════════════════════════════════════════════════ */}
        {stats.daysAgo > 100 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-[#FF9B9B] to-[#FFB4A4] border-4 border-[#F5B5B5] shadow-2xl">
              <div className="text-center py-6">
                <div className="text-6xl mb-3 breathe">⚠️</div>
                <h2 className="text-5xl font-bold text-white mb-3" style={{fontFamily: 'Playfair Display, serif'}}>
                  YOUR OLDEST UNWATCHED POST:
                </h2>
                <div className="text-8xl font-black text-white mb-3 gentle-pulse">
                  {stats.daysAgo} DAYS OLD
                </div>
                <p className="text-2xl text-white font-semibold mb-2">💀 {stats.oldestUnwatched?.title} 💀</p>
                <p className="text-xl text-white/90" style={{fontFamily: 'Caveat, cursive'}}>
                  Stop hoarding. Start learning. Or just delete it. 🗑️
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Regular Shame Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-[#FFE5C8] via-[#FFD4C4] to-[#D4C5F9] border-2 border-[#FFAA8F]">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-[#8B5A3C] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>😅 Your Shame Stats</h2>
              <p className="text-[#A0725B]" style={{fontFamily: 'Caveat, cursive', fontSize: '18px'}}>Don't worry, we've all been there...</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Saved */}
              <div className="bg-white rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all hover:scale-105">
                <div className="text-5xl font-bold text-[#B5A3E5] mb-1 breathe">{stats.totalSaved}</div>
                <div className="text-sm text-[#7A8A7D] mb-2 font-semibold">Total Saved</div>
                <div className="text-xs text-[#9B8AA3]">Your collection</div>
              </div>

              {/* Watched Percentage */}
              <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all hover:scale-105">
                <div className={`text-5xl font-bold mb-1 text-center ${stats.watchedPercent > 50 ? 'text-[#7DD3C0]' : 'text-[#FFB4A4]'}`}>
                  {stats.watchedPercent}%
                </div>
                <div className="text-sm text-[#7A8A7D] mb-2 text-center font-semibold">Actually Watched</div>
                <ProgressBar 
                  progress={stats.watchedPercent} 
                  color={stats.watchedPercent > 50 ? '#7DD3C0' : '#FFB4A4'} 
                />
              </div>

              {/* Oldest Unwatched - SHAME FOCUS */}
              <div className="bg-gradient-to-br from-[#FFB4A4] to-[#FF9B9B] rounded-2xl p-4 text-center shadow-lg border-2 border-[#F5B5B5] gentle-pulse">
                <div className="text-6xl font-black text-white mb-1">{stats.daysAgo}</div>
                <div className="text-sm text-white mb-2 font-bold">DAYS AGO</div>
                <div className="text-xs text-white/90 font-semibold">Oldest unwatched 💀</div>
              </div>

              {/* Time Wasted */}
              <div className="bg-white rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all hover:scale-105">
                <div className="text-4xl font-bold text-[#FFAA8F] mb-1">{formatDuration(stats.totalMinutes)}</div>
                <div className="text-sm text-[#7A8A7D] mb-2 font-semibold">Time Spent</div>
                <div className="text-xs text-[#9B8AA3]">On watched content</div>
              </div>
            </div>

            {/* Motivational Message with more personality */}
            {stats.watchedPercent < 30 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="mt-6 p-5 bg-white rounded-2xl text-center shadow-md border-2 border-[#FFB4D1]"
              >
                <div className="text-3xl mb-2">🧹✨</div>
                <p className="text-base text-[#7A8A7D]" style={{fontFamily: 'Caveat, cursive', fontSize: '20px'}}>
                  <strong>Real talk:</strong> If you haven't watched it in {stats.daysAgo} days, you probably never will. 
                  Delete it and free your mind! Your future self will thank you. 💖
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            FILTERS & TABS
            ═══════════════════════════════════════════════════════════════ */}
        <div className="mb-6">
          <Card>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              
              {/* Platform Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('instagram')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === 'instagram'
                      ? 'bg-gradient-to-r from-[#FFE5D9] to-[#FFE5E8] text-[#FFB5C0] shadow-md'
                      : 'bg-[#F8F6ED] text-[#7A8A7D] hover:bg-white'
                  }`}
                >
                  <Instagram className="w-5 h-5" />
                  Instagram ({savedContent.instagram.length})
                </button>
                <button
                  onClick={() => setActiveTab('youtube')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === 'youtube'
                      ? 'bg-gradient-to-r from-[#FFE5E8] to-[#E6E3F5] text-[#FF9B9B] shadow-md'
                      : 'bg-[#F8F6ED] text-[#7A8A7D] hover:bg-white'
                  }`}
                >
                  <Youtube className="w-5 h-5" />
                  YouTube ({savedContent.youtube.length})
                </button>
                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-[#B5A3E5] to-[#D4C5F9] text-white hover:shadow-lg disabled:opacity-50"
                  title="Refresh saved content"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Syncing...' : 'Refresh'}
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-[#9B8AA3]" />
                
                {/* Watch Status Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 bg-[#F8F6ED] rounded-xl text-sm font-semibold text-[#7A8A7D] border-none focus:outline-none focus:ring-2 focus:ring-[#C5A3FF]/30"
                >
                  <option value="all">All Items</option>
                  <option value="watched">Watched</option>
                  <option value="unwatched">Unwatched</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-[#F8F6ED] rounded-xl text-sm font-semibold text-[#7A8A7D] border-none focus:outline-none focus:ring-2 focus:ring-[#C5A3FF]/30"
                >
                  <option value="date">Newest First</option>
                  <option value="age">Oldest First</option>
                  {activeTab === 'youtube' && <option value="duration">By Duration</option>}
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CONTENT GRID
            ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {content.map((item, index) => {
              const daysAgo = getDaysAgo(item.savedDate);
              const isOld = daysAgo > 30;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`h-full ${item.watched ? 'opacity-75' : ''} hover:shadow-lg transition-all`}>
                    {/* Thumbnail for YouTube videos */}
                    {item.thumbnail && activeTab === 'youtube' && (
                      <div className="mb-3 -mx-6 -mt-6 relative overflow-hidden rounded-t-2xl">
                        <img 
                          src={item.thumbnail} 
                          alt={item.title}
                          className="w-full h-40 object-cover"
                        />
                        {item.watched && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Platform Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={activeTab === 'instagram' ? 'info' : 'danger'}>
                          {activeTab === 'instagram' ? (
                            <Instagram className="w-3 h-3 mr-1" />
                          ) : (
                            <Youtube className="w-3 h-3 mr-1" />
                          )}
                          {item.category}
                        </Badge>
                        {/* Show playlist name if available */}
                        {item.playlistName && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            📋 {item.playlistName}
                          </span>
                        )}
                      </div>
                      {item.watched ? (
                        <Eye className="w-5 h-5 text-[#80D6D6]" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-[#FFB5C0]" />
                      )}
                    </div>

                    {/* Title - Clickable for YouTube */}
                    {item.url ? (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block mb-2 hover:text-red-500 transition-colors"
                      >
                        <h3 className="text-lg font-bold text-[#2D3436] line-clamp-2 hover:underline">
                          {item.title}
                        </h3>
                      </a>
                    ) : (
                      <h3 className="text-lg font-bold text-[#2D3436] mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                    )}

                    {/* Creator */}
                    <p className="text-sm text-[#7A8A7D] mb-3">
                      by <span className="font-semibold text-[#C5A3FF]">{item.creator}</span>
                    </p>

                    {/* Meta Info - COMMIT TO THE SHAME */}
                    <div className="space-y-2 mb-4">
                      {/* Days Ago - BRUTAL if > 180 days */}
                      {daysAgo > 180 ? (
                        <div className="flex items-center gap-2 p-2 bg-[#FFE5E8] rounded-lg border-2 border-[#FFB4A4]">
                          <TrendingDown className="w-4 h-4 text-[#FF9B9B]" />
                          <span className="text-sm font-black text-[#FF9B9B]">
                            ⚠️ {daysAgo} DAYS ROTTING
                          </span>
                        </div>
                      ) : daysAgo > 30 ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-[#FFB4A4]" />
                          <span className="font-bold text-[#FFB4A4]">
                            🔔 Saved {daysAgo} days ago
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-[#9B8AA3]">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Saved {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
                          </span>
                        </div>
                      )}
                      
                      {item.duration && (
                        <div className="flex items-center gap-2 text-sm text-[#9B8AA3]">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(item.duration)}</span>
                        </div>
                      )}
                    </div>

                    {/* Warning for Old Content - STRONGER */}
                    {daysAgo > 180 && !item.watched && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-[#FFE5E8] to-[#FFF5F5] rounded-lg border-2 border-[#FFB4A4]">
                        <p className="text-sm text-[#FF9B9B] font-black">
                          💀 THIS IS BASICALLY ARCHAEOLOGICAL AT THIS POINT
                        </p>
                      </div>
                    )}
                    {isOld && daysAgo <= 180 && !item.watched && (
                      <div className="mb-4 p-2 bg-[#FFE5E8] rounded-lg">
                        <p className="text-xs text-[#FF9B9B] font-semibold">
                          ⏰ Gathering dust for {daysAgo} days!
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleMarkWatched(item.id)}
                        variant={item.watched ? 'ghost' : 'primary'}
                        size="sm"
                        icon={item.watched ? <CheckCircle2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        className="flex-1"
                      >
                        {item.watched ? 'Watched' : 'Mark Watched'}
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        className="text-[#FF9B9B] hover:bg-[#FFE5E8]"
                        title="Delete"
                      >
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {content.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-[#2D3436] mb-2">Nothing here!</h3>
            <p className="text-[#7A8A7D]">
              {filter === 'watched' && 'No watched content yet.'}
              {filter === 'unwatched' && 'All content watched! Nice! 🎉'}
              {filter === 'all' && 'No saved content found.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
