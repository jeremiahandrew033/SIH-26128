import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { useFarmer } from '../../context/FarmerContext';
import { fetchFarmerHealthReports } from '../../services/api';
import { offlineStore, OfflineRecord } from '../../offline/OfflineStore';
import { HealthReport } from '../../types';
import { ClipboardList, ChevronRight, AlertTriangle } from 'lucide-react';

export const FarmerCasesPage: React.FC = () => {
  const { t } = useTranslation();
  const { activeFarmer } = useFarmer();
  const [cases, setCases] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [offlineRecords, setOfflineRecords] = useState<OfflineRecord[]>([]);

  const loadCases = async () => {
    if (!activeFarmer) return;
    setLoading(true);
    setError(null);

    const localRecs = await offlineStore.getAllRecords().catch(() => []);
    setOfflineRecords(localRecs);

    try {
      const serverCases = await fetchFarmerHealthReports(activeFarmer.id);
      setCases(serverCases);
    } catch (err: any) {
      // If offline or network error, don't show full page error if we have offline records
      if (localRecs.length === 0) {
        setError(err.message || 'Failed to fetch cases.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [activeFarmer]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">🟠 Pending Sync</span>;
      case 'synced':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✅ Synced</span>;
      case 'reported':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">🟡 {t('reported')}</span>;
      case 'under_review':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">🔵 {t('underReview')}</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🟢 {t('closed')}</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-emerald-400" />
            <span>{t('myCases')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Submitted cases for farmer {activeFarmer?.name}
          </p>
        </div>
        <Link
          to="/farmer/report"
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow transition-colors flex items-center space-x-1"
        >
          <span>File New Case</span>
        </Link>
      </div>

      {loading && <div className="text-center py-12 text-slate-400 text-sm">{t('loading')}</div>}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && cases.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <ClipboardList className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-slate-200 text-base">No filed cases found</h3>
          <p className="text-xs text-slate-400">File a sick animal report or mortality report to create a case.</p>
        </div>
      )}

      {!loading && (cases.length > 0 || offlineRecords.length > 0) && (
        <div className="space-y-3">
          {/* Offline Pending / Synced Records */}
          {offlineRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 transition-all shadow-md space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-amber-300 font-extrabold text-sm">
                    {rec.server_id || rec.id}
                  </span>
                  {getStatusBadge(rec.sync_status)}
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {rec.server_id ? `Synced as ${rec.server_id}` : 'Stored locally on device'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-200 capitalize">
                Type: {rec.entity_type.replace('_', ' ')} • Severity: {(rec.payload.severity || 'N/A').toUpperCase()}
              </p>
              {rec.payload.symptoms && rec.payload.symptoms.length > 0 && (
                <p className="text-xs text-slate-400">
                  Symptoms: {rec.payload.symptoms.join(', ')}
                </p>
              )}
              {rec.payload.description && (
                <p className="text-xs text-slate-400 line-clamp-1 italic">
                  "{rec.payload.description}"
                </p>
              )}
              <p className="text-[10px] text-slate-500">
                Created offline on {new Date(rec.created_at).toLocaleString()}
              </p>
            </div>
          ))}

          {/* Server Cases */}
          {cases.map((c) => (
            <Link
              key={c.id}
              to={`/farmer/cases/${c.case_id}`}
              className="block bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all shadow-md group"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-emerald-400 font-extrabold text-sm">
                      {c.case_id}
                    </span>
                    {getStatusBadge(c.status)}
                  </div>
                  <p className="text-xs font-semibold text-slate-200 capitalize">
                    Report Type: {c.report_type.replace('_', ' ')} • Severity: {c.severity.toUpperCase()}
                  </p>
                  {c.symptoms && c.symptoms.length > 0 && (
                    <p className="text-xs text-slate-400 line-clamp-1">
                      Symptoms: {c.symptoms.join(', ')}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500">
                    Filed on {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
