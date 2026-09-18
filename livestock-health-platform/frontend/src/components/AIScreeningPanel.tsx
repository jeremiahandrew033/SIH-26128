import React from 'react';
import { Brain, ShieldAlert, ShieldCheck, Eye, AlertTriangle } from 'lucide-react';

interface AIScreeningPanelProps {
  ai_prediction?: string;
  ai_confidence?: number;
  ai_risk_level?: 'LOW' | 'WATCH' | 'HIGH';
  ai_model_version?: string;
  ai_processed_at?: string;
  /** Compact mode for list views / cards. Full mode default for detail pages. */
  compact?: boolean;
}

const RISK_CONFIG = {
  HIGH: {
    label: 'HIGH RISK',
    icon: ShieldAlert,
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/40',
    text: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    bar: 'bg-rose-500',
  },
  WATCH: {
    label: 'WATCH',
    icon: Eye,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    bar: 'bg-amber-500',
  },
  LOW: {
    label: 'LOW RISK',
    icon: ShieldCheck,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    bar: 'bg-emerald-500',
  },
};

export const AIScreeningPanel: React.FC<AIScreeningPanelProps> = ({
  ai_prediction,
  ai_confidence,
  ai_risk_level,
  ai_model_version,
  ai_processed_at,
  compact = false,
}) => {
  // No AI data — not yet screened
  if (!ai_risk_level && !ai_prediction) {
    if (compact) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          <Brain className="w-3 h-3" />
          <span>No AI Screen</span>
        </span>
      );
    }
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3 text-xs text-slate-400">
        <Brain className="w-5 h-5 text-slate-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-slate-300">AI Screening — Not Yet Run</p>
          <p className="text-slate-500 mt-0.5">Upload a photo to trigger automatic AI image screening.</p>
        </div>
      </div>
    );
  }

  const level = ai_risk_level ?? 'LOW';
  const cfg = RISK_CONFIG[level] ?? RISK_CONFIG.LOW;
  const RiskIcon = cfg.icon;
  const confidencePct = ai_confidence !== undefined ? Math.round(ai_confidence * 100) : null;

  if (compact) {
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded border text-[10px] font-bold ${cfg.badge}`}>
        <RiskIcon className="w-3 h-3" />
        <span>AI: {cfg.label}</span>
        {confidencePct !== null && <span className="opacity-70">({confidencePct}%)</span>}
      </span>
    );
  }

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${cfg.bg} ${cfg.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className={`w-5 h-5 ${cfg.text}`} />
          <span className={`text-sm font-extrabold uppercase tracking-wide ${cfg.text}`}>
            AI Screening Result
          </span>
        </div>
        <span className={`px-3 py-1 rounded-full border text-xs font-extrabold uppercase ${cfg.badge}`}>
          <RiskIcon className="w-3 h-3 inline mr-1" />
          {cfg.label}
        </span>
      </div>

      {/* Prediction text */}
      {ai_prediction && (
        <p className="text-sm text-slate-200 font-medium leading-relaxed bg-slate-900/60 rounded-xl p-3 border border-slate-800/60">
          {ai_prediction}
        </p>
      )}

      {/* Confidence meter */}
      {confidencePct !== null && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Model Confidence</span>
            <span className={`font-extrabold ${cfg.text}`}>{confidencePct}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>
      )}

      {/* Model metadata */}
      <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 border-t border-slate-800/60 pt-3">
        {ai_model_version && (
          <span className="font-mono">
            Model: <span className="text-slate-400">{ai_model_version}</span>
          </span>
        )}
        {ai_processed_at && (
          <span>
            Screened at:{' '}
            <span className="text-slate-400">
              {new Date(ai_processed_at).toLocaleString()}
            </span>
          </span>
        )}
      </div>

      {/* Mandatory disclaimer */}
      <div className="flex items-start space-x-2 bg-slate-900/60 rounded-xl p-3 border border-slate-800/60">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          <span className="font-bold text-amber-400">Disclaimer:</span> This is an AI-assisted
          screening tool for decision support only. It does <strong>not</strong> constitute a
          veterinary diagnosis. All findings must be reviewed and verified by a licensed veterinary
          officer before any clinical action is taken.
        </p>
      </div>
    </div>
  );
};
