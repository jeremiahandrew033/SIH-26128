import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAllHealthReports, fetchAllMortalityReports } from '../../services/api';
import { HealthReport, MortalityReport } from '../../types';
import { ArrowLeft, AlertTriangle, ChevronRight, FileText } from 'lucide-react';

export const GovCasesPage: React.FC = () => {
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
      .then(([h, m]) => { setHealthCases(h); setMortalityCases(m); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const allCombined = [
    ...healthCases.map((h) => ({ ...h, isMortality: false })),
    ...mortalityCases.map((m) => ({ ...m, isMortality: true, report_type: 'mortality', symptoms: [], severity: 'severe' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filtered = statusFilter === 'all' ? allCombined : allCombined.filter((c) => c.status === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reported': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">🟡 REPORTED</span>;
      case 'under_review': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">🔵 UNDER REVIEW</span>;
      case 'closed': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🟢 CLOSED</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <button onClick={() => navigate('/government')} className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Health Case Surveillance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Read-only view of all field health & mortality reports</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex space-x-2 text-xs font-medium">
        {['all', 'reported', 'under_review', 'closed'].map((st) => (
          <button key={st} onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg border capitalize transition-colors ${statusFilter === st ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 font-bold' : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-slate-400 text-sm">Loading surveillance data...</div>}
      {error && <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-slate-200 text-base">No cases found</h3>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">{filtered.length} total case{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map((c) => (
            <Link key={c.id} to={`/government/cases/${c.case_id}`}
              className="block bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-xl p-4 transition-all group">
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-purple-400 font-extrabold text-sm">{c.case_id}</span>
                    {getStatusBadge(c.status)}
                    {c.isMortality && <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase rounded">Mortality</span>}
                  </div>
                  <p className="text-slate-200 capitalize font-semibold">Type: {c.report_type.replace('_', ' ')}</p>
                  {c.location && <p className="text-slate-400">{c.location.village}, {c.location.district}</p>}
                  <p className="text-slate-500">{new Date(c.created_at).toLocaleString()}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
