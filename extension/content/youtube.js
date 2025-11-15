// ═══════════════════════════════════════════════════════════════
// YOUTUBE CONTENT SCRAPER 🎬
// Detects Watch Later videos and tracks watch status
// ═══════════════════════════════════════════════════════════════

console.log('🎯 Brutal Learning OS: YouTube tracker loaded');

let scrapedVideos = new Set(); // Track scraped video IDs

/**
 * Extract video data from a thumbnail element
 */
function extractVideoData(element) {
  try {
    // YouTube Watch Later uses ytd-playlist-video-renderer or ytd-grid-video-renderer
    const link = element.querySelector('a#video-title, a.yt-simple-endpoint');
    if (!link) return null;
    
    const url = link.href;
    const videoId = new URL(url).searchParams.get('v');
    
    if (!videoId || scrapedVideos.has(videoId)) {
      return null; // Already scraped
    }
    
    const title = link.getAttribute('title') || 
                 link.textContent.trim() || 
                 'No title';
    
    // Get thumbnail
    const thumbnail = element.querySelector('img')?.src || null;
    
    // Get duration if available
    const durationElement = element.querySelector('span.ytd-thumbnail-overlay-time-status-renderer');
    const duration = durationElement?.textContent.trim() || 'Unknown';
    
    // Get channel name
    const channelElement = element.querySelector('ytd-channel-name a, #channel-name a');
    const channel = channelElement?.textContent.trim() || 'Unknown channel';
    
    // Check if already watched (YouTube adds specific classes/attributes)
    const watched = element.querySelector('[aria-label*="Watched"]') !== null ||
                   element.classList.contains('watched');
    
    const videoData = {
      id: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: title.substring(0, 200),
      thumbnail: thumbnail,
      duration: duration,
      channel: channel,
      savedAt: new Date().toISOString(),
      platform: 'youtube',
      watched: watched,
      type: 'video'
    };
    
    scrapedVideos.add(videoId);
    return videoData;
    
  } catch (error) {
    console.error('Error extracting YouTube video:', error);
    return null;
  }
}

/**
 * Scan Watch Later playlist
 */
function scanWatchLater() {
  console.log('🎬 Scanning YouTube Watch Later...');
  
  // YouTube playlist items
  const videoElements = document.querySelectorAll(
    'ytd-playlist-video-renderer, ytd-grid-video-renderer, ytd-video-renderer'
  );
  
  const newVideos = [];
  
  videoElements.forEach(element => {
    const videoData = extractVideoData(element);
    if (videoData) {
      newVideos.push(videoData);
    }
  });
  
  if (newVideos.length > 0) {
    console.log(`✅ Found ${newVideos.length} new Watch Later videos`);
    
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'SAVED_CONTENT',
      platform: 'youtube',
      items: newVideos
    });
  }
}

/**
 * Detect if we're on Watch Later page
 */
function isOnWatchLaterPage() {
  return window.location.pathname.includes('/playlist') && 
         (window.location.search.includes('list=WL') || // Watch Later
          document.title.includes('Watch Later'));
}

/**
 * Detect when a video is being watched
 */
function trackVideoWatch() {
  const url = new URL(window.location.href);
  const videoId = url.searchParams.get('v');
  
  if (videoId && window.location.pathname === '/watch') {
    // Video is being watched
    chrome.runtime.sendMessage({
      type: 'VIDEO_WATCHED',
      platform: 'youtube',
      videoId: videoId,
      watchedAt: new Date().toISOString()
    });
    
    console.log(`📺 Watching video: ${videoId}`);
  }
}

/**
 * Monitor for navigation changes (YouTube is a SPA)
 */
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  const currentUrl = location.href;
  
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    scrapedVideos.clear(); // Reset on navigation
    
    if (isOnWatchLaterPage()) {
      setTimeout(scanWatchLater, 2000);
    }
    
    // Track video watches
    trackVideoWatch();
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial scan
if (isOnWatchLaterPage()) {
  setTimeout(scanWatchLater, 3000);
}

// Track initial video if watching
trackVideoWatch();

// Periodic scan on Watch Later page
setInterval(() => {
  if (isOnWatchLaterPage()) {
    scanWatchLater();
  }
}, 10000); // Every 10 seconds

// Listen for scroll (lazy-loaded content)
let scrollTimeout;
window.addEventListener('scroll', () => {
  if (!isOnWatchLaterPage()) return;
  
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    scanWatchLater();
  }, 1000);
});

console.log('✅ YouTube tracker ready. Visit Watch Later to start tracking!');
