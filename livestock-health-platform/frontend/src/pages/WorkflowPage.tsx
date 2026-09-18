import React from 'react';
import { Layers, CheckCircle2, Clock, Lock, ShieldCheck } from 'lucide-react';

interface Stage {
  number: string;
  name: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
  phase: string;
}

const WORKFLOW_STAGES: Stage[] = [
  {
    number: '01',
    name: 'OBSERVE',
    description: 'Farmer or field worker notices physical symptoms, skin lesions, or abnormal behavior in livestock.',
    status: 'COMPLETED',
    phase: 'Phase 0.5 / Phase 1 Foundation'
  },
  {
    number: '02',
    name: 'COLLECT',
    description: 'Mobile wizard collects report type, symptoms, photo evidence, and browser/device GPS coordinates.',
    status: 'IN_PROGRESS',
    phase: 'Phase 1 Core Workflows'
  },
  {
    number: '03',
    name: 'VALIDATE',
    description: 'Gateway API validates payload, checks file mime types/size, and generates human-readable Case ID (LIV-2026-XXXXXX).',
    status: 'COMPLETED',
    phase: 'Phase 0.5 Authentication & API'
  },
  {
    number: '04',
    name: 'AI / ML',
    description: 'PyTorch & OpenCV vision models classify skin lesions (ResNet/EfficientNet) and score symptom urgency.',
    status: 'PLANNED',
    phase: 'Phase 3 ML Pipeline'
  },
  {
    number: '05',
    name: 'RISK ENGINE',
    description: 'Spatiotemporal algorithm combines symptom clusters, weather, vector density, and livestock movement.',
    status: 'PLANNED',
    phase: 'Phase 6 Risk Engine'
  },
  {
    number: '06',
    name: 'GIS & TRENDS',
    description: 'PostGIS and Leaflet/MapLibre render real-time vector maps, quarantine zones, and infection heatmaps.',
    status: 'PLANNED',
    phase: 'Phase 7 GIS Intelligence'
  },
  {
    number: '07',
    name: 'EARLY WARNING',
    description: 'Automated SMS, telephony IVR, and push notifications broadcast warnings to nearby farmers and officials.',
    status: 'PLANNED',
    phase: 'Phase 9 Telephony & IVR'
  },
  {
    number: '08',
    name: 'VETERINARY REVIEW',
    description: 'Veterinary Officers review prioritized cases, prescribe treatments, and confirm clinical diagnosis.',
    status: 'PLANNED',
    phase: 'Phase 8 Vet Review'
  },
  {
    number: '09',
    name: 'LABORATORY',
    description: 'Field samples tracked via barcode barcode referrals to regional veterinary reference laboratories.',
    status: 'PLANNED',
    phase: 'Phase 8 Lab Integration'
  },
  {
    number: '10',
    name: 'RESPONSE',
    description: 'Targeted ring vaccination, herd isolation, and emergency medical supply dispatch.',
    status: 'PLANNED',
    phase: 'Phase 9 Response Dispatch'
  },
  {
    number: '11',
    name: 'MONITORING',
    description: 'Guardian thermal camera streams and follow-up logs track recovery and containment effectiveness.',
    status: 'PLANNED',
    phase: 'Phase 5 Guardian Camera'
  },
  {
    number: '12',
    name: 'LEARNING',
    description: 'Continuous model retraining on confirmed lab diagnoses and outbreak outcome records.',
    status: 'PLANNED',
    phase: 'Phase 10 Continuous ML'
  }
];

export const WorkflowPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Phase 0.5 — Authentication Foundation</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 flex items-center space-x-3">
          <Layers className="w-8 h-8 text-emerald-400" />
          <span>Platform End-to-End Workflow</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          The 12-stage systemic vision of the AI-Enabled Livestock Health Platform. Current implementation baseline is **Phase 0.5 (Authentication & Role Gateway)**.
        </p>

        <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed: Gateway, Auth & Base DDL</span>
          </div>
          <div className="flex items-center space-x-1.5 text-amber-400">
            <Clock className="w-4 h-4" />
            <span>In Progress: Phase 1 Reporting Foundation</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-500">
            <Lock className="w-4 h-4" />
            <span>Planned: Advanced ML, GIS, IVR</span>
          </div>
        </div>
      </div>

      {/* 12-Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WORKFLOW_STAGES.map((s) => {
          const isCompleted = s.status === 'COMPLETED';
          const isInProgress = s.status === 'IN_PROGRESS';

          return (
            <div
              key={s.number}
              className={`border rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between ${
                isCompleted
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg'
                  : isInProgress
                  ? 'bg-slate-900/70 border-amber-500/40'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    STAGE {s.number}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isInProgress
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {s.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-100 text-base tracking-tight">
                  {s.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>{s.phase}</span>
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
