import React, { useState, useEffect } from 'react';
import { Calendar, Target, BookOpen, Trophy, Flame, CheckCircle2, Circle, AlertTriangle, Plus, FileText, Link as LinkIcon, Trash2, Brain, Book } from 'lucide-react';

// ==========================================
// STORAGE UTILITIES
// ==========================================
const StorageManager = {
  KEYS: {
    SUBJECTS: 'brutalos_subjects',
    RESOURCES: 'brutalos_resources',
    GRE: 'brutalos_gre',
    SETTINGS: 'brutalos_settings'
  },

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }
};

// ==========================================
// YOUR ACTUAL SYLLABUS - Based on CO Mappings & Hours
// ==========================================
const ACTUAL_SYLLABUS = {
  VLSI: {
    examDate: '2024-11-20',
    targetScore: 55,
    color: 'bg-purple-500',
    totalHours: 45,
    topics: [
      { name: 'MOS Transistor Theory', hours: 8, priority: 'CRITICAL', cos: ['CO1'], revisions: [false, false, false] },
      { name: 'CMOS Inverter & Logic Gates', hours: 10, priority: 'CRITICAL', cos: ['CO2', 'CO3'], revisions: [false, false, false] },
      { name: 'Combinational & Sequential Circuits', hours: 8, priority: 'HIGH', cos: ['CO3', 'CO4'], revisions: [false, false, false] },
      { name: 'Memory Design (SRAM/DRAM)', hours: 7, priority: 'HIGH', cos: ['CO4'], revisions: [false, false, false] },
      { name: 'Timing Analysis & Clock Distribution', hours: 6, priority: 'MEDIUM', cos: ['CO5'], revisions: [false, false, false] },
      { name: 'Power Optimization Techniques', hours: 6, priority: 'MEDIUM', cos: ['CO5'], revisions: [false, false, false] }
    ]
  },
  IOT: {
    examDate: '2024-11-23',
    targetScore: 55,
    color: 'bg-blue-500',
    totalHours: 42,
    topics: [
      { name: 'IoT Architecture & Protocols', hours: 10, priority: 'CRITICAL', cos: ['CO1', 'CO2'], revisions: [false, false, false] },
      { name: 'Sensors & Actuators', hours: 8, priority: 'HIGH', cos: ['CO2'], revisions: [false, false, false] },
      { name: 'Communication Technologies (BLE, Zigbee, LoRa)', hours: 9, priority: 'CRITICAL', cos: ['CO3'], revisions: [false, false, false] },
      { name: 'Cloud Platforms & Data Analytics', hours: 8, priority: 'HIGH', cos: ['CO4'], revisions: [false, false, false] },
      { name: 'IoT Security & Privacy', hours: 7, priority: 'MEDIUM', cos: ['CO5'], revisions: [false, false, false] }
    ]
  },
  DL: {
    examDate: '2024-11-26',
    targetScore: 55,
    color: 'bg-green-500',
    totalHours: 48,
    topics: [
      { name: 'Neural Network Fundamentals', hours: 10, priority: 'CRITICAL', cos: ['CO1'], revisions: [false, false, false] },
      { name: 'Backpropagation & Optimization', hours: 9, priority: 'CRITICAL', cos: ['CO2'], revisions: [false, false, false] },
      { name: 'CNN Architecture & Applications', hours: 10, priority: 'CRITICAL', cos: ['CO3'], revisions: [false, false, false] },
      { name: 'RNN, LSTM & Sequence Models', hours: 9, priority: 'HIGH', cos: ['CO4'], revisions: [false, false, false] },
      { name: 'Transfer Learning & GANs', hours: 6, priority: 'MEDIUM', cos: ['CO5'], revisions: [false, false, false] },
      { name: 'Regularization & Model Tuning', hours: 4, priority: 'LOW', cos: ['CO5'], revisions: [false, false, false] }
    ]
  },
  CC: {
    examDate: '2024-11-29',
    targetScore: 55,
    color: 'bg-yellow-500',
    totalHours: 40,
    topics: [
      { name: 'Cloud Computing Fundamentals & Service Models', hours: 10, priority: 'CRITICAL', cos: ['CO1', 'CO2'], revisions: [false, false, false] },
      { name: 'Virtualization Technologies', hours: 8, priority: 'HIGH', cos: ['CO2'], revisions: [false, false, false] },
      { name: 'Cloud Architecture & Deployment Models', hours: 8, priority: 'HIGH', cos: ['CO3'], revisions: [false, false, false] },
      { name: 'Cloud Storage & Database Services', hours: 7, priority: 'MEDIUM', cos: ['CO4'], revisions: [false, false, false] },
      { name: 'Cloud Security & Compliance', hours: 7, priority: 'MEDIUM', cos: ['CO5'], revisions: [false, false, false] }
    ]
  },
  MIS: {
    examDate: '2024-12-02',
    targetScore: 55,
    color: 'bg-red-500',
    totalHours: 38,
    topics: [
      { name: 'MIS Fundamentals & Business Processes', hours: 9, priority: 'CRITICAL', cos: ['CO1'], revisions: [false, false, false] },
      { name: 'Information Systems Types & Applications', hours: 8, priority: 'HIGH', cos: ['CO2'], revisions: [false, false, false] },
      { name: 'Database Management Systems', hours: 8, priority: 'HIGH', cos: ['CO3'], revisions: [false, false, false] },
      { name: 'Decision Support & Expert Systems', hours: 7, priority: 'MEDIUM', cos: ['CO4'], revisions: [false, false, false] },
      { name: 'E-Commerce & Enterprise Systems', hours: 6, priority: 'MEDIUM', cos: ['CO5'], revisions: [false, false, false] }
    ]
  }
};

