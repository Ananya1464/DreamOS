import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Star Animation - Quick reward feedback! ⭐
 * Usage: <StarAnimation show={true} x={100} y={100} />
 */
export default function StarAnimation({ show, x = null, y = null, count = 5 }) {
  const stars = Array.from({ length: count }, (_, i) => i);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {stars.map((star) => (
            <Star key={star} index={star} x={x} y={y} />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

function Star({ index, x, y }) {
  const randomX = x !== null ? x : Math.random() * window.innerWidth;
  const randomY = y !== null ? y : Math.random() * window.innerHeight * 0.5;
  
  const angle = (index / 5) * Math.PI * 2;
  const distance = 100 + Math.random() * 50;
  const endX = randomX + Math.cos(angle) * distance;
  const endY = randomY + Math.sin(angle) * distance;

  const colors = ['#FFD700', '#FFA500', '#FFE5B4', '#FFEC8B', '#F0E68C'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      initial={{
        x: randomX,
        y: randomY,
        scale: 0,
        opacity: 1,
        rotate: 0
      }}
      animate={{
        x: endX,
        y: endY,
        scale: [0, 1.5, 1, 0],
        opacity: [1, 1, 1, 0],
        rotate: [0, 180, 360]
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
        times: [0, 0.3, 0.6, 1]
      }}
      className="absolute"
      style={{ color }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </motion.div>
  );
}

/**
 * Floating Stars Effect - Background ambient stars
 */
export function FloatingStars({ count = 20 }) {
  const stars = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star) => (
        <FloatingStar key={star} />
      ))}
    </div>
  );
}

function FloatingStar() {
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const size = Math.random() * 15 + 10;
  const duration = Math.random() * 3 + 2;
  const delay = Math.random() * 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 0.6, 0],
        scale: [0, 1, 0],
        rotate: [0, 180]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 3
      }}
      className="absolute text-yellow-300"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size
      }}
    >
      ⭐
    </motion.div>
  );
}

/**
 * Star Burst - Explosive star effect from center point
 */
export function StarBurst({ x, y, onComplete }) {
  const particles = Array.from({ length: 12 }, (_, i) => i);

  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => {
        const angle = (p / 12) * Math.PI * 2;
        const distance = 150;
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;

        return (
          <motion.div
            key={p}
            initial={{ x, y, scale: 0, opacity: 1 }}
            animate={{ 
              x: endX, 
              y: endY, 
              scale: [0, 1, 0],
              opacity: [1, 1, 0]
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute text-yellow-400"
            style={{ fontSize: '24px' }}
          >
            ✨
          </motion.div>
        );
      })}
      
      {/* Center explosion */}
      <motion.div
        initial={{ x, y, scale: 0, opacity: 1 }}
        animate={{ 
          scale: [0, 2, 0],
          opacity: [1, 0.5, 0],
          rotate: [0, 360]
        }}
        transition={{ duration: 0.8 }}
        className="absolute text-yellow-300"
        style={{ fontSize: '48px' }}
      >
        ⭐
      </motion.div>
    </div>
  );
}

/**
 * Sparkle Trail - Follow cursor with sparkles
 */
export function SparkleTrail() {
  const [sparkles, setSparkles] = React.useState([]);
  const nextId = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newSparkle = {
        id: nextId.current++,
        x: e.clientX,
        y: e.clientY
      };
      
      setSparkles(prev => [...prev, newSparkle]);
      
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <motion.div
            key={sparkle.id}
            initial={{ x: sparkle.x, y: sparkle.y, scale: 0, opacity: 1 }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [1, 0.5, 0],
              y: sparkle.y - 30
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute text-yellow-300"
            style={{ fontSize: '20px' }}
          >
            ✨
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
