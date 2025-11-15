/**
 * Test Data Initializer
 * Adds sample subjects and topics for demo/testing
 */

import { saveSubjects } from './storage';

export const initializeTestData = () => {
  const testSubjects = {
    dsa: {
      id: 'dsa',
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      credits: 4,
      instructor: 'Dr. Rajesh Kumar',
      color: '#FF6B6B',
      semester: 'Fall 2025',
      topics: [
        {
          id: 'dsa-1',
          name: 'Arrays & Strings',
          mastery: 75,
          lastStudied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Two pointer technique, sliding window',
          resources: []
        },
        {
          id: 'dsa-2',
          name: 'Linked Lists',
          mastery: 60,
          lastStudied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Reverse, detect cycle, merge',
          resources: []
        },
        {
          id: 'dsa-3',
          name: 'Trees & Graphs',
          mastery: 45,
          lastStudied: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'BFS, DFS, tree traversals',
          resources: []
        },
        {
          id: 'dsa-4',
          name: 'Dynamic Programming',
          mastery: 30,
          lastStudied: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Memoization, tabulation',
          resources: []
        },
        {
          id: 'dsa-5',
          name: 'Sorting & Searching',
          mastery: 85,
          lastStudied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'QuickSort, MergeSort, Binary Search',
          resources: []
        }
      ]
    },
    aiml: {
      id: 'aiml',
      name: 'AI & Machine Learning',
      code: 'CS301',
      credits: 4,
      instructor: 'Dr. Priya Sharma',
      color: '#4ECDC4',
      semester: 'Fall 2025',
      topics: [
        {
          id: 'aiml-1',
          name: 'Neural Networks',
          mastery: 65,
          lastStudied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Backpropagation, activation functions',
          resources: []
        },
        {
          id: 'aiml-2',
          name: 'Deep Learning',
          mastery: 50,
          lastStudied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'CNNs, RNNs, transformers',
          resources: []
        },
        {
          id: 'aiml-3',
          name: 'Supervised Learning',
          mastery: 70,
          lastStudied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Linear regression, decision trees',
          resources: []
        },
        {
          id: 'aiml-4',
          name: 'Unsupervised Learning',
          mastery: 40,
          lastStudied: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'K-means, PCA, clustering',
          resources: []
        },
        {
          id: 'aiml-5',
          name: 'Computer Vision',
          mastery: 35,
          lastStudied: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Image classification, object detection',
          resources: []
        }
      ]
    },
    iot: {
      id: 'iot',
      name: 'Internet of Things',
      code: 'ECE401',
      credits: 3,
      instructor: 'Dr. Anand Verma',
      color: '#95E1D3',
      semester: 'Fall 2025',
      topics: [
        {
          id: 'iot-1',
          name: 'Sensors & Actuators',
          mastery: 80,
          lastStudied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Temperature, motion, servo motors',
          resources: []
        },
        {
          id: 'iot-2',
          name: 'Arduino & Microcontrollers',
          mastery: 75,
          lastStudied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'ESP32, NodeMCU, programming',
          resources: []
        },
        {
          id: 'iot-3',
          name: 'Communication Protocols',
          mastery: 55,
          lastStudied: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'MQTT, HTTP, WebSockets',
          resources: []
        },
        {
          id: 'iot-4',
          name: 'Cloud Integration',
          mastery: 45,
          lastStudied: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'AWS IoT, Firebase, ThingSpeak',
          resources: []
        },
        {
          id: 'iot-5',
          name: 'Edge Computing',
          mastery: 25,
          lastStudied: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Local processing, latency optimization',
          resources: []
        }
      ]
    }
  };

  // Save to localStorage
  saveSubjects(testSubjects);
  
  console.log('✅ Test data initialized!');
  console.log('📚 Added 3 subjects: DSA, AI/ML, IoT');
  console.log('📖 Total topics: 15');
  
  return testSubjects;
};

// Auto-initialize if localStorage is empty
export const autoInitIfNeeded = () => {
  const existingSubjects = localStorage.getItem('subjects');
  
  if (!existingSubjects || existingSubjects === '{}') {
    console.log('🔄 No subjects found, initializing test data...');
    return initializeTestData();
  }
  
  return null;
};
