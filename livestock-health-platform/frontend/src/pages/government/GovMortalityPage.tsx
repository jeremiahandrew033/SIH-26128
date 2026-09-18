import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllMortalityReports } from '../../services/api';
import { MortalityReport } from '../../types';
import { ArrowLeft, Skull, AlertTriangle } from 'lucide-react';

export const GovMortalityPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<MortalityReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllMortalityReports()
      .then(setReports)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalDeaths = reports.reduce((sum, r) => sum + r.number_of_deaths, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <button onClick={() => navigate('/government')} className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Skull className="w-5 h-5 text-rose-400" />
            <span>Mortality Surveillance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Aggregate livestock death reports across all districts</p>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-1">
          <p className="text-2xl font-extrabold text-rose-400">{loading ? '—' : reports.length}</p>
          <p className="text-xs text-slate-400 font-semibold">Mortality Events</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-1">
          <p className="text-2xl font-extrabold text-rose-400">{loading ? '—' : totalDeaths}</p>
          <p className="text-xs text-slate-400 font-semibold">Total Animals Reported Dead</p>
        </div>
      </div>

      {loading && <div className="text-center py-12 text-slate-400 text-sm">Loading mortality data...</div>}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Skull className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-slate-200">No mortality reports on record</h3>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase">All Mortality Records</h3>
          {reports.map((r) => (
            <div key={r.id} className="bg-slate-900/80 border border-rose-500/20 rounded-xl p-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-mono text-rose-400 font-extrabold text-sm">{r.case_id}</span>
                  <p className="text-rose-300 font-bold">Deaths: {r.number_of_deaths}</p>
                  {r.suspected_cause && <p className="text-slate-300">Cause: {r.suspected_cause}</p>}
                  {r.location && <p className="text-slate-400">{r.location.village}, {r.location.block}, {r.location.district}</p>}
                  <p className="text-slate-500">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 block">
                    {r.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
