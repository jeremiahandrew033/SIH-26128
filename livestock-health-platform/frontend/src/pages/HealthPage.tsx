import React from 'react';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { StatusCard } from '../components/StatusCard';
import { AlertCircle, CheckCircle2, Database, RefreshCw, Server, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../config/env';

export const HealthPage: React.FC = () => {
  const {
    backendConnected,
    apiStatus,
    environment,
    phase,
    serviceName,
    systemName,
    version,
    loading,
    error,
    lastChecked,
    refreshStatus,
  } = useSystemStatus();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Server className="w-6 h-6 text-emerald-400" />
            <span>Frontend & Backend System Health</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time API connection check and environment health metrics.
          </p>
        </div>
        <button
          onClick={refreshStatus}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg shadow transition-colors flex items-center space-x-2 disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Checking...' : 'Re-check Status'}</span>
        </button>
      </div>

      {/* Primary Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          label="Backend Connection"
          value={backendConnected ? 'CONNECTED' : 'DISCONNECTED'}
          status={backendConnected ? 'success' : 'danger'}
          subtext={backendConnected ? `Connected to ${API_BASE_URL}` : 'Connection Refused'}
          icon={backendConnected ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
        />

        <StatusCard
          label="API Status"
          value={apiStatus}
          status={apiStatus === 'OK' ? 'success' : 'danger'}
          subtext={`Endpoint: /health`}
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
        />

        <StatusCard
          label="Environment"
          value={environment}
          status="neutral"
          subtext="Config: APP_ENV"
        />

        <StatusCard
          label="Phase"
          value={phase}
          status="neutral"
          subtext="Phase 0 Baseline"
        />
      </div>

      {/* Failure Warning Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 text-rose-200 space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 font-bold">
            <AlertCircle className="w-5 h-5" />
            <span>Connection Error Detailed Log</span>
          </div>
          <p className="text-sm text-rose-300 font-mono bg-slate-950/60 p-3 rounded-lg border border-rose-500/20">
            {error}
          </p>
        </div>
      )}

      {/* Detailed Diagnostics Table */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-slate-700/60 bg-slate-800/80 flex items-center justify-between">
          <h2 className="font-semibold text-slate-200 text-base">API Diagnostic Metadata</h2>
          {lastChecked && (
            <span className="text-xs text-slate-400">
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-700/40 text-sm">
          <div className="px-6 py-3.5 flex justify-between items-center">
            <span className="text-slate-400">Platform Name</span>
            <span className="font-medium text-slate-200 text-right">{systemName}</span>
          </div>
          <div className="px-6 py-3.5 flex justify-between items-center">
            <span className="text-slate-400">Backend API URL</span>
            <span className="font-mono text-emerald-400">{API_BASE_URL}</span>
          </div>
          <div className="px-6 py-3.5 flex justify-between items-center">
            <span className="text-slate-400">API Service Identifier</span>
            <span className="font-mono text-slate-300">{serviceName}</span>
          </div>
          <div className="px-6 py-3.5 flex justify-between items-center">
            <span className="text-slate-400">Platform Version</span>
            <span className="font-mono text-slate-300">v{version}</span>
          </div>
          <div className="px-6 py-3.5 flex justify-between items-center">
            <span className="text-slate-400">Database Layer (Supabase)</span>
            <span className="inline-flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
              <Database className="w-3.5 h-3.5" />
              <span>Placeholder Layer (Phase 1 Ready)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
