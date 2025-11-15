// ═══════════════════════════════════════════════════════════════
// BACKGROUND SERVICE WORKER 🔧
// Handles data storage and syncing between extension and main app
// ═══════════════════════════════════════════════════════════════

console.log('🚀 Brutal Learning OS Background Service: Active');

// Storage keys
const STORAGE_KEYS = {
  INSTAGRAM_SAVED: 'instagram_saved_content',
  YOUTUBE_SAVED: 'youtube_saved_content',
  WATCH_HISTORY: 'watch_history',
  LAST_SYNC: 'last_sync_time'
};

/**
 * Save content to Chrome storage
 */
async function saveContent(platform, items) {
  try {
    const storageKey = platform === 'instagram' 
      ? STORAGE_KEYS.INSTAGRAM_SAVED 
      : STORAGE_KEYS.YOUTUBE_SAVED;
    
    // Get existing data
    const result = await chrome.storage.local.get(storageKey);
    const existingItems = result[storageKey] || [];
    
    // Create a map of existing items by ID
    const itemMap = new Map();
    existingItems.forEach(item => itemMap.set(item.id, item));
    
    // Add/update new items
    items.forEach(item => {
      if (!itemMap.has(item.id)) {
        itemMap.set(item.id, item);
      }
    });
    
    // Convert back to array
    const updatedItems = Array.from(itemMap.values());
    
    // Save to storage
    await chrome.storage.local.set({
      [storageKey]: updatedItems,
      [STORAGE_KEYS.LAST_SYNC]: new Date().toISOString()
    });
    
    console.log(`✅ Saved ${items.length} ${platform} items (Total: ${updatedItems.length})`);
    
    // Sync to main app via localStorage (if on same domain)
    syncToMainApp(platform, updatedItems);
    
    return updatedItems;
    
  } catch (error) {
    console.error('Error saving content:', error);
    return [];
  }
}

/**
 * Mark a video as watched
 */
async function markAsWatched(platform, videoId) {
  try {
    const storageKey = platform === 'instagram' 
      ? STORAGE_KEYS.INSTAGRAM_SAVED 
      : STORAGE_KEYS.YOUTUBE_SAVED;
    
    const result = await chrome.storage.local.get(storageKey);
    const items = result[storageKey] || [];
    
    // Find and update the item
    const updatedItems = items.map(item => {
      if (item.id === videoId) {
        return {
          ...item,
          watched: true,
          watchedAt: new Date().toISOString()
        };
      }
      return item;
    });
    
    await chrome.storage.local.set({ [storageKey]: updatedItems });
    
    // Also save to watch history
    const historyResult = await chrome.storage.local.get(STORAGE_KEYS.WATCH_HISTORY);
    const history = historyResult[STORAGE_KEYS.WATCH_HISTORY] || [];
    
    history.push({
      platform,
      videoId,
      watchedAt: new Date().toISOString()
    });
    
    await chrome.storage.local.set({ [STORAGE_KEYS.WATCH_HISTORY]: history });
    
    console.log(`✅ Marked ${videoId} as watched`);
    
    // Sync to main app
    syncToMainApp(platform, updatedItems);
    
  } catch (error) {
    console.error('Error marking as watched:', error);
  }
}

/**
 * Sync data to main app
 * Uses a shared localStorage approach (works if extension and app share domain)
 * Otherwise, data stays in extension and is shown in popup
 */
function syncToMainApp(platform, items) {
  // Create summary stats
  const stats = {
    total: items.length,
    watched: items.filter(item => item.watched).length,
    unwatched: items.filter(item => !item.watched).length,
    platform: platform,
    lastSync: new Date().toISOString()
  };
  
  console.log(`📊 ${platform} Stats:`, stats);
  
  // Broadcast to any open tabs of the main app
  chrome.runtime.sendMessage({
    type: 'STATS_UPDATE',
    platform: platform,
    stats: stats,
    items: items
  }).catch(() => {
    // No receivers, that's okay
  });
}

/**
 * Get all stats
 */
async function getAllStats() {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.INSTAGRAM_SAVED,
      STORAGE_KEYS.YOUTUBE_SAVED,
      STORAGE_KEYS.WATCH_HISTORY,
      STORAGE_KEYS.LAST_SYNC
    ]);
    
    const instagram = result[STORAGE_KEYS.INSTAGRAM_SAVED] || [];
    const youtube = result[STORAGE_KEYS.YOUTUBE_SAVED] || [];
    const watchHistory = result[STORAGE_KEYS.WATCH_HISTORY] || [];
    
    return {
      instagram: {
        total: instagram.length,
        watched: instagram.filter(item => item.watched).length,
        unwatched: instagram.filter(item => !item.watched).length,
        items: instagram
      },
      youtube: {
        total: youtube.length,
        watched: youtube.filter(item => item.watched).length,
        unwatched: youtube.filter(item => !item.watched).length,
        items: youtube
      },
      watchHistory: watchHistory,
      lastSync: result[STORAGE_KEYS.LAST_SYNC] || null,
      totalSaved: instagram.length + youtube.length,
      totalWatched: instagram.filter(i => i.watched).length + youtube.filter(i => i.watched).length
    };
    
  } catch (error) {
    console.error('Error getting stats:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE HANDLERS
// ═══════════════════════════════════════════════════════════════

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message.type);
  
  if (message.type === 'SAVED_CONTENT') {
    // Content script found saved items
    saveContent(message.platform, message.items).then(updatedItems => {
      sendResponse({ success: true, total: updatedItems.length });
    });
    return true; // Async response
  }
  
  if (message.type === 'VIDEO_WATCHED') {
    // User watched a video
    markAsWatched(message.platform, message.videoId);
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'GET_STATS') {
    // Popup or main app requesting stats
    getAllStats().then(stats => {
      sendResponse({ success: true, stats: stats });
    });
    return true;
  }
  
  if (message.type === 'CLEAR_DATA') {
    // Clear all data (for testing)
    chrome.storage.local.clear().then(() => {
      console.log('🗑️ All data cleared');
      sendResponse({ success: true });
    });
    return true;
  }
});

// Periodic sync (every 30 minutes)
setInterval(async () => {
  const stats = await getAllStats();
  console.log('🔄 Periodic sync:', stats);
}, 30 * 60 * 1000);

console.log('✅ Background service ready!');
