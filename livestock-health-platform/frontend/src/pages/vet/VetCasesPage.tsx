import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { fetchAllHealthReports, fetchAllMortalityReports } from '../../services/api';
import { HealthReport, MortalityReport } from '../../types';
import { ArrowLeft, Stethoscope, ChevronRight, AlertTriangle, Phone } from 'lucide-react';
import { AIScreeningPanel } from '../../components/AIScreeningPanel';

export const VetCasesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [healthCases, setHealthCases] = useState<HealthReport[]>([]);
  const [mortalityCases, setMortalityCases] = useState<MortalityReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAllHealthReports().catch(() => []),
      fetchAllMortalityReports().catch(() => [])
    ])
      .then(([hList, mList]) => {
        setHealthCases(hList);
        setMortalityCases(mList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const allCombined = [
    ...healthCases.map((h) => ({ ...h, isMortality: false })),
    ...mortalityCases.map((m) => ({ ...m, isMortality: true, report_type: 'mortality', symptoms: [], severity: 'severe' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredCases = statusFilter === 'all'
    ? allCombined
    : allCombined.filter((c) => c.status.toLowerCase() === statusFilter.toLowerCase());

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'reported':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">🟡 REPORTED</span>;
      case 'under_review':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">🔵 UNDER REVIEW</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🟢 CLOSED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <button
          onClick={() => navigate('/vet')}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-blue-400" />
            <span>Field Triage Cases</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Incoming health and mortality submissions from registered farmers
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 text-xs font-medium">
        {['all', 'reported', 'under_review', 'closed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg border capitalize transition-colors ${
              statusFilter === st
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-slate-400 text-sm">{t('loading')}</div>}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && filteredCases.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-slate-200 text-base">No cases found</h3>
          <p className="text-xs text-slate-400">There are no matching farmer health or mortality reports.</p>
        </div>
      )}

      {!loading && !error && filteredCases.length > 0 && (
        <div className="space-y-3">
          {filteredCases.map((c) => (
            <Link
              key={c.id}
              to={`/vet/cases/${c.case_id}`}
              className="block bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 rounded-xl p-4 transition-all shadow-md group"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-blue-400 font-extrabold text-sm">
                      {c.case_id}
                    </span>
                    {getStatusBadge(c.status)}
                    {c.isMortality && (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase rounded">
                        Mortality Report
                      </span>
                    )}
                    {c.source === 'PHONE_IVR' && (
                      <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 border border-slate-600 text-[10px] font-bold uppercase rounded flex items-center space-x-1">
                        <Phone className="w-3 h-3" /> <span>Phone Report</span>
                      </span>
                    )}
                    {c.priority === 'HIGH' && (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase rounded flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" /> <span>High Priority</span>
                      </span>
                    )}
                    {/* Phase 3 — compact AI risk badge */}
                    {!c.isMortality && (
                      <AIScreeningPanel
                        ai_prediction={(c as HealthReport).ai_prediction}
                        ai_confidence={(c as HealthReport).ai_confidence}
                        ai_risk_level={(c as HealthReport).ai_risk_level}
                        compact
                      />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-200 capitalize">
                    Type: {c.report_type.replace('_', ' ')} • Severity: {c.severity.toUpperCase()}
                  </p>
                  {c.location && (
                    <p className="text-[11px] text-slate-400">
                      Location: {c.location.village || 'Kollur'}, {c.location.district || 'District'}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500">
                    Submitted on {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
