import React from 'react';
import { cn } from '@/src/lib/utils';
import { CinematicReveal } from '../common/animations/CinematicReveal';
import { CinematicHover } from '../common/animations/CinematicHover';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, title, subtitle, headerAction, hoverable = false, icon: Icon, ...props }) => {
  const cardContent = (
    <div
      className={cn('bg-white/5 border border-white/10 rounded-3xl overflow-hidden', className)}
      {...props}
    >
      {(title || subtitle || headerAction || Icon) && (
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-indigo-400" />}
            <div>
              {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {headerAction}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const revealedCard = (
    <CinematicReveal>
      {cardContent}
    </CinematicReveal>
  );

  return hoverable ? (
    <CinematicHover lift={-3}>
      {revealedCard}
    </CinematicHover>
  ) : revealedCard;
};
