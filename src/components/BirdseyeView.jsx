import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, GitBranch, Sparkles, X, Plus, Minus, Compass, TrendingUp, Youtube, BookOpen, Zap, Menu } from 'lucide-react';
import { Card, Badge } from './UI';
import { useSubjects } from '../hooks/useBackend';
import { queryWolfram } from '../utils/wolframService';
import { initializeTestData } from '../utils/initTestData';
import { useGoogleLogin } from '@react-oauth/google';
import { fetchLikedVideos, extractTopicsFromVideos, buildBirdseyeFromYouTube } from '../services/youtubeService';
import { getGeminiModel } from '../utils/ai';
import { loadSubjects, saveSubjects } from '../utils/storage';
import { importFromYouTube } from '../services/savedContentService';
import AddSubjectModal from './AddSubjectModal';

/**
 * Birdseye Knowledge Graph - Visual Brain Map
 * Interactive network showing how your learning topics connect
 */
export default function BirdseyeView({ sidebarOpen, setSidebarOpen }) {
  const { subjects, loading } = useSubjects(5000);
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [adventureLevel, setAdventureLevel] = useState(50); // 0-100: conservative to adventurous
  const [wolframInsights, setWolframInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [enhancedConnections, setEnhancedConnections] = useState({});
  const [isLoadingYouTube, setIsLoadingYouTube] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [filteredSubjects, setFilteredSubjects] = useState([]); // Filter to show only selected subjects

  // Handle manually adding a topic/subject with Wolfram enhancement
  const handleAddSubject = async (newSubject) => {
    try {
      console.log('🔍 Enhancing subject with Wolfram AI:', newSubject.name);
      
      // Get Wolfram insights for the subject
      const wolframData = await queryWolfram(newSubject.name, 'knowledge');
      
      if (wolframData) {
        console.log('✨ Wolfram enhanced the subject!');
        newSubject.wolframEnhanced = true;
      }
      
      const currentSubjects = loadSubjects();
      const updatedSubjects = {
        ...currentSubjects,
        [newSubject.id]: newSubject
      };
      saveSubjects(updatedSubjects);
      setShowAddTopicModal(false);
      console.log('✅ Subject added to Birdseye:', newSubject.name);
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('⚠️ Wolfram enhancement failed, adding anyway:', error);
      // Still add the subject even if Wolfram fails
      const currentSubjects = loadSubjects();
      const updatedSubjects = {
        ...currentSubjects,
        [newSubject.id]: newSubject
      };
      saveSubjects(updatedSubjects);
      setShowAddTopicModal(false);
      setTimeout(() => window.location.reload(), 500);
    }
  };

  // YouTube OAuth integration
  const handleYouTubeConnect = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoadingYouTube(true);
      try {
        console.log('🎬 YouTube OAuth successful! Access token received.');
        
        // 1. Fetch liked videos from YouTube
        const videos = await fetchLikedVideos(tokenResponse.access_token);
        console.log(`✅ Fetched ${videos.length} videos from YouTube`);

        if (videos.length === 0) {
          alert('No liked videos found! Try liking some educational videos on YouTube first.');
          setIsLoadingYouTube(false);
          return;
        }

        // 2. Extract topics using Gemini AI
        const geminiModel = getGeminiModel();
        const topics = await extractTopicsFromVideos(videos, geminiModel);
        console.log(`✅ Extracted ${topics.length} topics from videos`);

        if (topics.length === 0) {
          alert('Could not extract educational topics. Make sure you have educational content in your liked videos!');
          setIsLoadingYouTube(false);
          return;
        }

        // 3. Build Birdseye subjects from topics
        const youtubeSubjects = buildBirdseyeFromYouTube(topics);
        console.log(`✅ Built ${Object.keys(youtubeSubjects).length} subjects for Birdseye`);

        // 4. Import videos to SavedContent page (NEW!)
        importFromYouTube(videos);
        console.log(`✅ Imported ${videos.length} videos to SavedContent`);

        // 5. Merge with existing subjects
        const existingSubjects = loadSubjects();
        const mergedSubjects = { ...existingSubjects, ...youtubeSubjects };
        saveSubjects(mergedSubjects);

        console.log('✅ YouTube data integrated! Reloading...');
        
        // 6. Reload page to show new data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('❌ YouTube integration failed:', error);
        alert(`Failed to connect YouTube: ${error.message}\n\nCheck the console for details.`);
        setIsLoadingYouTube(false);
      }
    },
    onError: (error) => {
      console.error('❌ YouTube OAuth error:', error);
      alert('Failed to authenticate with Google. Please try again.');
      setIsLoadingYouTube(false);
    },
    scope: 'https://www.googleapis.com/auth/youtube.readonly'
  });

  // Use Wolfram Alpha to get REAL knowledge graph connections
  const getWolframConnections = async (topic) => {
    if (enhancedConnections[topic]) {
      return enhancedConnections[topic];
    }

    try {
      // Query Wolfram for related concepts
      const result = await queryWolfram(`${topic} related fields prerequisites applications`, 'knowledge');
      
      if (result && result.includes('related') || result.includes('prerequisite')) {
        // Parse Wolfram's response for related topics
        const connections = [];
        
        // Wolfram gives us structured knowledge - extract it
        const lines = result.split('\n');
        lines.forEach(line => {
          // Look for related concepts in Wolfram's response
          if (line.includes('related') || line.includes('prerequisite') || line.includes('application')) {
            const match = line.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
            if (match) connections.push(...match);
          }
        });

        const uniqueConnections = [...new Set(connections)].slice(0, 5);
        setEnhancedConnections(prev => ({ ...prev, [topic]: uniqueConnections }));
        return uniqueConnections;
      }
    } catch (error) {
      console.log('Wolfram API fallback to local mapping');
    }

    // Fallback to local mapping
    return getConceptConnections(topic);
  };

  // Get Wolfram-powered insights about your learning profile
  const getWolframInsights = async () => {
    if (loadingInsights || wolframInsights) return;
    
    setLoadingInsights(true);
    
    try {
      // Get all your topics
      const allTopics = [];
      Object.values(subjects).forEach(subject => {
        if (subject.topics) {
          allTopics.push(...subject.topics.map(t => t.name));
        }
      });

      // Ask Wolfram: "What fields connect these topics?"
      const topicList = allTopics.slice(0, 5).join(', ');
      const query = `fields that combine ${topicList}`;
      
      const result = await queryWolfram(query, 'knowledge');
      
      if (result) {
        // Parse Wolfram's suggestions
        const insights = {
          interdisciplinary: [],
          emerging: [],
          foundational: []
        };

        // Wolfram will tell us about interdisciplinary fields
        const lines = result.split('\n');
        lines.forEach(line => {
          if (line.includes('interdisciplinary') || line.includes('combines')) {
            insights.interdisciplinary.push(line.trim());
          }
          if (line.includes('emerging') || line.includes('new')) {
            insights.emerging.push(line.trim());
          }
        });

        setWolframInsights(insights);
      }
    } catch (error) {
      console.log('Wolfram insights unavailable, using local intelligence');
    } finally {
      setLoadingInsights(false);
    }
  };

  // Smart concept relationships (enhanced with Wolfram)
  const getConceptConnections = (topicName) => {
    const connections = {
      // Deep Learning connections
      'Neural Networks': ['Machine Learning', 'Backpropagation', 'TensorFlow', 'PyTorch'],
      'CNN': ['Neural Networks', 'Image Processing', 'Computer Vision'],
      'RNN': ['Neural Networks', 'NLP', 'Time Series'],
      'Backpropagation': ['Neural Networks', 'Gradient Descent', 'Calculus'],
      
      // VLSI connections
      'CMOS': ['Digital Electronics', 'Transistors', 'VLSI Design'],
      'VLSI Design': ['CMOS', 'Verilog', 'Digital Design'],
      'Verilog': ['VLSI Design', 'HDL', 'Digital Systems'],
      
      // IoT connections
      'IoT': ['Embedded Systems', 'Networking', 'Sensors', 'Arduino'],
      'Arduino': ['IoT', 'Embedded Systems', 'Programming'],
      'MQTT': ['IoT', 'Networking', 'Protocols'],
      
      // Cloud connections
      'AWS': ['Cloud Computing', 'DevOps', 'Serverless'],
      'Docker': ['DevOps', 'Cloud Computing', 'Containers'],
      'Kubernetes': ['Docker', 'Cloud Computing', 'Orchestration'],
      
      // Fundamentals
      'Machine Learning': ['Neural Networks', 'Python', 'Statistics', 'Linear Algebra'],
      'Data Structures': ['Algorithms', 'Programming', 'Problem Solving'],
      'Python': ['Programming', 'Data Science', 'Machine Learning']
    };
    return connections[topicName] || [];
  };

  // Suggest new topics based on current interests and adventure level
  const getSuggestedTopics = () => {
    if (!subjects || Object.keys(subjects).length === 0) return [];

    // Get all current topics
    const currentTopics = [];
    Object.values(subjects).forEach(subject => {
      if (subject.topics) {
        currentTopics.push(...subject.topics.map(t => t.name));
      }
    });

    // Discovery pool based on adventure level
    const conservativeTopics = [
      // Direct extensions of what you're learning
      { name: 'Transfer Learning', reason: 'Next step after Neural Networks', category: 'Deep Learning' },
      { name: 'GANs', reason: 'Advanced deep learning technique', category: 'Deep Learning' },
      { name: 'FPGA Design', reason: 'Extends your VLSI knowledge', category: 'Hardware' },
      { name: 'Edge Computing', reason: 'IoT meets Cloud', category: 'Systems' }
    ];

    const moderateTopics = [
      { name: 'Reinforcement Learning', reason: 'ML branch for decision-making', category: 'AI' },
      { name: 'System Design', reason: 'Scale your cloud knowledge', category: 'Architecture' },
      { name: 'Computer Vision', reason: 'Apply CNNs to real problems', category: 'AI' },
      { name: 'Blockchain', reason: 'Distributed systems', category: 'Technology' }
    ];

    const adventurousTopics = [
      { name: 'Quantum Computing', reason: 'Future of computing', category: 'Emerging Tech' },
      { name: 'Neuromorphic Computing', reason: 'Brain-inspired hardware', category: 'Research' },
      { name: 'Web3', reason: 'Decentralized internet', category: 'Technology' },
      { name: 'Synthetic Biology', reason: 'Programming life', category: 'Interdisciplinary' },
      { name: 'Generative AI', reason: 'Creating with AI', category: 'AI' },
      { name: 'Robotics', reason: 'Combine IoT, AI, Hardware', category: 'Interdisciplinary' }
    ];

    // Mix suggestions based on adventure level
    const suggestions = [];
    const conservativeCount = Math.round((100 - adventureLevel) / 25);
    const moderateCount = 2;
    const adventurousCount = Math.round(adventureLevel / 25);

    suggestions.push(...conservativeTopics.slice(0, conservativeCount));
    suggestions.push(...moderateTopics.slice(0, moderateCount));
    suggestions.push(...adventurousTopics.slice(0, adventurousCount));

    return suggestions.filter(s => !currentTopics.includes(s.name));
  };

  // Auto-initialize test data if no subjects exist
  useEffect(() => {
    const currentSubjects = loadSubjects();
    if (!currentSubjects || Object.keys(currentSubjects).length === 0) {
      console.log('🎯 Auto-initializing test data for Birdseye...');
      initializeTestData();
      // Force a re-render by reloading subjects
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, []);

  // Get all topics from subjects and create dynamic node structure
  useEffect(() => {
    if (!subjects || Object.keys(subjects).length === 0) return;

    const nodeArray = [];
    const centerX = 400;
    const centerY = 300;
    const subjectRadius = 150;

    // Add center node (YOU)
    nodeArray.push({
      id: 'center',
      label: 'YOU',
      type: 'center',
      x: centerX,
      y: centerY,
      color: '#B5A3E5',
      size: 40,
      mastery: 100
    });

    // Add subject nodes in a circle around center
    const subjectList = Object.entries(subjects);
    const allTopics = [];

    subjectList.forEach(([key, subject], idx) => {
      const angle = (idx / subjectList.length) * 2 * Math.PI;
      const x = centerX + subjectRadius * Math.cos(angle);
      const y = centerY + subjectRadius * Math.sin(angle);

      const avgMastery = subject.topics && subject.topics.length > 0
        ? subject.topics.reduce((sum, t) => sum + (t.mastery || 0), 0) / subject.topics.length
        : 0;

      nodeArray.push({
        id: key,
        label: subject.name,
        type: 'subject',
        x,
        y,
        color: getSubjectColor(key),
        size: 30 + (avgMastery / 10), // Size grows with mastery
        mastery: avgMastery,
        topics: subject.topics || []
      });

      // Add topic nodes around each subject
      if (subject.topics && subject.topics.length > 0) {
        const topicRadius = 80;
        subject.topics.forEach((topic, topicIdx) => {
          const topicAngle = (topicIdx / subject.topics.length) * 2 * Math.PI;
          const topicX = x + topicRadius * Math.cos(topicAngle);
          const topicY = y + topicRadius * Math.sin(topicAngle);

          const topicNode = {
            id: `${key}-${topic.id}`,
            label: topic.name,
            type: 'topic',
            parentId: key,
            x: topicX,
            y: topicY,
            color: getMasteryColor(topic.mastery || 0),
            size: 12 + (topic.mastery / 10), // Size grows with mastery
            mastery: topic.mastery || 0,
            connections: getConceptConnections(topic.name),
            lastStudied: topic.lastStudied || null
          };
          
          nodeArray.push(topicNode);
          allTopics.push(topicNode);
        });
      }
    });

    setNodes(nodeArray);
  }, [subjects]);

  // Get subject color
  const getSubjectColor = (subjectKey) => {
    const colors = {
      'vlsi': '#FF6B9D',
      'iot': '#4ECDC4',
      'deep-learning': '#FFD93D',
      'cloud': '#95E1D3',
      'mis': '#C4A3FF'
    };
    return colors[subjectKey] || '#B5A3E5';
  };

  // Get mastery color
  const getMasteryColor = (mastery) => {
    if (mastery >= 80) return '#4CAF50';
    if (mastery >= 60) return '#8BC34A';
    if (mastery >= 40) return '#FFC107';
    if (mastery >= 20) return '#FF9800';
    return '#F44336';
  };

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    canvas.width = 800 * dpr;
    canvas.height = 600 * dpr;
    canvas.style.width = '800px';
    canvas.style.height = '600px';
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, 800, 600);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Filter nodes based on selected subjects
    let visibleNodes = nodes;
    if (filteredSubjects.length > 0) {
      visibleNodes = nodes.filter(node => {
        if (node.type === 'center') return true; // Always show center
        if (node.type === 'subject') return filteredSubjects.includes(node.id);
        if (node.type === 'topic') return filteredSubjects.includes(node.parentId);
        return false;
      });
    }

    // Draw connections
    visibleNodes.forEach(node => {
      // Draw topic-to-parent connections
      if (node.parentId) {
        const parent = visibleNodes.find(n => n.id === node.parentId);
        if (parent) {
          ctx.beginPath();
          ctx.moveTo(parent.x, parent.y);
          ctx.lineTo(node.x, node.y);
          ctx.strokeStyle = 'rgba(181, 163, 229, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Connect subjects to center
      if (node.type === 'subject') {
        const center = nodes.find(n => n.id === 'center');
        if (center) {
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(node.x, node.y);
          
          // Thicker line for higher mastery
          const lineWidth = 2 + (node.mastery / 25);
          ctx.strokeStyle = `rgba(181, 163, 229, ${0.3 + (node.mastery / 200)})`;
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        }
      }

      // Draw cross-connections between related topics (knowledge links!)
      if (node.type === 'topic' && node.connections && node.connections.length > 0) {
        node.connections.forEach(connectedName => {
          const connectedNode = visibleNodes.find(n => 
            n.type === 'topic' && n.label === connectedName
          );
          
          if (connectedNode) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(connectedNode.x, connectedNode.y);
            ctx.strokeStyle = 'rgba(255, 107, 157, 0.15)'; // Pink for knowledge connections
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]); // Dashed line
            ctx.stroke();
            ctx.setLineDash([]); // Reset
          }
        });
      }
    });

    // Draw nodes
    visibleNodes.forEach(node => {
      // Pulse animation for recently studied topics
      const isPulse = node.lastStudied && 
        (new Date() - new Date(node.lastStudied)) < 3600000; // Within 1 hour
      
      if (isPulse) {
        // Glow effect
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + 5, 0, 2 * Math.PI);
        ctx.fillStyle = `${node.color}33`; // 20% opacity
        ctx.fill();
      }

      // Draw circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
      
      // Highlight selected node
      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Add spark icon for high-mastery topics
      if (node.type === 'topic' && node.mastery >= 80) {
        ctx.fillStyle = '#FFD700';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✨', node.x, node.y - node.size - 5);
      }

      // Draw label
      ctx.fillStyle = '#2D3436';
      ctx.font = node.type === 'center' ? 'bold 16px Arial' : node.type === 'subject' ? 'bold 12px Arial' : '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const y = node.y + node.size + 15;
      
      if (node.type === 'center') {
        ctx.fillText(node.label, node.x, node.y);
      } else {
        ctx.fillText(node.label.length > 15 ? node.label.substring(0, 15) + '...' : node.label, node.x, y);
      }

      // Draw mastery indicator for topics
      if (node.type === 'topic' && node.mastery > 0) {
        const barWidth = 20;
        const barHeight = 3;
        const barX = node.x - barWidth / 2;
        const barY = node.y + node.size + 25;
        
        // Background
        ctx.fillStyle = '#E0E0E0';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress
        ctx.fillStyle = getMasteryColor(node.mastery);
        ctx.fillRect(barX, barY, (barWidth * node.mastery) / 100, barHeight);
      }
    });

    ctx.restore();
  }, [nodes, zoom, pan, selectedNode, filteredSubjects]);

  // Handle canvas click
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Find clicked node
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.size;
    });

    setSelectedNode(clickedNode || null);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF6] p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#2D3436]" style={{fontFamily: 'Playfair Display, serif'}}>
                  🧠 Birdseye View
                </h1>
                <p className="text-[#7A8A7D]">Your knowledge network - visualized</p>
              </div>
            </div>

            {/* Control buttons - Better organized */}
            <div className="flex items-center gap-3">
              {/* Sidebar Toggle */}
              <button
                onClick={() => setSidebarOpen?.(!sidebarOpen)}
                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition border border-gray-200"
                title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-300"></div>

              {/* Primary Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleYouTubeConnect}
                  disabled={isLoadingYouTube}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Import from Watch Later & Custom Playlists"
                >
                  {isLoadingYouTube ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Importing playlists...
                    </>
                  ) : (
                    <>
                      <Youtube className="w-4 h-4" />
                      Import from YouTube
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDiscovery(!showDiscovery)}
                  className={`px-4 py-2 rounded-lg transition font-semibold text-sm flex items-center gap-2 ${
                    showDiscovery 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  Discover New
                </button>
                <button
                  onClick={() => getWolframInsights()}
                  disabled={loadingInsights}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  {loadingInsights ? 'Analyzing...' : 'Wolfram Insights'}
                </button>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-300"></div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition"
                  title="Zoom out"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-gray-700 min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition"
                  title="Zoom in"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                  className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-semibold"
                  title="Reset view"
                >
                  Reset View
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subject Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">View:</span>
              <button
                onClick={() => setFilteredSubjects([])}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filteredSubjects.length === 0
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Subjects
              </button>
              {nodes.filter(n => n.type === 'subject').map(subject => (
                <button
                  key={subject.id}
                  onClick={() => {
                    if (filteredSubjects.includes(subject.id)) {
                      setFilteredSubjects(filteredSubjects.filter(id => id !== subject.id));
                    } else {
                      setFilteredSubjects([...filteredSubjects, subject.id]);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    filteredSubjects.includes(subject.id)
                      ? 'text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{
                    background: filteredSubjects.includes(subject.id) ? subject.color : undefined
                  }}
                >
                  {subject.label}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Discovery Panel */}
        <AnimatePresence>
          {showDiscovery && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Compass className="w-6 h-6 text-purple-600" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Discover New Interests</h2>
                      <p className="text-sm text-gray-600">Based on what you're already learning</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDiscovery(false)}
                    className="p-2 hover:bg-white rounded-full transition"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Adventure Level Slider */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">How adventurous?</span>
                    <span className="text-xs text-gray-500">
                      {adventureLevel < 33 ? '🎯 Conservative' : adventureLevel < 67 ? '🌟 Moderate' : '🚀 Adventurous'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={adventureLevel}
                    onChange={(e) => setAdventureLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-green-300 via-yellow-300 to-purple-500 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #86efac ${adventureLevel}%, #e5e7eb ${adventureLevel}%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Similar to current</span>
                    <span>Completely new</span>
                  </div>
                </div>

                {/* Suggested Topics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getSuggestedTopics().map((topic, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-lg p-4 hover:shadow-lg transition group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition">
                          {topic.name}
                        </h3>
                        <Badge className="text-xs" style={{ backgroundColor: '#E0E7FF', color: '#5B21B6' }}>
                          {topic.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{topic.reason}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.name + ' tutorial')}`, '_blank');
                          }}
                          className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition flex items-center justify-center gap-1"
                        >
                          <Youtube className="w-3 h-3" />
                          Video
                        </button>
                        <button
                          onClick={() => {
                            window.open(`https://www.google.com/search?q=${encodeURIComponent(topic.name + ' learning path')}`, '_blank');
                          }}
                          className="flex-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold hover:bg-purple-200 transition flex items-center justify-center gap-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          Learn
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wolfram Insights Panel */}
        <AnimatePresence>
          {wolframInsights && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-2 border-orange-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Wolfram Knowledge Insights
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-semibold">
                          AI-Powered
                        </span>
                      </h2>
                      <p className="text-sm text-gray-600">Deep connections from computational knowledge</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setWolframInsights(null)}
                    className="p-2 hover:bg-white rounded-full transition"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Interdisciplinary Fields */}
                  {wolframInsights.interdisciplinary && wolframInsights.interdisciplinary.length > 0 && (
                    <div className="bg-white rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        Interdisciplinary
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Fields that combine your interests
                      </p>
                      <div className="space-y-2">
                        {wolframInsights.interdisciplinary.map((field, idx) => (
                          <div key={idx} className="text-sm text-gray-700 bg-purple-50 rounded p-2">
                            {field}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emerging Fields */}
                  {wolframInsights.emerging && wolframInsights.emerging.length > 0 && (
                    <div className="bg-white rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        Emerging
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Cutting-edge developments
                      </p>
                      <div className="space-y-2">
                        {wolframInsights.emerging.map((field, idx) => (
                          <div key={idx} className="text-sm text-gray-700 bg-orange-50 rounded p-2">
                            {field}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Foundational */}
                  {wolframInsights.foundational && wolframInsights.foundational.length > 0 && (
                    <div className="bg-white rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        Foundational
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Core knowledge to strengthen
                      </p>
                      <div className="space-y-2">
                        {wolframInsights.foundational.map((field, idx) => (
                          <div key={idx} className="text-sm text-gray-700 bg-blue-50 rounded p-2">
                            {field}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-600 italic">
                    ⚡ <strong>Powered by Wolfram Alpha's computational knowledge engine.</strong> These insights are generated by analyzing relationships between your learning topics and the world's scientific knowledge.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          
          {/* Main Graph Canvas - Full Width */}
          <Card className="bg-white p-0 overflow-hidden">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full cursor-move"
              style={{ 
                cursor: isDragging ? 'grabbing' : 'grab',
                height: '600px'
              }}
            />
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-100">
                <div className="flex items-center justify-between text-sm flex-wrap gap-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#B5A3E5]"></div>
                      <span className="text-gray-700">You</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{background: 'linear-gradient(to right, #FF6B9D, #4ECDC4, #FFD93D)'}}></div>
                      <span className="text-gray-700">Subjects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-green-500"></div>
                      <span className="text-gray-700">Topics (by mastery)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-px bg-pink-400" style={{ width: '20px', borderTop: '2px dashed' }}></div>
                      <span className="text-gray-700">Connections</span>
                    </div>
                  </div>
                  <p className="text-gray-500 italic text-xs">💡 Drag to pan · Click nodes for details</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-purple-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {nodes.filter(n => n.type === 'subject').length}
                    </div>
                    <div className="text-xs text-gray-600">Subjects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">
                      {nodes.filter(n => n.type === 'topic').length}
                    </div>
                    <div className="text-xs text-gray-600">Topics</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {nodes.filter(n => n.type === 'topic' && n.mastery >= 80).length}
                    </div>
                    <div className="text-xs text-gray-600">Mastered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {nodes.filter(n => n.type === 'topic' && n.connections && n.connections.length > 0).reduce((sum, n) => sum + n.connections.length, 0)}
                    </div>
                    <div className="text-xs text-gray-600">Connections</div>
                  </div>
                </div>

                {/* Initialize Test Data Button - Show only if no subjects */}
                {nodes.filter(n => n.type === 'subject').length === 0 && (
                  <div className="mt-4 pt-4 border-t border-purple-200 space-y-3">
                    {/* YouTube Integration - PRIORITY */}
                    <button
                      onClick={handleYouTubeConnect}
                      disabled={isLoadingYouTube}
                      className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoadingYouTube ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Importing your playlists & videos...
                        </>
                      ) : (
                        <>
                          <Youtube className="w-5 h-5" />
                          🎬 Import from YouTube (Watch Later + Playlists!)
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      Imports from Watch Later and your custom playlists only
                    </p>

                    {/* Test Data - Secondary Option */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        initializeTestData();
                        window.location.reload();
                      }}
                      className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-medium shadow"
                    >
                      🎯 Initialize Test Data (Demo)
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                      Try with sample data (DSA, AIML, IoT)
                    </p>
                  </div>
                )}
              </div>
            </Card>

          {/* Floating Details Panel - Only when node selected */}
          <AnimatePresence mode="wait">
            {selectedNode && (
              <motion.div
                key="selected"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-4 right-4 w-96 max-h-[calc(100vh-200px)] overflow-y-auto z-10"
              >
                <Card className="bg-white shadow-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className="mb-2" style={{ backgroundColor: selectedNode.color, color: 'white' }}>
                        {selectedNode.type.toUpperCase()}
                      </Badge>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedNode.label}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {selectedNode.type === 'center' && (
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        This is you! The center of your learning journey.
                      </p>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-2">Connected Subjects:</h4>
                        <div className="space-y-2">
                          {nodes.filter(n => n.type === 'subject').map(subject => (
                            <div key={subject.id} className="flex items-center justify-between text-sm">
                              <span>{subject.label}</span>
                              <span className="font-semibold" style={{ color: subject.color }}>
                                {Math.round(subject.mastery)}% mastery
                              </span>
                            </div>
                          ))}
                        </div>
                        </div>
                      </div>
                    )}

                    {selectedNode.type === 'subject' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GitBranch className="w-4 h-4" />
                          <span>{selectedNode.topics?.length || 0} topics</span>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Overall Mastery</span>
                            <span className="text-lg font-bold" style={{ color: getMasteryColor(selectedNode.mastery) }}>
                              {Math.round(selectedNode.mastery)}%
                            </span>
                          </div>
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${selectedNode.mastery}%`,
                                backgroundColor: getMasteryColor(selectedNode.mastery)
                              }}
                            />
                          </div>
                        </div>

                        {selectedNode.topics && selectedNode.topics.length > 0 && (
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3">Topics:</h4>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                              {selectedNode.topics.slice(0, 10).map((topic, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-sm">{topic.name}</span>
                                    <span className="text-xs font-bold" style={{ color: getMasteryColor(topic.mastery || 0) }}>
                                      {topic.mastery || 0}%
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{ 
                                        width: `${topic.mastery || 0}%`,
                                        backgroundColor: getMasteryColor(topic.mastery || 0)
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedNode.type === 'topic' && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Mastery Level</span>
                            <span className="text-2xl font-bold" style={{ color: selectedNode.color }}>
                              {Math.round(selectedNode.mastery)}%
                            </span>
                          </div>
                          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${selectedNode.mastery}%`,
                                backgroundColor: selectedNode.color
                              }}
                            />
                          </div>
                        </div>

                        {/* Wolfram-Enhanced Connections */}
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-2 border-orange-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-orange-500" />
                              Smart Connections
                            </h4>
                            <button
                              onClick={() => getWolframConnections(selectedNode.label)}
                              className="text-xs text-orange-600 hover:text-orange-800 font-semibold"
                            >
                              🔄 Refresh
                            </button>
                          </div>
                          {enhancedConnections[selectedNode.label] ? (
                            <div className="flex flex-wrap gap-2">
                              {enhancedConnections[selectedNode.label].map((conn, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-white rounded-full text-xs font-semibold text-orange-700 border border-orange-300"
                                >
                                  {conn}
                                </span>
                              ))}
                            </div>
                          ) : selectedNode.connections && selectedNode.connections.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedNode.connections.map((conn, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-white rounded-full text-xs font-semibold text-purple-700 border border-purple-200"
                                >
                                  {conn}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <button
                              onClick={() => getWolframConnections(selectedNode.label)}
                              className="w-full px-3 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition text-xs font-semibold border border-orange-200"
                            >
                              ⚡ Discover connections with Wolfram
                            </button>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-2">
                          <button
                            onClick={async () => {
                              // Use Wolfram to find best learning resources
                              const query = `${selectedNode.label} tutorial`;
                              window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
                            }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition font-semibold text-sm flex items-center justify-center gap-2"
                          >
                            📺 Find Video Tutorial
                          </button>
                          <button
                            onClick={async () => {
                              // Ask Wolfram for practice problems
                              const query = `${selectedNode.label} practice problems exercises`;
                              window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                            }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-semibold text-sm flex items-center justify-center gap-2"
                          >
                            📚 Find Practice Problems
                          </button>
                          <button
                            onClick={async () => {
                              // Wolfram knowledge query
                              const result = await queryWolfram(selectedNode.label, 'knowledge');
                              if (result) {
                                alert(`Wolfram Knowledge:\n\n${result.substring(0, 300)}...`);
                              }
                            }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold text-sm flex items-center justify-center gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            Ask Wolfram
                          </button>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            Status
                          </h4>
                          <p className="text-sm text-gray-700">
                            {selectedNode.mastery >= 80 ? '🎉 Mastered! You know this well.' :
                             selectedNode.mastery >= 60 ? '💪 Good progress! Keep going.' :
                             selectedNode.mastery >= 40 ? '📚 Making progress. More practice needed.' :
                             selectedNode.mastery >= 20 ? '🌱 Just started. Keep studying!' :
                             '🆕 New topic. Time to dive in!'}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
        </div>

        {/* Add Topic Button - Below the graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex justify-center"
        >
          <button
            onClick={() => setShowAddTopicModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl font-bold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Topic Manually
          </button>
        </motion.div>
      </div>

      {/* Add Subject Modal */}
      {showAddTopicModal && (
        <AddSubjectModal
          onClose={() => setShowAddTopicModal(false)}
          onAdd={handleAddSubject}
        />
      )}
    </div>
  );
}
