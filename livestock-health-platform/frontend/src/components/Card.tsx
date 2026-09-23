import React from 'react';

type CardVariant = 'base' | 'elevated' | 'interactive';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles = {
  base: 'bg-slate-900/50 border border-slate-800/60 rounded-2xl backdrop-blur transition-all duration-250',
  elevated: 'bg-slate-900/50 border border-slate-800/60 rounded-2xl backdrop-blur transition-all duration-250 shadow-lg hover:shadow-xl hover:border-slate-700/80',
  interactive: 'bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl backdrop-blur transition-all duration-250 cursor-pointer group',
};

export const Card: React.FC<CardProps> = ({
  variant = 'base',
  className = '',
  children,
}) => {
  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between gap-3 pb-3 border-b border-slate-800/60 ${className}`}>
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="flex-shrink-0 text-forest-400">{icon}</div>}
        <div className="min-w-0 flex-1">
          {title && <h3 className="font-bold text-slate-200 text-sm sm:text-base">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

interface CardBodyProps {
  className?: string;
  children: React.ReactNode;
}

export const CardBody: React.FC<CardBodyProps> = ({
  className = '',
  children,
}) => {
  return (
    <div className={`pt-3 ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className = '',
  children,
}) => {
  return (
    <div className={`flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/60 ${className}`}>
      {children}
    </div>
  );
};
