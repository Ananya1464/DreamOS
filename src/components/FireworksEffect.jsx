import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Fireworks Effect - Celebration animation for achievements! 🎆
 * Usage: <FireworksEffect onComplete={() => console.log('Done!')} />
 */
export default function FireworksEffect({ onComplete, duration = 3000 }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particles = useRef([]);
  const fireworks = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle class
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
        this.size = Math.random() * 3 + 2;
      }

      update() {
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
        this.velocity.y += 0.15; // Gravity
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
        this.size *= 0.98;
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Firework rocket class
    class Firework {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetY = Math.random() * (canvas.height * 0.3) + 100;
        this.velocity = (canvas.height - this.targetY) / 60;
        this.exploded = false;
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        this.trail = [];
      }

      update() {
        if (!this.exploded) {
          this.y -= this.velocity;
          this.trail.push({ x: this.x, y: this.y, alpha: 1 });
          
          if (this.trail.length > 10) {
            this.trail.shift();
          }

          if (this.y <= this.targetY) {
            this.explode();
          }
        }

        // Update trail
        this.trail.forEach(t => {
          t.alpha *= 0.92;
        });
        this.trail = this.trail.filter(t => t.alpha > 0.01);
      }

      explode() {
        this.exploded = true;
        const particleCount = Math.random() * 50 + 80;
        
        for (let i = 0; i < particleCount; i++) {
          particles.current.push(new Particle(this.x, this.y, this.color));
        }
      }

      draw(ctx) {
        if (!this.exploded) {
          // Draw trail
          this.trail.forEach((point, index) => {
            ctx.save();
            ctx.globalAlpha = point.alpha * 0.5;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });

          // Draw rocket
          ctx.save();
          ctx.fillStyle = this.color;
          ctx.shadowBlur = 20;
          ctx.shadowColor = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw fireworks
      fireworks.current.forEach((fw, index) => {
        fw.update();
        fw.draw(ctx);
        if (fw.exploded && fw.trail.length === 0) {
          fireworks.current.splice(index, 1);
        }
      });

      // Update and draw particles
      particles.current.forEach((particle, index) => {
        particle.update();
        particle.draw(ctx);
        if (particle.alpha <= 0) {
          particles.current.splice(index, 1);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Launch fireworks at intervals
    const launchInterval = setInterval(() => {
      const count = Math.random() * 2 + 1;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          fireworks.current.push(new Firework());
        }, i * 200);
      }
    }, 600);

    animate();

    // Auto-cleanup
    const timeout = setTimeout(() => {
      clearInterval(launchInterval);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
    }, duration);

    // Cleanup
    return () => {
      clearInterval(launchInterval);
      clearTimeout(timeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
    </motion.div>
  );
}

// Simpler confetti version for quick celebrations
export function ConfettiEffect({ onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#B5A3E5', '#FFB4D1', '#90C8E8', '#FFE5B4', '#C8E890'];
    const confetti = [];

    class Confetto {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    // Create confetti
    for (let i = 0; i < 150; i++) {
      setTimeout(() => {
        confetti.push(new Confetto());
      }, i * 10);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach((c, index) => {
        c.update();
        c.draw(ctx);
        if (c.y > canvas.height) {
          confetti.splice(index, 1);
        }
      });

      if (confetti.length > 0) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    animate();
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 pointer-events-none"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  );
}
