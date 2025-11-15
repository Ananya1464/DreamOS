import React from 'react';
import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// BUTTON COMPONENT 🌸
// ═══════════════════════════════════════════════════════════════
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  icon,
  fullWidth = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-[#C5B9E5] text-white hover:shadow-lg border-2 border-[#B5A8D5] hover:bg-[#B5A8D5]',
    secondary: 'bg-white text-[#9B8AA3] border-2 border-[#E6E3F5] hover:bg-[#E6E3F5] hover:border-[#C5A3FF]',
    ghost: 'bg-transparent text-[#9B8AA3] hover:bg-[#F8F6ED]',
    success: 'bg-[#9BC89B] text-white border-2 border-[#8AB88A] hover:bg-[#8AB88A]',
    danger: 'bg-[#F5B5B5] text-white border-2 border-[#EDA5A5] hover:bg-[#EDA5A5]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-2xl font-semibold
        transition-all duration-300
        shadow-sm
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  );
};

// ═══════════════════════════════════════════════════════════════
// CARD COMPONENT 🎴
// ═══════════════════════════════════════════════════════════════
export const Card = ({ 
  children, 
  hover = true, 
  className = '',
  gradient = false,
  onClick
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' } : {}}
      onClick={onClick}
      className={`
        ${gradient 
          ? 'bg-gradient-to-br from-white to-[#F8F6ED]' 
          : 'bg-white'
        }
        rounded-3xl p-6
        shadow-md
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// BADGE COMPONENT 🏷️
// ═══════════════════════════════════════════════════════════════
export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    critical: 'bg-[#FFE5E8] text-[#FF9B9B]',
    high: 'bg-[#FFFACD] text-[#D4A000]',
    medium: 'bg-[#D5F4E6] text-[#80D6D6]',
    low: 'bg-[#D9E4E0] text-[#7A8A7D]',
    default: 'bg-[#E6E3F5] text-[#9B8AA3]',
    success: 'bg-[#D5F4E6] text-[#80D6D6]',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`
      inline-flex items-center
      ${variants[variant]}
      ${sizes[size]}
      rounded-xl font-semibold
    `}>
      {children}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// PROGRESS BAR COMPONENT 📊
// ═══════════════════════════════════════════════════════════════
export const ProgressBar = ({ 
  value, 
  max = 100, 
  color = 'primary',
  showLabel = true,
  height = 'md',
  animated = true
}) => {
  const percentage = (value / max) * 100;

  const colors = {
    primary: 'from-[#C5A3FF] to-[#FFB5C0]',
    success: 'from-[#80D6D6] to-[#D5F4E6]',
    warning: 'from-[#FFFACD] to-[#FFE5D9]',
    info: 'from-[#C5E3F6] to-[#E6E3F5]',
  };

  const heights = {
    sm: 'h-3',    // Was h-2, increased for visibility
    md: 'h-6',    // Was h-3, MUCH thicker for ADHD scanning
    lg: 'h-10',   // Was h-4, BOLD and prominent
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-2 text-sm text-[#7A8A7D]">
          <span>{value}</span>
          <span>/ {max}</span>
        </div>
      )}
      <div className={`w-full bg-[#F8F6ED] rounded-full overflow-hidden ${heights[height]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ 
            width: `${percentage}%`,
            // Pulse when close to goal (>70%)
            scale: percentage > 70 ? [1, 1.02, 1] : 1
          }}
          transition={{ 
            width: { duration: animated ? 1 : 0, ease: 'easeOut' },
            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          className={`h-full bg-gradient-to-r ${colors[color]} relative rounded-full`}
        >
          {animated && (
            <div className="absolute inset-0 shimmer"></div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// INPUT COMPONENT 📝
// ═══════════════════════════════════════════════════════════════
export const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange,
  icon,
  error,
  ...props
}) => {
  return (
    <div className="w-full">
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9B8AA3]">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full px-4 py-3 ${icon ? 'pl-12' : ''}
            bg-white
            border-2 border-[#F8F6ED]
            rounded-2xl
            text-[#2D3436]
            placeholder-[#9B8AA3]/50
            focus:outline-none focus:border-[#C5A3FF]
            focus:ring-4 focus:ring-[#C5A3FF]/10
            transition-all duration-300
            ${error ? 'border-[#FF9B9B]' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-[#FF9B9B]">{error}</p>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TEXTAREA COMPONENT 📄
// ═══════════════════════════════════════════════════════════════
export const TextArea = ({ 
  placeholder, 
  value, 
  onChange,
  rows = 4,
  error,
  ...props
}) => {
  return (
    <div className="w-full">
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`
          w-full px-4 py-3
          bg-white
          border-2 border-[#F8F6ED]
          rounded-2xl
          text-[#2D3436]
          placeholder-[#9B8AA3]/50
          focus:outline-none focus:border-[#C5A3FF]
          focus:ring-4 focus:ring-[#C5A3FF]/10
          transition-all duration-300
          resize-none
          ${error ? 'border-[#FF9B9B]' : ''}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-[#FF9B9B]">{error}</p>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CHECKBOX COMPONENT ✅
// ═══════════════════════════════════════════════════════════════
export const Checkbox = ({ checked, onChange, label, size = 'md' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <motion.div
          whileTap={{ scale: 0.95 }}
          className={`
            ${sizes[size]}
            border-2 border-[#E6E3F5]
            rounded-lg
            transition-all duration-300
            group-hover:border-[#C5A3FF]
            ${checked 
              ? 'bg-gradient-to-br from-[#C5A3FF] to-[#E6E3F5] border-[#C5A3FF]' 
              : 'bg-white'
            }
            flex items-center justify-center
          `}
        >
          {checked && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </motion.svg>
          )}
        </motion.div>
      </div>
      {label && (
        <span className="text-[#2D3436] select-none">{label}</span>
      )}
    </label>
  );
};

// ═══════════════════════════════════════════════════════════════
// MODAL COMPONENT 🪟
// ═══════════════════════════════════════════════════════════════
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-white rounded-3xl shadow-2xl
          ${sizes[size]}
          w-full max-h-[90vh] overflow-y-auto
          p-6
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#2D3436]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#9B8AA3] hover:text-[#2D3436] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TOAST COMPONENT 🍞
// ═══════════════════════════════════════════════════════════════
export const Toast = ({ message, type = 'success', isVisible }) => {
  if (!isVisible) return null;

  const types = {
    success: {
      bg: 'from-[#80D6D6] to-[#D5F4E6]',
      icon: '✓',
    },
    error: {
      bg: 'from-[#FF9B9B] to-[#FFB5C0]',
      icon: '✕',
    },
    info: {
      bg: 'from-[#C5E3F6] to-[#E6E3F5]',
      icon: 'ℹ',
    },
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className={`
        fixed bottom-8 right-8 z-50
        bg-gradient-to-r ${types[type].bg}
        text-white px-6 py-4 rounded-2xl
        shadow-xl
        flex items-center gap-3
      `}
    >
      <span className="text-2xl">{types[type].icon}</span>
      <span className="font-semibold">{message}</span>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE COMPONENT 🌸
// ═══════════════════════════════════════════════════════════════
export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-xl font-bold text-[#2D3436] mb-2">{title}</h3>
      <p className="text-[#7A8A7D] mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// LOADING SPINNER COMPONENT ⏳
// ═══════════════════════════════════════════════════════════════
export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`
          ${sizes[size]}
          border-4 border-[#E6E3F5]
          border-t-[#C5A3FF]
          rounded-full
        `}
      />
    </div>
  );
};
