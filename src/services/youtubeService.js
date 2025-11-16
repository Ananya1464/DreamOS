// YouTube API Integration Service
import axios from 'axios';
import { importFromYouTube } from './savedContentService';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Fetch ALL user's videos from multiple sources
 * - Watch Later playlist
 * - Custom playlists
 */
export async function fetchLikedVideos(accessToken) {
  try {
    console.log('🎬 Fetching videos from YouTube (Watch Later & Playlists)...');
    
    let allVideos = [];
    
    // 1. Fetch Watch Later playlist
    try {
      console.log('📺 Fetching Watch Later...');
      const watchLater = await fetchWatchLater(accessToken);
      allVideos = allVideos.concat(watchLater);
      console.log(`✅ Found ${watchLater.length} videos in Watch Later`);
    } catch (error) {
      console.warn('⚠️ Could not fetch Watch Later:', error.message);
    }
    
    // 2. Fetch all user playlists
    try {
      console.log('📚 Fetching custom playlists...');
      const playlistVideos = await fetchAllPlaylists(accessToken);
      allVideos = allVideos.concat(playlistVideos);
      console.log(`✅ Found ${playlistVideos.length} videos in playlists`);
    } catch (error) {
      console.warn('⚠️ Could not fetch playlists:', error.message);
    }
    
    // Remove duplicates by video ID
    const uniqueVideos = Array.from(
      new Map(allVideos.map(v => [v.id, v])).values()
    );

    console.log(`✅ Total unique videos: ${uniqueVideos.length}`);
    return uniqueVideos;
  } catch (error) {
    console.error('❌ Error fetching videos:', error);
    return [];
  }
}

/**
 * Fetch Watch Later playlist
 */
async function fetchWatchLater(accessToken) {
  const response = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
    params: {
      part: 'snippet,contentDetails',
      playlistId: 'WL', // WL = Watch Later
      maxResults: 50,
      key: YOUTUBE_API_KEY
    },
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data.items.map(item => ({
    id: item.contentDetails.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
    tags: []
  }));
}

/**
 * Fetch all user playlists and their videos
 */
async function fetchAllPlaylists(accessToken) {
  // First, get all user's playlists
  const playlistsResponse = await axios.get(`${YOUTUBE_API_BASE}/playlists`, {
    params: {
      part: 'snippet',
      mine: true,
      maxResults: 50,
      key: YOUTUBE_API_KEY
    },
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const playlists = playlistsResponse.data.items;
  console.log(`📋 Found ${playlists.length} playlists`);

  // Fetch videos from each playlist
  let allPlaylistVideos = [];
  
  for (const playlist of playlists) {
    try {
      const playlistVideos = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
        params: {
          part: 'snippet,contentDetails',
          playlistId: playlist.id,
          maxResults: 50,
          key: YOUTUBE_API_KEY
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const videos = playlistVideos.data.items.map(item => ({
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        playlistName: playlist.snippet.title,
        tags: []
      }));

      allPlaylistVideos = allPlaylistVideos.concat(videos);
      console.log(`  ✅ Playlist "${playlist.snippet.title}": ${videos.length} videos`);
    } catch (error) {
      console.warn(`  ⚠️ Could not fetch playlist "${playlist.snippet.title}":`, error.message);
    }
  }

  return allPlaylistVideos;
}

/**
 * Fallback: Fetch user's search/watch history
 */
async function fetchSearchHistory(accessToken) {
  try {
    console.log('🔍 Trying alternative: fetching search history...');
    
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'snippet',
        forMine: true,
        type: 'video',
        maxResults: 50,
        order: 'date',
        key: YOUTUBE_API_KEY
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.medium.url
    }));

    console.log(`✅ Fetched ${videos.length} videos from search history`);
    return videos;
  } catch (error) {
    console.error('❌ Error fetching search history:', error);
    return [];
  }
}

/**
 * Extract topics from video metadata using Gemini AI
 */
