import React from 'react';
import { motion } from 'motion/react';

interface CinematicRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  duration?: number;
  viewportOnce?: boolean;
}

export function CinematicReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  duration = 0.6,
  viewportOnce = false,
}: CinematicRevealProps) {
  const getDirectionOffset = () => {
    switch (direction) {
      case 'up': return { y: 30, x: 0 };
      case 'down': return { y: -30, x: 0 };
      case 'left': return { x: 30, y: 0 };
      case 'right': return { x: -30, y: 0 };
      case 'none': return { x: 0, y: 0 };
      default: return { y: 30, x: 0 };
    }
  };

  const offset = getDirectionOffset();

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        filter: 'blur(10px)', 
        scale: 0.96, 
        x: offset.x,
        y: offset.y
      }}
      whileInView={{ 
        opacity: 1, 
        filter: 'blur(0px)', 
        scale: 1, 
        x: 0,
        y: 0
      }}
      viewport={{ once: viewportOnce, margin: '-40px' }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
