import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Trash2, Info, Database, HardDrive } from 'lucide-react';
import { Card, Button } from './UI';
import { exportAllData, importData, clearAllStorage, getStorageInfo } from '../utils/storage';

// ═══════════════════════════════════════════════════════════════
// SETTINGS COMPONENT - Data Management & Backup 💾
// ═══════════════════════════════════════════════════════════════
export default function Settings() {
  const [storageInfo, setStorageInfo] = useState(null);
  const [importing, setImporting] = useState(false);

  // Load storage info on mount
  React.useEffect(() => {
    setStorageInfo(getStorageInfo());
  }, []);

  // Handle export
  const handleExport = () => {
    const success = exportAllData();
    if (success) {
      alert('✅ Data exported successfully! Check your Downloads folder.');
    } else {
      alert('❌ Export failed. Please try again.');
    }
  };

  // Handle import
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const success = importData(event.target.result);
        if (success) {
          alert('✅ Data imported successfully! Refreshing page...');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          alert('❌ Import failed. Please check the file format.');
        }
      } catch (error) {
        alert('❌ Import failed: ' + error.message);
      } finally {
        setImporting(false);
      }
    };
    
    reader.onerror = () => {
      alert('❌ Failed to read file.');
      setImporting(false);
    };
    
    reader.readAsText(file);
  };

  // Handle clear all data
  const handleClearAll = () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will delete ALL your data!\n\n' +
      'Are you sure you want to continue?\n\n' +
      'Make sure you have exported a backup first!'
    );
    
    if (confirmed) {
      const doubleCheck = window.confirm(
        '🚨 FINAL WARNING!\n\n' +
        'This action CANNOT be undone.\n' +
        'All subjects, schedule, journal entries, and progress will be PERMANENTLY deleted.\n\n' +
        'Continue?'
      );
      
      if (doubleCheck) {
        clearAllStorage();
        alert('🗑️ All data cleared. Refreshing page...');
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF6] p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#2D3436] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
            ⚙️ Settings & Data
          </h1>
          <p className="text-[#7A8A7D]">Manage your data, export backups, and more</p>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            STORAGE INFO
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-br from-[#E6D4F5] to-[#FFE5E8]">
            <div className="flex items-start gap-4">
              <Database className="w-8 h-8 text-[#B5A3E5] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#2D3436] mb-2">Storage Usage</h3>
                {storageInfo ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#7A8A7D]">Total Storage:</span>
                      <span className="font-bold text-[#2D3436]">
                        {storageInfo.totalSizeKB} KB ({storageInfo.totalSizeMB} MB)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7A8A7D]">Usage:</span>
                      <span className="font-bold text-[#2D3436]">{storageInfo.percentUsed}%</span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-[#F8F6ED] rounded-full overflow-hidden mt-3">
                      <div 
                        className="h-full bg-gradient-to-r from-[#B5A3E5] to-[#FFB4D1] rounded-full"
                        style={{ width: `${Math.min(storageInfo.percentUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[#7A8A7D]">Loading storage info...</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            BACKUP & RESTORE
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <h3 className="text-xl font-bold text-[#2D3436] mb-4">
              <HardDrive className="w-6 h-6 inline mr-2" />
              Backup & Restore
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export */}
              <div className="p-4 bg-gradient-to-br from-[#D5F4E6] to-white rounded-2xl border-2 border-[#7DD3C0]">
                <Download className="w-8 h-8 text-[#7DD3C0] mb-3" />
                <h4 className="text-lg font-bold text-[#2D3436] mb-2">Export Data</h4>
                <p className="text-sm text-[#7A8A7D] mb-4">
                  Download all your data as a JSON file. Keep it safe as a backup!
                </p>
                <Button 
                  onClick={handleExport}
                  className="w-full bg-gradient-to-r from-[#7DD3C0] to-[#90C8E8]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Backup
                </Button>
              </div>

              {/* Import */}
              <div className="p-4 bg-gradient-to-br from-[#E6F3FF] to-white rounded-2xl border-2 border-[#90C8E8]">
                <Upload className="w-8 h-8 text-[#90C8E8] mb-3" />
                <h4 className="text-lg font-bold text-[#2D3436] mb-2">Import Data</h4>
                <p className="text-sm text-[#7A8A7D] mb-4">
                  Restore your data from a previously exported backup file.
                </p>
                <label className="block">
                  <Button 
                    as="span"
                    className="w-full bg-gradient-to-r from-[#90C8E8] to-[#B5A3E5] cursor-pointer"
                    disabled={importing}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {importing ? 'Importing...' : 'Import Backup'}
                  </Button>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImport}
                    className="hidden"
                    disabled={importing}
                  />
                </label>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-4 bg-[#FFF9E6] rounded-xl border-2 border-[#FFE66D]">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#D4A017] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[#8B7355]">
                  <p className="font-bold mb-1">💡 Backup Recommendations:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Export your data <strong>weekly</strong></li>
                    <li>Keep backups in Google Drive or Dropbox</li>
                    <li>Always export before clearing data</li>
                    <li>Backup files include ALL your progress</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            DANGER ZONE
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-[#FF9B9B]">
            <h3 className="text-xl font-bold text-[#FF9B9B] mb-4">
              <Trash2 className="w-6 h-6 inline mr-2" />
              Danger Zone
            </h3>
            
            <div className="p-4 bg-gradient-to-br from-[#FFE5E8] to-white rounded-2xl">
              <h4 className="text-lg font-bold text-[#2D3436] mb-2">Clear All Data</h4>
              <p className="text-sm text-[#7A8A7D] mb-4">
                ⚠️ This will permanently delete ALL your data including subjects, schedule, journal entries, and progress.
                <strong className="block mt-2 text-[#FF9B9B]">This action CANNOT be undone!</strong>
              </p>
              <Button 
                onClick={handleClearAll}
                className="bg-gradient-to-r from-[#FF9B9B] to-[#FFB4A4] hover:from-[#FF8080] hover:to-[#FF9B9B]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="bg-gradient-to-br from-[#F5F1E8] to-white">
            <h3 className="text-lg font-bold text-[#2D3436] mb-3">💡 Pro Tips</h3>
            <ul className="space-y-2 text-sm text-[#7A8A7D]">
              <li>✅ Your data is stored locally in your browser</li>
              <li>✅ No account needed - everything stays on your device</li>
              <li>✅ Export backups to sync across devices</li>
              <li>✅ Clearing browser data will delete everything</li>
              <li>✅ Use incognito mode = no data persistence</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
