import React from 'react';

interface StatusCardProps {
  label: string;
  value: string;
  status?: 'success' | 'danger' | 'warning' | 'neutral';
  subtext?: string;
  icon?: React.ReactNode;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  label,
  value,
  status = 'neutral',
  subtext,
  icon,
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'danger':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 shadow-lg backdrop-blur flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div>
        <span className={`inline-block px-3 py-1 text-sm font-bold rounded-md border ${getBadgeStyle()}`}>
          {value}
        </span>
        {subtext && (
          <p className="text-xs text-slate-400 mt-2 line-clamp-1">{subtext}</p>
        )}
      </div>
    </div>
  );
};
