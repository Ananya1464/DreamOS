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
  
  const youtubeItems = videos.map(video => ({
    id: video.id,
    title: video.title,
    creator: video.channelTitle,
    thumbnail: video.thumbnail,
    duration: video.duration || Math.floor(Math.random() * 60) + 5, // minutes
    category: video.category || 'Educational',
    savedDate: video.publishedAt || now,
    watched: false
  }));
  
  content.youtube = [...content.youtube, ...youtubeItems];
  saveSavedContent(content);
  
  console.log(`✅ Imported ${youtubeItems.length} videos from YouTube`);
  return youtubeItems;
}
