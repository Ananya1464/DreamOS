// ═══════════════════════════════════════════════════════════════
// POPUP UI LOGIC 🎨
// Shows stats and shame metrics
// ═══════════════════════════════════════════════════════════════

const app = document.getElementById('app');

/**
 * Calculate watch rate percentage
 */
function calculateWatchRate(watched, total) {
  if (total === 0) return 0;
  return Math.round((watched / total) * 100);
}

/**
 * Get shame message based on watch rate
 */
function getShameMessage(watchRate) {
  if (watchRate >= 80) return "🎉 Amazing! You actually watch what you save!";
  if (watchRate >= 60) return "👍 Pretty good! But there's room for improvement.";
  if (watchRate >= 40) return "😬 You're saving more than you're watching...";
  if (watchRate >= 20) return "🙈 This is getting embarrassing...";
  return "💀 You have a serious hoarding problem!";
}

/**
 * Render the stats UI
 */
function renderStats(stats) {
  if (!stats) {
    app.innerHTML = '<div class="loading">No data yet. Visit Instagram Saved or YouTube Watch Later!</div>';
    return;
  }
  
  const totalWatched = stats.totalWatched || 0;
  const totalSaved = stats.totalSaved || 0;
  const watchRate = calculateWatchRate(totalWatched, totalSaved);
  const shameMessage = getShameMessage(watchRate);
  
  app.innerHTML = `
    <!-- Shame Zone -->
    <div class="shame-zone">
      <h2>Your Watch Rate</h2>
      <div class="shame-stat">${watchRate}%</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${watchRate}%"></div>
      </div>
      <div class="shame-message">${shameMessage}</div>
    </div>
    
    <!-- Platform Stats -->
    <div class="stats-grid">
      <!-- Instagram -->
      <div class="stat-card instagram">
        <h3><span class="emoji">📸</span> Instagram</h3>
        <div class="stat-number">${stats.instagram?.total || 0}</div>
        <div class="stat-detail">
          ✅ ${stats.instagram?.watched || 0} watched<br>
          ⏳ ${stats.instagram?.unwatched || 0} unwatched
        </div>
      </div>
      
      <!-- YouTube -->
      <div class="stat-card youtube">
        <h3><span class="emoji">🎬</span> YouTube</h3>
        <div class="stat-number">${stats.youtube?.total || 0}</div>
        <div class="stat-detail">
          ✅ ${stats.youtube?.watched || 0} watched<br>
          ⏳ ${stats.youtube?.unwatched || 0} unwatched
        </div>
      </div>
    </div>
    
    <!-- Total Stats -->
    <div class="stat-card" style="border-color: #C5A3FF; margin-bottom: 20px;">
      <h3><span class="emoji">📊</span> Total</h3>
      <div class="stat-number" style="color: #C5A3FF;">${totalSaved}</div>
      <div class="stat-detail">
        Saved items • ${totalWatched} watched (${watchRate}%)
      </div>
    </div>
    
    <!-- Actions -->
    <div class="buttons">
      <button class="btn-primary" id="syncBtn">
        🔄 Sync Now
      </button>
      <button class="btn-secondary" id="openDashboardBtn">
        📊 Dashboard
      </button>
    </div>
    
    <div class="sync-status" id="syncStatus">
      ${stats.lastSync ? `Last sync: ${new Date(stats.lastSync).toLocaleTimeString()}` : 'Never synced'}
    </div>
  `;
  
  // Add event listeners
  document.getElementById('syncBtn').addEventListener('click', syncNow);
  document.getElementById('openDashboardBtn').addEventListener('click', openDashboard);
}

/**
 * Load and display stats
 */
async function loadStats() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
    
    if (response.success) {
      renderStats(response.stats);
    } else {
      app.innerHTML = '<div class="loading">Error loading stats</div>';
    }
  } catch (error) {
    console.error('Error loading stats:', error);
    app.innerHTML = '<div class="loading">Error: ' + error.message + '</div>';
  }
}

/**
 * Trigger a manual sync
 */
async function syncNow() {
  const syncBtn = document.getElementById('syncBtn');
  const syncStatus = document.getElementById('syncStatus');
  
  syncBtn.textContent = '⏳ Syncing...';
  syncBtn.disabled = true;
  
  // Reload stats
  await loadStats();
  
  syncBtn.textContent = '✅ Synced!';
  syncStatus.textContent = `Last sync: ${new Date().toLocaleTimeString()}`;
  
  setTimeout(() => {
    syncBtn.textContent = '🔄 Sync Now';
    syncBtn.disabled = false;
  }, 2000);
}

/**
 * Open main app dashboard
 */
function openDashboard() {
  // Open the main app (update URL to your actual app URL)
  chrome.tabs.create({
    url: 'http://localhost:5174' // Your dev server URL
  });
}

// Load stats on popup open
loadStats();

// Refresh stats every 5 seconds while popup is open
setInterval(loadStats, 5000);
