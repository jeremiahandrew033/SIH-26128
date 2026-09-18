import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

import { Stethoscope, AlertOctagon, TestTube, Microscope, Clock } from 'lucide-react';

export const VetPortal: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-500/30 rounded-2xl p-6 space-y-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
            Phase 0.5 Active
          </span>
          <span className="text-xs text-slate-400">Authenticated Role: Veterinary Officer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Veterinary Officer Portal
        </h1>
        <p className="text-xs text-slate-300">
          Welcome, <span className="font-bold text-blue-400">{user?.full_name || 'Veterinary Officer'}</span>! Clinical triage gateway.
        </p>
      </div>

      {/* Operations Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Veterinary Operations Triage
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Priority & Incoming Field Cases */}
          <Link
            to="/vet/cases"
            className="group bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-105 transition-transform border border-blue-500/20 text-blue-400">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                Active Feature
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors text-base">
                Incoming Field Cases
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Review farmer health and mortality reports, inspect symptoms, and update case status.
              </p>
            </div>
          </Link>

          {/* Animal Lookup Search */}
          <Link
            to="/vet/animals"
            className="group bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-105 transition-transform border border-blue-500/20 text-blue-400">
                <Microscope className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                Active Feature
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors text-base">
                Animal Registry Search
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Search animals by tag code, species, or farmer ID to view medical lifecycle profiles.
              </p>
            </div>
          </Link>

          {/* AI Alerts (Planned) */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400 opacity-60">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase">
                Planned for Phase 3/4
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-400 text-base">AI Vision & Symptom Triage</h3>
              <p className="text-xs text-slate-500 mt-1">
                Automated disease severity scoring triggered by vision ML models.
              </p>
            </div>
          </div>

          {/* Sample Collection (Planned) */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 opacity-60">
                <TestTube className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase">
                Planned for Phase 8
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-400 text-base">Sample Collection</h3>
              <p className="text-xs text-slate-500 mt-1">
                Log biological field samples, barcode tags, and referral lab dispatch.
              </p>
            </div>
          </div>

          {/* Laboratory (Planned) */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 opacity-60">
                <Microscope className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase">
                Planned for Phase 8
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-400 text-base">Laboratory Diagnostics</h3>
              <p className="text-xs text-slate-500 mt-1">
                Diagnostic test results from regional and national veterinary reference labs.
              </p>
            </div>
          </div>

          {/* Follow-ups (Planned) */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-slate-400 opacity-60">
                <Clock className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase">
                Planned for Phase 8
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-400 text-base">Follow-up Pipeline</h3>
              <p className="text-xs text-slate-500 mt-1">
                Schedule recovery checks, quarantine release, and treatment follow-up logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
