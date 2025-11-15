/**
 * ActionConfirmation - UI component for confirming AI-proposed actions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getActionDescription, 
  getActionIcon, 
  validateAction 
} from '../utils/intentParser';
import { executeAction, executeBatchActions } from '../utils/executeAction';

const ActionConfirmation = ({ actions, onConfirm, onCancel }) => {
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState(null);

  const handleConfirm = async () => {
    setExecuting(true);

    try {
      let result;
      
      if (actions.length === 1) {
        // Single action
        result = await executeAction(actions[0]);
        setResults([{ action: actions[0], result }]);
      } else {
        // Multiple actions
        const batchResult = await executeBatchActions(actions);
        setResults(batchResult.results);
      }

      // Show results for 2 seconds, then call onConfirm
      setTimeout(() => {
        onConfirm(results || result);
      }, 2000);
      
    } catch (error) {
      console.error('Action execution error:', error);
      setResults([{ 
        action: actions[0], 
        result: { success: false, error: error.message } 
      }]);
      
      setTimeout(() => {
        onCancel();
      }, 2000);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  // Validation
  const validActions = actions.filter(validateAction);
  const hasInvalidActions = validActions.length !== actions.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-500/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
      >
        {/* Results View */}
        <AnimatePresence mode="wait">
          {results ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {results.every(r => r.result.success) ? '✅ Success!' : '❌ Error'}
              </h3>
              
              {results.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg ${
                    item.result.success 
                      ? 'bg-green-500/20 border border-green-500/50' 
                      : 'bg-red-500/20 border border-red-500/50'
                  }`}
                >
                  <p className={`text-sm ${
                    item.result.success ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {item.result.message || item.result.error}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Confirmation View */
            <motion.div
              key="confirmation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Luna wants to help</h3>
                  <p className="text-sm text-gray-400">Review and confirm actions</p>
                </div>
              </div>

              {/* Invalid Actions Warning */}
              {hasInvalidActions && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                  <p className="text-sm text-yellow-300">
                    ⚠️ Some actions have missing parameters and will be skipped
                  </p>
                </div>
              )}

              {/* Action List */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {actions.map((action, index) => {
                  const isValid = validateAction(action);
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border ${
                        isValid
                          ? 'bg-purple-500/10 border-purple-500/30'
                          : 'bg-gray-700/50 border-gray-600/50 opacity-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getActionIcon(action.type)}</span>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            {getActionDescription(action)}
                          </p>
                          {!isValid && (
                            <p className="text-xs text-red-400 mt-1">
                              Invalid parameters
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  disabled={executing}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  disabled={executing || validActions.length === 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {executing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Confirm {validActions.length > 1 ? `(${validActions.length})` : ''}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ActionConfirmation;
