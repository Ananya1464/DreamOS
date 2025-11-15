import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, Check, Loader, Wifi } from 'lucide-react';

export default function SyncStatus({ syncing, offline, lastSynced, error }) {
  const getStatusConfig = () => {
    if (error) {
      return {
        icon: CloudOff,
        text: 'Sync error',
        color: 'text-red-500',
        bg: 'bg-red-50',
        border: 'border-red-200'
      };
    }
    
    if (offline) {
      return {
        icon: CloudOff,
        text: 'Offline',
        color: 'text-orange-500',
        bg: 'bg-orange-50',
        border: 'border-orange-200'
      };
    }
    
    if (syncing) {
      return {
        icon: Loader,
        text: 'Syncing...',
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        animate: true
      };
    }
    
    return {
      icon: Check,
      text: lastSynced ? `Synced ${getTimeAgo(lastSynced)}` : 'Synced',
      color: 'text-green-500',
      bg: 'bg-green-50',
      border: 'border-green-200'
    };
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return 'today';
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={config.text}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border-2 ${config.border}`}
      >
        <motion.div
          animate={config.animate ? { rotate: 360 } : {}}
          transition={config.animate ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        >
          <Icon className={`w-4 h-4 ${config.color}`} />
        </motion.div>
        <span className={`text-xs font-semibold ${config.color}`}>
          {config.text}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact version for header
export function SyncStatusCompact({ syncing, offline }) {
  if (!syncing && !offline) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-1.5"
    >
      {syncing && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Cloud className="w-4 h-4 text-[#B5A3E5]" />
        </motion.div>
      )}
      {offline && <CloudOff className="w-4 h-4 text-orange-500" />}
      <span className="text-xs text-[#7A8A7D]">
        {syncing ? 'Syncing...' : 'Offline'}
      </span>
    </motion.div>
  );
}