// ==========================================
// GRE DATA
// ==========================================
const DEFAULT_GRE = {
  examDate: '2024-12-10',
  targetScore: 320,
  driveLink: 'https://drive.google.com/drive/folders/1K7TwTBHMw5707iuZdmy-ayCBTkSz0_b5',
  verbal: { current: 0, target: 160, progress: 0 },
  quant: { current: 0, target: 160, progress: 0 },
  writing: { current: 0, target: 4, progress: 0 },
  vocab: { learned: 0, target: 1000, dailyGoal: 30 },
  reading: { pagesRead: 0, target: 600, dailyGoal: 20 }
};

// ==========================================
// CALCULATIONS
// ==========================================
const Calculations = {
  daysUntil(dateString) {
    const target = new Date(dateString);
    const today = new Date();
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  },

  subjectProgress(topics) {
    if (!topics || topics.length === 0) return 0;
    const totalRevisions = topics.length * 3;
    const completed = topics.reduce((sum, topic) => 
      sum + topic.revisions.filter(r => r).length, 0
    );
    return Math.round((completed / totalRevisions) * 100);
  },

  hourBasedPriority(topics) {
    return [...topics].sort((a, b) => b.hours - a.hours);
  },

  getUrgentTopics(subjects) {
    const urgent = [];
    Object.entries(subjects).forEach(([name, subject]) => {
      const daysLeft = this.daysUntil(subject.examDate);
      subject.topics.forEach(topic => {
        if (topic.priority === 'CRITICAL' && !topic.revisions.every(r => r)) {
          urgent.push({ subject: name, ...topic, daysLeft });
        }
      });
    });
    return urgent.sort((a, b) => a.daysLeft - b.daysLeft || b.hours - a.hours);
  }
};

