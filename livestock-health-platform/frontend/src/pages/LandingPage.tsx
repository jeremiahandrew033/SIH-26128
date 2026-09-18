import React from 'react';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { StatusCard } from '../components/StatusCard';
import { Activity, AlertTriangle, CheckCircle2, Monitor, RefreshCw, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const {
    backendConnected,
    apiStatus,
    environment,
    phase,
    loading,
    error,
    refreshStatus,
  } = useSystemStatus();

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8 border-b border-slate-800/80">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5" />
          <span>SIH Prototype Architecture • Phase 0 Active</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight max-w-4xl mx-auto leading-tight">
          AI-Enabled Livestock Health, Disease Surveillance & Management Platform
        </h1>

        <p className="text-lg sm:text-xl font-medium text-emerald-400 max-w-3xl mx-auto">
          Early Detection | Prediction | Prevention | Community Containment | Management
        </p>

        <p className="text-slate-400 text-sm max-w-2xl mx-auto pt-2">
          Enterprise foundation & microservice gateway designed for rapid disease detection, vector mapping, and national livestock health management.
        </p>
      </section>

      {/* Backend Status Alert if error */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start space-x-3 text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">System Connectivity Notice</p>
            <p className="text-xs text-rose-300/90 mt-1">{error}</p>
          </div>
          <button
            onClick={refreshStatus}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* System Status Dashboard Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-200 flex items-center space-x-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <span>Phase 0 System Overview</span>
          </h2>
          <button
            onClick={refreshStatus}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            label="Frontend Status"
            value="ONLINE"
            status="success"
            subtext="React 18 + Vite + TypeScript"
            icon={<Monitor className="w-5 h-5 text-emerald-400" />}
          />

          <StatusCard
            label="Backend Status"
            value={backendConnected ? 'CONNECTED' : 'DISCONNECTED'}
            status={backendConnected ? 'success' : 'danger'}
            subtext={backendConnected ? `FastAPI Gateway HTTP 200 (${apiStatus})` : 'Connection Refused'}
            icon={<Server className={`w-5 h-5 ${backendConnected ? 'text-emerald-400' : 'text-rose-400'}`} />}
          />

          <StatusCard
            label="Environment"
            value={environment.toUpperCase()}
            status="neutral"
            subtext="Local Development Mode"
          />

          <StatusCard
            label="Platform Phase"
            value={phase.toUpperCase()}
            status="neutral"
            subtext="Foundation & API Connectivity"
          />
        </div>
      </section>

      {/* Phase 0 Boundaries & System Information */}
      <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Phase 0 Architecture Verification</span>
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Phase 0 establishes the strict foundational repository layout, backend REST endpoints, CORS policies, environment configurations, and database stubs. Advanced modules such as PyTorch image diagnostics, Guardian thermal streaming, GIS heatmaps, and IVR alerts will be integrated in subsequent phases.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Link
            to="/health"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
          >
            Open Health Diagnostics
          </Link>
          <Link
            to="/architecture"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
          >
            View System Architecture Diagram
          </Link>
        </div>
      </section>
    </div>
  );
};
