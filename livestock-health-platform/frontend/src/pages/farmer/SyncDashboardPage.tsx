import React, { useEffect, useState } from 'react';
import { syncService, SyncStatusState } from '../../offline/SyncService';
import { useOnlineStatus } from '../../offline/useOnlineStatus';
import { RefreshCw, CheckCircle, AlertTriangle, Clock, Smartphone, Trash2 } from 'lucide-react';
import { offlineStore, OfflineRecord, SyncQueueItem } from '../../offline/OfflineStore';
import { SyncQueue } from '../../offline/SyncQueue';

export const SyncDashboardPage: React.FC = () => {
  const { isEffectiveOnline, isSimulatedOffline, toggleSimulatedOffline } = useOnlineStatus();
  const [syncState, setSyncState] = useState<SyncStatusState>({
    isSyncing: false,
    lastSyncTime: null,
    pendingCount: 0,
    syncedCount: 0,
    failedCount: 0,
  });
  const [pendingItems, setPendingItems] = useState<SyncQueueItem[]>([]);
  const [syncedRecords, setSyncedRecords] = useState<OfflineRecord[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const refreshData = async () => {
    const queue = await SyncQueue.getPending();
    setPendingItems(queue);

    const records = await offlineStore.getAllRecords();
    setSyncedRecords(records.filter((r: OfflineRecord) => r.sync_status === 'synced'));
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = syncService.subscribe((state: SyncStatusState) => {
      setSyncState(state);
      if (state.message) setMessage(state.message);
      refreshData();
    });
    return unsubscribe;
  }, []);

  const handleSyncNow = async () => {
    if (!isEffectiveOnline) {
      setMessage("Cannot sync while offline or simulated offline.");
      return;
    }
    setMessage("Syncing now...");
    const res = await syncService.syncPendingRecords();
    await refreshData();
    if (res.failedCount > 0) {
      setMessage("Some reports could not be synchronized. We'll retry later.");
    } else if (res.successCount > 0) {
      setMessage("All pending reports synchronized successfully.");
    } else {
      setMessage("No pending reports to sync.");
    }
  };

  const handleClearSynced = async () => {
    await offlineStore.clearSyncedRecords();
    await refreshData();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <RefreshCw className={`w-6 h-6 text-emerald-400 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
            <span>Offline Sync Dashboard</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage locally saved health reports, mortality cases, and animal registrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleSimulatedOffline()}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-2 ${
              isSimulatedOffline
                ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400'
                : 'bg-slate-800 text-amber-400 border-amber-500/40 hover:bg-amber-500/10'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{isSimulatedOffline ? 'Disable Simulated Offline' : 'Simulate Offline Mode'}</span>
          </button>

          <button
            onClick={handleSyncNow}
            disabled={syncState.isSyncing || !isEffectiveOnline}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncState.isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Network Status Banner */}
      {isSimulatedOffline ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center justify-between">
          <span className="font-semibold">🟠 SIMULATED OFFLINE — Reports will be saved locally on this device.</span>
          <button onClick={() => toggleSimulatedOffline(false)} className="underline text-xs font-bold hover:text-amber-200">
            Go Online
          </button>
        </div>
      ) : !isEffectiveOnline ? (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm font-semibold">
          You're offline. New reports will be saved on this device and synced automatically when internet returns.
        </div>
      ) : null}

      {message && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-xs text-slate-400 hover:text-slate-200">Dismiss</button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">Pending Sync</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{syncState.pendingCount}</p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">Syncing</span>
            <RefreshCw className={`w-4 h-4 text-blue-400 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-2">{syncState.isSyncing ? 1 : 0}</p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">Synced</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{syncState.syncedCount}</p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">Failed</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2">{syncState.failedCount}</p>
        </div>
      </div>

      {/* Pending Queue Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Pending Queue</span>
          </h2>
          {pendingItems.some(i => i.status === 'failed') && (
            <button
              onClick={handleSyncNow}
              disabled={!isEffectiveOnline}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Retry Failed
            </button>
          )}
        </div>

        {pendingItems.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-4 text-center">No pending records waiting to sync.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Local ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Retries</th>
                  <th className="p-3">Error / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {pendingItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-bold text-amber-300">{item.id}</td>
                    <td className="p-3 capitalize">{item.entity_type.replace('_', ' ')}</td>
                    <td className="p-3 text-slate-400">{new Date(item.created_at).toLocaleString()}</td>
                    <td className="p-3">
                      {item.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          Pending Sync
                        </span>
                      )}
                      {item.status === 'syncing' && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold animate-pulse">
                          Syncing...
                        </span>
                      )}
                      {item.status === 'failed' && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono">{item.retry_count}</td>
                    <td className="p-3 text-rose-400">{item.error_message || 'Waiting for internet connection.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Synced History */}
      {syncedRecords.length > 0 && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Recently Synced Records</span>
            </h2>
            <button
              onClick={handleClearSynced}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Synced History</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Local Temp ID</th>
                  <th className="p-3">Server Assigned ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {syncedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-slate-400 line-through">{rec.id}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{rec.server_id}</td>
                    <td className="p-3 capitalize">{rec.entity_type.replace('_', ' ')}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        ✅ Synced
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
