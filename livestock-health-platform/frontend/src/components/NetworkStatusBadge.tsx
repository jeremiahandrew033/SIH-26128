import React from 'react';
import { useOnlineStatus } from '../offline/useOnlineStatus';
import { Wifi, WifiOff, RefreshCw, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NetworkStatusBadge: React.FC = () => {
  const { isBrowserOnline, isBackendReachable, isSimulatedOffline, toggleSimulatedOffline } = useOnlineStatus();

  return (
    <div className="flex items-center space-x-2 text-xs font-semibold">
      {/* Network Status indicator */}
      {isSimulatedOffline ? (
        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1.5 animate-pulse">
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>🟠 SIMULATED OFFLINE</span>
        </span>
      ) : !isBrowserOnline ? (
        <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center space-x-1.5">
          <WifiOff className="w-3.5 h-3.5 text-orange-400" />
          <span>🟠 OFFLINE</span>
        </span>
      ) : !isBackendReachable ? (
        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>🟠 BACKEND UNREACHABLE</span>
        </span>
      ) : (
        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>🟢 ONLINE</span>
        </span>
      )}

      {/* Sync Dashboard Link */}
      <Link
        to="/farmer/sync"
        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors flex items-center space-x-1"
        title="Sync Dashboard"
      >
        <RefreshCw className="w-3 h-3 text-slate-400" />
        <span className="hidden sm:inline">Sync</span>
      </Link>

      {/* Demo Simulate Offline Toggle Button */}
      <button
        onClick={() => toggleSimulatedOffline()}
        className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-colors flex items-center space-x-1 ${
          isSimulatedOffline
            ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400'
            : 'bg-slate-900 text-amber-400 border-amber-500/40 hover:bg-amber-500/10'
        }`}
        title="Development Only: Toggle Simulated Offline Mode"
      >
        <Smartphone className="w-3 h-3" />
        <span>{isSimulatedOffline ? 'Go Online' : 'Simulate Offline'}</span>
      </button>
    </div>
  );
};
