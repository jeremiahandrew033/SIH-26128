import React from 'react';
import { Layers, CheckCircle2, Lock, Cpu, MapPin, PhoneCall } from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
          <Layers className="w-6 h-6 text-emerald-400" />
          <span>Platform Architecture Overview</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          High-level microservice topology and Phase 0 implementation boundaries.
        </p>
      </div>

      {/* System Flow Diagram Mockup Card */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-slate-200">System Flow Diagram</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-emerald-400">
              <span>Frontend Layer</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Active</span>
            </div>
            <h3 className="font-bold text-slate-100">React + Vite SPA</h3>
            <p className="text-xs text-slate-400">
              TypeScript presentation app with live status monitor and system router.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-emerald-400">
              <span>API Gateway</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Active</span>
            </div>
            <h3 className="font-bold text-slate-100">FastAPI REST Server</h3>
            <p className="text-xs text-slate-400">
              Modular route handlers, CORS middleware, and environment configuration.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-amber-500/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-amber-400">
              <span>Database Layer</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Phase 1 Configured</span>
            </div>
            <h3 className="font-bold text-slate-100">Supabase PostgreSQL</h3>
            <p className="text-xs text-slate-400">
              Database connection wrapper & client initialization stubs ready.
            </p>
          </div>
        </div>
      </div>

      {/* Modular Status Matrix */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200">Module Implementation Status</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-800/40 border border-emerald-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Phase 0: Core Foundation</span>
            </div>
            <p className="text-xs text-slate-300">
              Repository architecture, FastAPI backend gateway, React Vite frontend, Docker support, and test suite.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-3 opacity-60">
            <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm">
              <Lock className="w-4 h-4" />
              <span>Phase 1: Core Records & Auth</span>
            </div>
            <p className="text-xs text-slate-400">
              Farmer profiles, veterinary role management, animal records, and Supabase database schemas.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-3 opacity-60">
            <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Phase 2: AI Vision & Diagnostics</span>
            </div>
            <p className="text-xs text-slate-400">
              PyTorch & OpenCV image classifier, symptom NLP scoring engine, and outbreak prediction models.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-3 opacity-60">
            <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm">
              <MapPin className="w-4 h-4" />
              <span>Phase 3: Guardian & GIS</span>
            </div>
            <p className="text-xs text-slate-400">
              Guardian thermal camera stream monitoring, PostGIS spatial mapping, and MapLibre heatmaps.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-3 opacity-60">
            <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm">
              <PhoneCall className="w-4 h-4" />
              <span>Phase 4: Telephony & IVR</span>
            </div>
            <p className="text-xs text-slate-400">
              IVR voice reporting for rural offline farmers, PWA local IndexedDB sync, and SMS alert dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
