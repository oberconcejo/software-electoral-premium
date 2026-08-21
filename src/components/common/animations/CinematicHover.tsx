import React from 'react';
import { motion } from 'motion/react';

interface CinematicHoverProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  lift?: number;
  scale?: number;
}

export function CinematicHover({
  children,
  className = '',
  glowColor = 'rgba(99, 102, 241, 0.15)',
  lift = -5,
  scale = 1.02
}: CinematicHoverProps) {
  return (
    <motion.div
      whileHover={{ 
        y: lift, 
        scale: scale,
        boxShadow: `0 20px 40px -10px ${glowColor}`
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
