/**
 * Saved Content Service - Manage saved Instagram & YouTube content
 */

const STORAGE_KEY = 'dreamos_saved_content';

// Get saved content from localStorage
export function getSavedContent() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading saved content:', error);
  }
  
  return {
    instagram: [],
    youtube: []
  };
}

// Save content to localStorage
export function saveSavedContent(content) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    return true;
  } catch (error) {
    console.error('Error saving content:', error);
    return false;
  }
}

// Add new saved item
export function addSavedItem(platform, item) {
  const content = getSavedContent();
  const newItem = {
    id: Date.now().toString(),
    savedDate: new Date().toISOString(),
    watched: false,
    ...item
  };
  
  content[platform].push(newItem);
  saveSavedContent(content);
  return newItem;
}

// Mark item as watched
export function markAsWatched(platform, itemId) {
  const content = getSavedContent();
  const item = content[platform].find(i => i.id === itemId);
  if (item) {
    item.watched = true;
    item.watchedDate = new Date().toISOString();
    saveSavedContent(content);
  }
}

// Delete saved item
export function deleteSavedItem(platform, itemId) {
  const content = getSavedContent();
  content[platform] = content[platform].filter(i => i.id !== itemId);
  saveSavedContent(content);
}

// Import from YouTube (when user connects YouTube)
export function importFromYouTube(videos) {
  const content = getSavedContent();
  const now = new Date().toISOString();
  
  // Parse YouTube duration format (PT1H2M10S) to minutes
  const parseDuration = (duration) => {
    if (!duration) return Math.floor(Math.random() * 30) + 5;
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 10;
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    return hours * 60 + minutes + Math.ceil(seconds / 60);
  };
  
  const youtubeItems = videos.map(video => ({
    id: video.id,
    title: video.title,
    creator: video.channelTitle,
    thumbnail: video.thumbnailUrl || video.thumbnail,
    duration: parseDuration(video.duration),
    category: video.category || 'Educational',
    playlistName: video.playlistName || (video.category === 'WL' ? 'Watch Later' : null),
    savedDate: video.publishedAt || now,
    watched: false,
    url: `https://www.youtube.com/watch?v=${video.id}`
  }));
  
  // Avoid duplicates
  const existingIds = new Set(content.youtube.map(v => v.id));
  const newVideos = youtubeItems.filter(v => !existingIds.has(v.id));
  
  content.youtube = [...content.youtube, ...newVideos];
  saveSavedContent(content);
  
  console.log(`✅ Imported ${newVideos.length} NEW videos from YouTube (${youtubeItems.length - newVideos.length} duplicates skipped)`);
  return newVideos;
}