export async function extractTopicsFromVideos(videos, geminiModel) {
  if (!videos || videos.length === 0) {
    console.warn('⚠️ No videos to analyze');
    return [];
  }

  console.log(`🤖 Analyzing ${videos.length} videos with Gemini AI...`);
  
  // Prepare video data for AI analysis
  const videoData = videos.map(v => ({
    title: v.title,
    channel: v.channelTitle,
    tags: v.tags || []
  }));

  const videoTitles = videoData.map(v => `"${v.title}" by ${v.channel}`).join('\n');
  
  const prompt = `
Analyze these YouTube videos and extract ALL the main topics/interests based on what the user actually watches.
DO NOT filter out entertainment, gaming, music, vlogs, or any content type.
Be HONEST about viewing patterns - if they watch entertainment, show it!

Videos:
${videoTitles}

Return a JSON array of topics in this EXACT format:
[
  {
    "name": "Entertainment & Comedy",
    "subTopics": ["Stand-up Comedy", "Funny Skits", "Reaction Videos"],
    "category": "Entertainment",
    "confidence": 0.92,
    "color": "#FF6B6B"
  },
  {
    "name": "Machine Learning",
    "subTopics": ["Neural Networks", "Deep Learning", "Computer Vision"],
    "category": "Technology/AI",
    "confidence": 0.95,
    "color": "#4ECDC4"
  },
  {
    "name": "Gaming",
    "subTopics": ["Minecraft", "Game Reviews", "Speedruns"],
    "category": "Gaming/Entertainment",
    "confidence": 0.88,
    "color": "#9B59B6"
  }
]

Rules:
- Include ALL content types (educational, entertainment, gaming, music, lifestyle, etc.)
- Group similar content together (e.g., all gaming videos = "Gaming")
- confidence = how certain you are this is a real interest (0-1)
- Use descriptive category names
- Maximum 8 main topics (most watched)
- Each topic should have 3-5 relevant subtopics
- Show what they ACTUALLY watch, not what you think they should watch!
  },
  {
    "name": "Web Development",
    "subTopics": ["React", "Node.js", "TypeScript"],
    "category": "Technology/Programming",
    "confidence": 0.88,
    "color": "#4ECDC4"
  }
]

Rules:
- Only include educational topics
- Group related subtopics together
- confidence = how certain you are this is a real interest (0-1)
- Use descriptive names (e.g., "Data Structures & Algorithms", not "DSA")
- Maximum 5 main topics
- Each topic should have 3-5 subtopics
  `;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('📝 Gemini response:', text.substring(0, 200) + '...');
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text;
    const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    } else {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
    }
    
    const topics = JSON.parse(jsonText);
    console.log(`✅ Extracted ${topics.length} topics:`, topics.map(t => t.name).join(', '));
    
    return topics;
  } catch (error) {
    console.error('❌ Error extracting topics:', error);
    
    // Fallback: manual extraction from video titles
    return fallbackTopicExtraction(videos);
  }
}

/**
 * Fallback: Simple keyword-based topic extraction
 */
function fallbackTopicExtraction(videos) {
  console.log('⚠️ Using fallback topic extraction...');
  
  const keywords = {
    'Machine Learning': ['machine learning', 'ml', 'neural network', 'deep learning', 'ai', 'artificial intelligence'],
    'Web Development': ['react', 'javascript', 'web dev', 'frontend', 'backend', 'node', 'typescript'],
    'Data Structures': ['data structure', 'algorithm', 'dsa', 'leetcode', 'coding interview'],
    'Programming': ['python', 'java', 'c++', 'programming', 'coding'],
    'Mathematics': ['math', 'calculus', 'linear algebra', 'statistics', 'probability']
  };

  const foundTopics = {};
  
  videos.forEach(video => {
    const title = video.title.toLowerCase();
    
    Object.entries(keywords).forEach(([topic, keywordList]) => {
      if (keywordList.some(kw => title.includes(kw))) {
        if (!foundTopics[topic]) {
          foundTopics[topic] = { count: 0, videos: [] };
        }
        foundTopics[topic].count++;
        foundTopics[topic].videos.push(video.title);
      }
    });
  });

  // Convert to expected format
  return Object.entries(foundTopics)
    .filter(([_, data]) => data.count >= 2) // At least 2 videos
    .map(([name, data]) => ({
      name,
      subTopics: data.videos.slice(0, 3),
      category: 'Technology',
      confidence: Math.min(data.count / 10, 1),
      color: getRandomColor()
    }));
}

/**
 * Build Birdseye subjects from extracted YouTube topics
 */
export function buildBirdseyeFromYouTube(extractedTopics) {
  console.log('🧠 Building Birdseye subjects from YouTube data...');
  
  const subjects = {};

  extractedTopics.forEach(topic => {
    const subjectKey = topic.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    subjects[subjectKey] = {
      id: subjectKey,
      name: topic.name,
      code: 'YT-' + subjectKey.substring(0, 4).toUpperCase(),
      credits: 3,
      instructor: 'YouTube Learning',
      color: topic.color || getRandomColor(),
      semester: 'Self-Study 2025',
      source: 'youtube',
      topics: []
    };

    topic.subTopics.forEach((subTopic, index) => {
      subjects[subjectKey].topics.push({
        id: `${subjectKey}-${index + 1}`,
        name: subTopic,
        mastery: Math.floor((topic.confidence || 0.5) * 100),
        lastStudied: new Date().toISOString(),
        hours: Math.floor(Math.random() * 10) + 5,
        examWeight: 0,
        notes: 'Learned from YouTube',
        resources: [],
        revisions: [],
        cos: []
      });
    });
  });

  console.log(`✅ Created ${Object.keys(subjects).length} subjects with ${Object.values(subjects).reduce((sum, s) => sum + s.topics.length, 0)} topics`);
  
  return subjects;
}

/**
 * Get a random color for subjects
 */
function getRandomColor() {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#95E1D3', // Mint
    '#F38181', // Pink
    '#A8E6CF', // Light green
    '#FFD93D', // Yellow
    '#6BCB77', // Green
    '#4D96FF', // Blue
    '#FF6B9D', // Hot pink
    '#C9ADA7'  // Beige
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
