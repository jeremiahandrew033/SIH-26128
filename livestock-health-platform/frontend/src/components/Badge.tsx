import React from 'react';

type BadgeVariant = 'forest' | 'alert' | 'critical' | 'info' | 'slate';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  forest: 'bg-forest-500/10 text-forest-400 border-forest-500/30',
  alert: 'bg-alert-500/10 text-alert-400 border-alert-500/30',
  critical: 'bg-critical-500/10 text-critical-400 border-critical-500/30',
  info: 'bg-info-500/10 text-info-400 border-info-500/30',
  slate: 'bg-slate-800/50 text-slate-300 border-slate-700/50',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'slate',
  size = 'md',
  icon,
  children,
  className = '',
}) => {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg font-semibold border transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