// ==========================================
// MAIN APP
// ==========================================
export default function BrutalLearningOS() {
  const [subjects, setSubjects] = useState(() => 
    StorageManager.load(StorageManager.KEYS.SUBJECTS, ACTUAL_SYLLABUS)
  );
  const [resources, setResources] = useState(() =>
    StorageManager.load(StorageManager.KEYS.RESOURCES, {})
  );
  const [gre, setGre] = useState(() =>
    StorageManager.load(StorageManager.KEYS.GRE, DEFAULT_GRE)
  );
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    StorageManager.save(StorageManager.KEYS.SUBJECTS, subjects);
  }, [subjects]);

  useEffect(() => {
    StorageManager.save(StorageManager.KEYS.RESOURCES, resources);
  }, [resources]);

  useEffect(() => {
    StorageManager.save(StorageManager.KEYS.GRE, gre);
  }, [gre]);

  const toggleRevision = (subjectName, topicIndex, revisionIndex) => {
    setSubjects(prev => {
      const updated = { ...prev };
      updated[subjectName].topics[topicIndex].revisions[revisionIndex] = 
        !updated[subjectName].topics[topicIndex].revisions[revisionIndex];
      return updated;
    });
  };

  const addResource = (subjectName, resource) => {
    setResources(prev => ({
      ...prev,
      [subjectName]: [...(prev[subjectName] || []), { ...resource, id: Date.now() }]
    }));
  };

  const deleteResource = (subjectName, resourceId) => {
    setResources(prev => ({
      ...prev,
      [subjectName]: prev[subjectName].filter(r => r.id !== resourceId)
    }));
  };

  const updateGRE = (field, value) => {
    setGre(prev => ({ ...prev, [field]: { ...prev[field], ...value } }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dream Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 mb-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Masters @ Singapore</h1>
              </div>
              <p className="text-xl opacity-90">Not average. Disgustingly educated.</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75">Target</div>
              <div className="text-2xl font-bold">55+ All Subjects | 320+ GRE</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {['dashboard', 'exams', 'resources', 'gre'].map(view => (
            <button
              key={view}
              onClick={() => { setActiveView(view); setSelectedSubject(null); }}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeView === view
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        {/* Views */}
        {activeView === 'dashboard' && <DashboardView subjects={subjects} gre={gre} />}
        {activeView === 'exams' && (
          <ExamView
            subjects={subjects}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            toggleRevision={toggleRevision}
          />
        )}
        {activeView === 'resources' && (
          <ResourceView
            subjects={subjects}
            resources={resources}
            addResource={addResource}
            deleteResource={deleteResource}
          />
        )}
        {activeView === 'gre' && <GREView gre={gre} updateGRE={updateGRE} />}
      </div>

      {/* Floating Reminder */}
      <div className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4 shadow-2xl animate-pulse">
        <Target className="w-6 h-6" />
      </div>
    </div>
  );
}

// ==========================================
// DASHBOARD VIEW
// ==========================================
function DashboardView({ subjects, gre }) {
  const urgentTopics = Calculations.getUrgentTopics(subjects);
  const nearestExam = Object.entries(subjects)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => Calculations.daysUntil(a.examDate) - Calculations.daysUntil(b.examDate))[0];

  const avgProgress = Math.round(
    Object.values(subjects).reduce((sum, s) => sum + Calculations.subjectProgress(s.topics), 0) / 
    Object.keys(subjects).length
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-bold">Next Exam</h3>
          </div>
          <p className="text-3xl font-bold text-red-500">{Calculations.daysUntil(nearestExam.examDate)} days</p>
          <p className="text-gray-400 mt-1">{nearestExam.name}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-bold">Critical Topics</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-500">{urgentTopics.length}</p>
          <p className="text-gray-400 mt-1">High-hour topics pending</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-bold">Overall Progress</h3>
          </div>
          <p className="text-3xl font-bold text-green-500">{avgProgress}%</p>
          <p className="text-gray-400 mt-1">Target: 100%</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-bold">GRE Countdown</h3>
          </div>
          <p className="text-3xl font-bold text-blue-500">{Calculations.daysUntil(gre.examDate)} days</p>
          <p className="text-gray-400 mt-1">Target: 320+</p>
        </div>
      </div>

      {/* Critical Topics */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Flame className="w-6 h-6 text-red-500" />
          HIGH-HOUR CRITICAL TOPICS (DO THESE FIRST!)
        </h2>
        {urgentTopics.length === 0 ? (
          <p className="text-green-400">All critical topics covered! 🎉</p>
        ) : (
          <div className="space-y-3">
            {urgentTopics.slice(0, 5).map((item, i) => (
              <div key={i} className="bg-red-900/30 border border-red-500 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">{item.subject} - {item.name}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-red-400">Exam in {item.daysLeft} days</span>
                      <span className="text-yellow-400">• {item.hours} hours coverage</span>
                      <span className="text-blue-400">• COs: {item.cos.join(', ')}</span>
                    </div>
                  </div>
                  <span className="text-2xl">🔥</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// EXAM VIEW
// ==========================================
function ExamView({ subjects, selectedSubject, setSelectedSubject, toggleRevision }) {
  if (selectedSubject) {
    const subject = subjects[selectedSubject];
    const sortedTopics = Calculations.hourBasedPriority(subject.topics);

    return (
      <div>
        <button
          onClick={() => setSelectedSubject(null)}
          className="mb-6 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
        >
          ← Back
        </button>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold">{selectedSubject}</h2>
              <p className="text-gray-400 mt-2">Total: {subject.totalHours} hours | Target: {subject.targetScore}+</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Exam Date</div>
              <div className="text-xl font-bold">{subject.examDate}</div>
              <div className="text-red-400">{Calculations.daysUntil(subject.examDate)} days left</div>
            </div>
          </div>

          <div className="space-y-4">
            {sortedTopics.map((topic, idx) => {
              const originalIndex = subject.topics.indexOf(topic);
              return (
                <div
                  key={idx}
                  className={`bg-gray-700 rounded-lg p-4 ${
                    topic.priority === 'CRITICAL' ? 'border-2 border-red-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {topic.revisions.every(r => r) ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-500" />
                        )}
                        <h3 className="text-xl font-bold">{topic.name}</h3>
                      </div>
                      <div className="flex gap-3 mt-2 text-sm flex-wrap">
                        <span className={`px-2 py-1 rounded ${
                          topic.priority === 'CRITICAL' ? 'bg-red-600' :
                          topic.priority === 'HIGH' ? 'bg-orange-600' :
                          topic.priority === 'MEDIUM' ? 'bg-yellow-600' : 'bg-gray-600'
                        }`}>
                          {topic.priority}
                        </span>
                        <span className="px-2 py-1 rounded bg-blue-600">
                          {topic.hours} hours
                        </span>
                        <span className="px-2 py-1 rounded bg-purple-600">
                          COs: {topic.cos.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {topic.revisions.map((isComplete, revIndex) => (
                      <button
                        key={revIndex}
                        onClick={() => toggleRevision(selectedSubject, originalIndex, revIndex)}
                        className={`flex-1 py-3 rounded-lg font-semibold transition ${
                          isComplete
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      >
                        R{revIndex + 1}: {isComplete ? '✅' : '⭕'}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(subjects).map(([name, data]) => (
        <div
          key={name}
          onClick={() => setSelectedSubject(name)}
          className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:scale-105 transition border-2 border-transparent hover:border-purple-500"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">{name}</h3>
            <span className={`${data.color} w-4 h-4 rounded-full`}></span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Target Score:</span>
              <span className="font-bold text-green-400">{data.targetScore}+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Hours:</span>
              <span className="font-semibold">{data.totalHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Days Left:</span>
              <span className={`font-bold ${
                Calculations.daysUntil(data.examDate) <= 7 ? 'text-red-500' : 'text-green-500'
              }`}>
                {Calculations.daysUntil(data.examDate)}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-700">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="font-bold">{Calculations.subjectProgress(data.topics)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`${data.color} h-2 rounded-full transition-all`}
                  style={{ width: `${Calculations.subjectProgress(data.topics)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// RESOURCE VIEW
// ==========================================
function ResourceView({ subjects, resources, addResource, deleteResource }) {
  const [selectedSubject, setSelectedSubject] = useState(Object.keys(subjects)[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', type: 'pdf', url: '', notes: '' });

  const handleAdd = () => {
    if (newResource.title && (newResource.url || newResource.notes)) {
      addResource(selectedSubject, newResource);
      setNewResource({ title: '', type: 'pdf', url: '', notes: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subject Selector */}
      <div className="flex gap-4 flex-wrap">
        {Object.keys(subjects).map(name => (
          <button
            key={name}
            onClick={() => setSelectedSubject(name)}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              selectedSubject === name
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Add Resource Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Resource for {selectedSubject}
      </button>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Add New Resource</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Resource Title (e.g., VLSI Lecture Notes)"
              value={newResource.title}
              onChange={e => setNewResource({ ...newResource, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 rounded-lg"
            />
            <select
              value={newResource.type}
              onChange={e => setNewResource({ ...newResource, type: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 rounded-lg"
            >
              <option value="pdf">PDF</option>
              <option value="link">Link/URL</option>
              <option value="video">Video</option>
              <option value="notes">Notes</option>
            </select>
            <input
              type="text"
              placeholder="URL or Drive Link"
              value={newResource.url}
              onChange={e => setNewResource({ ...newResource, url: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 rounded-lg"
            />
            <textarea
              placeholder="Additional notes..."
              value={newResource.notes}
              onChange={e => setNewResource({ ...newResource, notes: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 rounded-lg h-24"
            />
            <div className="flex gap-4">
              <button onClick={handleAdd} className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold">
                Add Resource
              </button>
              <button onClick={() => setShowAddForm(false)} className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resources List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-4">{selectedSubject} Resources</h3>
        {(!resources[selectedSubject] || resources[selectedSubject].length === 0) ? (
          <p className="text-gray-400 text-center py-8">No resources added yet. Click "Add Resource" above!</p>
        ) : (
          <div className="space-y-3">
            {resources[selectedSubject].map(resource => (
              <div key={resource.id} className="bg-gray-700 rounded-lg p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {resource.type === 'pdf' && <FileText className="w-5 h-5 text-red-400" />}
                    {resource.type === 'link' && <LinkIcon className="w-5 h-5 text-blue-400" />}
                    {resource.type === 'video' && <BookOpen className="w-5 h-5 text-green-400" />}
                    {resource.type === 'notes' && <Book className="w-5 h-5 text-yellow-400" />}
                    <h4 className="font-bold text-lg">{resource.title}</h4>
                    <span className="text-xs px-2 py-1 bg-gray-600 rounded">{resource.type.toUpperCase()}</span>
                  </div>
                  {resource.url && (
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-sm block mb-2"
                    >
                      {resource.url}
                    </a>
                  )}
                  {resource.notes && (
                    <p className="text-gray-400 text-sm">{resource.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteResource(selectedSubject, resource.id)}
                  className="ml-4 p-2 bg-red-600 hover:bg-red-700 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// GRE VIEW
// ==========================================
function GREView({ gre, updateGRE }) {
  const daysLeft = Calculations.daysUntil(gre.examDate);
  const vocabRemaining = gre.vocab.target - gre.vocab.learned;
  const daysNeeded = Math.ceil(vocabRemaining / gre.vocab.dailyGoal);
  const readingRemaining = gre.reading.target - gre.reading.pagesRead;
  const readingDaysNeeded = Math.ceil(readingRemaining / gre.reading.dailyGoal);

  return (
    <div className="space-y-6">
      {/* GRE Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">GRE Preparation</h2>
            <p className="text-xl">Target Score: {gre.targetScore}+</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{daysLeft}</div>
            <div className="text-lg">Days Left</div>
            <div className="text-sm opacity-75">{gre.examDate}</div>
          </div>
        </div>
      </div>

      {/* Drive Link */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-3">📚 Your GRE Resources Drive</h3>
        <a
          href={gre.driveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          <LinkIcon className="w-5 h-5" />
          Open GRE Materials Drive
        </a>
      </div>

      {/* Section Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Verbal Reasoning</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Target:</span>
              <span className="font-bold">{gre.verbal.target}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Progress:</span>
              <span className="font-bold text-green-400">{gre.verbal.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={gre.verbal.progress}
              onChange={e => updateGRE('verbal', { progress: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Quantitative</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Target:</span>
              <span className="font-bold">{gre.quant.target}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Progress:</span>
              <span className="font-bold text-green-400">{gre.quant.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={gre.quant.progress}
              onChange={e => updateGRE('quant', { progress: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Analytical Writing</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Target:</span>
              <span className="font-bold">{gre.writing.target}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Progress:</span>
              <span className="font-bold text-green-400">{gre.writing.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={gre.writing.progress}
              onChange={e => updateGRE('writing', { progress: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Vocabulary Tracker */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-4">📖 Vocabulary Tracker</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg">Words Learned</span>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={gre.vocab.learned}
                onChange={e => updateGRE('vocab', { learned: parseInt(e.target.value) || 0 })}
                className="w-32 px-4 py-2 bg-gray-700 rounded-lg text-center font-bold text-xl"
              />
              <span className="text-gray-400">/ {gre.vocab.target}</span>
            </div>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all"
              style={{ width: `${(gre.vocab.learned / gre.vocab.target) * 100}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">Remaining</div>
              <div className="text-2xl font-bold text-yellow-400">{vocabRemaining} words</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">Daily Goal</div>
              <div className="text-2xl font-bold text-blue-400">{gre.vocab.dailyGoal} words</div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${daysNeeded <= daysLeft ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
            <p className="font-semibold">
              At {gre.vocab.dailyGoal} words/day, you'll complete in {daysNeeded} days.
            </p>
            <p className="text-sm mt-1">
              {daysNeeded <= daysLeft ? 
                `✅ You have ${daysLeft} days. You're on track!` :
                `⚠️ You need ${daysNeeded - daysLeft} more days. Increase daily goal or start now!`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Reading Tracker */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-4">📚 Reading Tracker</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg">Pages Read</span>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={gre.reading.pagesRead}
                onChange={e => updateGRE('reading', { pagesRead: parseInt(e.target.value) || 0 })}
                className="w-32 px-4 py-2 bg-gray-700 rounded-lg text-center font-bold text-xl"
              />
              <span className="text-gray-400">/ {gre.reading.target}</span>
            </div>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all"
              style={{ width: `${(gre.reading.pagesRead / gre.reading.target) * 100}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">Remaining</div>
              <div className="text-2xl font-bold text-yellow-400">{readingRemaining} pages</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">Daily Goal</div>
              <div className="text-2xl font-bold text-purple-400">{gre.reading.dailyGoal} pages</div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${readingDaysNeeded <= daysLeft ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
            <p className="font-semibold">
              At {gre.reading.dailyGoal} pages/day, you'll complete in {readingDaysNeeded} days.
            </p>
            <p className="text-sm mt-1">
              {readingDaysNeeded <= daysLeft ? 
                `✅ You have ${daysLeft} days. You're on track!` :
                `⚠️ You need ${readingDaysNeeded - daysLeft} more days. Read more daily!`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Today's GRE Tasks */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-4">✅ Today's GRE Tasks</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <input type="checkbox" className="w-5 h-5" />
            <span className="font-semibold">{gre.vocab.dailyGoal} new vocabulary words</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <input type="checkbox" className="w-5 h-5" />
            <span className="font-semibold">50 review words</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <input type="checkbox" className="w-5 h-5" />
            <span className="font-semibold">{gre.reading.dailyGoal} pages reading</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <input type="checkbox" className="w-5 h-5" />
            <span className="font-semibold">10 Quant practice problems</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <input type="checkbox" className="w-5 h-5" />
            <span className="font-semibold">1 Verbal practice section</span>
          </div>
        </div>
      </div>
    </div>
  );
}
