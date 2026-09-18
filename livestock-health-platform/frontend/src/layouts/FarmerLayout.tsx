import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';
import { useFarmer } from '../context/FarmerContext';
import { useOnlineStatus } from '../offline/useOnlineStatus';
import { syncService, SyncStatusState } from '../offline/SyncService';
import { Activity, User, Globe, Home, FolderHeart, PlusCircle, ClipboardList, RefreshCw, Smartphone, WifiOff } from 'lucide-react';

interface FarmerLayoutProps {
  children: React.ReactNode;
}

export const FarmerLayout: React.FC<FarmerLayoutProps> = ({ children }) => {
  const { lang, changeLanguage, t } = useTranslation();
  const { farmers, activeFarmer, selectFarmer } = useFarmer();
  const location = useLocation();
  const { isEffectiveOnline, isSimulatedOffline } = useOnlineStatus();
  
  const [syncState, setSyncState] = useState<SyncStatusState>({
    isSyncing: false,
    lastSyncTime: null,
    pendingCount: 0,
    syncedCount: 0,
    failedCount: 0
  });

  useEffect(() => {
    const unsubscribe = syncService.subscribe((state) => setSyncState(state));
    return unsubscribe;
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const renderStatusBadge = () => {
    if (isSimulatedOffline) {
      return (
        <Link
          to="/farmer/sync"
          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center space-x-1.5 hover:bg-amber-500/30 transition-all"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Simulated Offline</span>
        </Link>
      );
    }
    if (!isEffectiveOnline) {
      return (
        <Link
          to="/farmer/sync"
          className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center space-x-1.5 hover:bg-rose-500/30 transition-all"
        >
          <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          <span>Offline</span>
        </Link>
      );
    }
    if (syncState.isSyncing) {
      return (
        <Link
          to="/farmer/sync"
          className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center space-x-1.5 hover:bg-blue-500/30 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          <span>Syncing...</span>
        </Link>
      );
    }
    if (syncState.pendingCount > 0) {
      return (
        <Link
          to="/farmer/sync"
          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center space-x-1.5 hover:bg-amber-500/30 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
          <span>🟡 {syncState.pendingCount} Pending Sync</span>
        </Link>
      );
    }
    if (syncState.failedCount > 0) {
      return (
        <Link
          to="/farmer/sync"
          className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center space-x-1.5 hover:bg-rose-500/30 transition-all"
        >
          <span>Sync Failed</span>
        </Link>
      );
    }
    return (
      <Link
        to="/farmer/sync"
        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5 hover:bg-emerald-500/30 transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        <span>🟢 Online</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Mobile-First Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <Link to="/farmer" className="flex items-center space-x-2.5">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-100 tracking-tight text-base sm:text-lg">
                  {t('appTitle')}
                </h1>
                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Phase 2 • Offline-First Farmer Portal
                </p>
              </div>
            </Link>

            <div className="flex items-center space-x-2">
              {renderStatusBadge()}

              {/* Language Switcher */}
              <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
                <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 hidden sm:inline" />
                {(['en', 'te', 'hi'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => changeLanguage(l)}
                    className={`px-2 py-0.5 text-xs font-bold rounded uppercase transition-colors ${
                      lang === l
                        ? 'bg-emerald-500 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Farmer Selector Banner */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 overflow-hidden">
              <User className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-400 flex-shrink-0">{t('activeFarmer')}:</span>
              <span className="font-semibold text-slate-100 truncate">
                {activeFarmer ? `${activeFarmer.name} (${activeFarmer.village || 'Demo'})` : 'Loading...'}
              </span>
            </div>

            {farmers.length > 1 && (
              <select
                value={activeFarmer?.id || ''}
                onChange={(e) => selectFarmer(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-emerald-400 font-medium rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-500"
              >
                {farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Sticky Mobile Navigation */}
      <nav className="border-t border-slate-800 bg-slate-900/95 backdrop-blur sticky bottom-0 z-40 py-2">
        <div className="max-w-4xl mx-auto px-4 flex justify-around items-center text-xs">
          <Link
            to="/farmer"
            className={`flex flex-col items-center space-y-1 ${
              isActive('/farmer') ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>{t('home')}</span>
          </Link>

          <Link
            to="/farmer/animals"
            className={`flex flex-col items-center space-y-1 ${
              isActive('/farmer/animals') ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderHeart className="w-5 h-5" />
            <span>{t('myAnimals')}</span>
          </Link>

          <Link
            to="/farmer/report"
            className={`flex flex-col items-center space-y-1 ${
              isActive('/farmer/report') ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">{t('reportSickAnimal')}</span>
          </Link>

          <Link
            to="/farmer/cases"
            className={`flex flex-col items-center space-y-1 ${
              isActive('/farmer/cases') ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>{t('myCases')}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
