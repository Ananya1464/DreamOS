// ═══════════════════════════════════════════════════════════════
// INSTAGRAM CONTENT SCRAPER 📸
// Detects saved posts/reels and sends data to background
// ═══════════════════════════════════════════════════════════════

console.log('🎯 Brutal Learning OS: Instagram tracker loaded');

let scrapedContent = new Set(); // Track what we've already scraped

/**
 * Extract data from a saved post/reel element
 */
function extractPostData(element) {
  try {
    // Instagram's DOM structure changes, so we'll try multiple selectors
    const link = element.querySelector('a[href*="/p/"], a[href*="/reel/"]');
    if (!link) return null;
    
    const url = link.href;
    const postId = url.match(/\/(p|reel)\/([^\/]+)/)?.[2];
    
    if (!postId || scrapedContent.has(postId)) {
      return null; // Already scraped
    }
    
    // Try to get thumbnail
    const img = element.querySelector('img');
    const thumbnail = img?.src || null;
    
    // Try to get caption/title
    const caption = element.querySelector('[class*="Caption"]')?.textContent || 
                   img?.alt || 
                   'No caption';
    
    // Determine type
    const isReel = url.includes('/reel/');
    
    const postData = {
      id: postId,
      url: url,
      type: isReel ? 'reel' : 'post',
      thumbnail: thumbnail,
      caption: caption.substring(0, 200), // Limit caption length
      savedAt: new Date().toISOString(),
      platform: 'instagram',
      watched: false // Default to unwatched
    };
    
    scrapedContent.add(postId);
    return postData;
    
  } catch (error) {
    console.error('Error extracting Instagram post:', error);
    return null;
  }
}

/**
 * Scan the saved collection page
 */
function scanSavedPosts() {
  console.log('📸 Scanning Instagram saved posts...');
  
  // Instagram saved items are in articles or divs with specific structure
  const savedItems = document.querySelectorAll('article, div[class*="x1iyjqo2"]');
  
  const newPosts = [];
  
  savedItems.forEach(item => {
    const postData = extractPostData(item);
    if (postData) {
      newPosts.push(postData);
    }
  });
  
  if (newPosts.length > 0) {
    console.log(`✅ Found ${newPosts.length} new saved items`);
    
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'SAVED_CONTENT',
      platform: 'instagram',
      items: newPosts
    });
  }
}

/**
 * Detect when we're on the saved collection page
 */
function isOnSavedPage() {
  return window.location.pathname.includes('/saved/') || 
         window.location.pathname.includes('/collections/');
}

/**
 * Monitor for navigation changes (Instagram is a SPA)
 */
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  const currentUrl = location.href;
  
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    scrapedContent.clear(); // Reset on page change
    
    if (isOnSavedPage()) {
      // Wait for content to load
      setTimeout(scanSavedPosts, 2000);
    }
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial scan if on saved page
if (isOnSavedPage()) {
  setTimeout(scanSavedPosts, 3000); // Wait for initial load
}

// Periodic scan while on saved page
setInterval(() => {
  if (isOnSavedPage()) {
    scanSavedPosts();
  }
}, 10000); // Scan every 10 seconds

// Listen for scroll (to detect lazy-loaded content)
let scrollTimeout;
window.addEventListener('scroll', () => {
  if (!isOnSavedPage()) return;
  
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    scanSavedPosts();
  }, 1000);
});

console.log('✅ Instagram tracker ready. Visit your saved posts to start tracking!');
