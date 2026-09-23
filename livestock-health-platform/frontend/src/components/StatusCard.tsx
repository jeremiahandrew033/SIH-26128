import React from 'react';

interface StatusCardProps {
  label: string;
  value: string;
  status?: 'success' | 'danger' | 'warning' | 'neutral' | 'info';
  subtext?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatusCard: React.FC<StatusCardProps> = ({
  label,
  value,
  status = 'neutral',
  subtext,
  icon,
  trend,
}) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'success':
        return 'bg-forest-500/10 text-forest-400 border-forest-500/30';
      case 'danger':
        return 'bg-critical-500/10 text-critical-400 border-critical-500/30';
      case 'warning':
        return 'bg-alert-500/10 text-alert-400 border-alert-500/30';
      case 'info':
        return 'bg-info-500/10 text-info-400 border-info-500/30';
      default:
        return 'bg-slate-800/50 text-slate-300 border-slate-700/50';
    }
  };

  const getTrendIndicator = () => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return null;
    }
  };

  return (
    <div className="card-base p-4 sm:p-5 space-y-3 hover:shadow-lg transition-all duration-250 animate-fade-up">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {icon && <div className="text-slate-400 flex-shrink-0">{icon}</div>}
      </div>
      <div>
        <div className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-bold rounded-md border ${getStatusStyle()}`}>
          {value}
          {getTrendIndicator() && <span className="text-xs ml-1 opacity-75">{getTrendIndicator()}</span>}
        </div>
        {subtext && (
          <p className="text-xs text-slate-400 mt-2 line-clamp-2">{subtext}</p>
        )}
      </div>
    </div>
  );
};

