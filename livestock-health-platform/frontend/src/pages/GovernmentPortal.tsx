import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { fetchAllAnimals, fetchAllHealthReports, fetchAllMortalityReports, fetchAllVaccinations } from '../services/api';
import { Building2, Map, Skull, Syringe, AlertTriangle, ChevronRight, Activity } from 'lucide-react';

interface Stats {
  totalAnimals: number;
  totalHealthReports: number;
  totalMortalityReports: number;
  phoneReports: number;
  openCases: number;
  closedCases: number;
  vaccinationRecords: number;
  loading: boolean;
}

export const GovernmentPortal: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalAnimals: 0, totalHealthReports: 0, totalMortalityReports: 0, phoneReports: 0,
    openCases: 0, closedCases: 0, vaccinationRecords: 0, loading: true
  });

  useEffect(() => {
    Promise.all([
      fetchAllAnimals().catch(() => []),
      fetchAllHealthReports().catch(() => []),
      fetchAllMortalityReports().catch(() => []),
      fetchAllVaccinations().catch(() => [])
    ]).then(([animals, healthReports, mortalityReports, vaccinations]) => {
      const open = healthReports.filter((r) => r.status === 'reported' || r.status === 'under_review').length;
      const closed = healthReports.filter((r) => r.status === 'closed').length;
      const allReports = [...healthReports, ...mortalityReports];
      const phoneCount = allReports.filter((r: any) => r.source === 'PHONE_IVR').length;
      setStats({
        totalAnimals: animals.length,
        totalHealthReports: healthReports.length,
        totalMortalityReports: mortalityReports.length,
        phoneReports: phoneCount,
        openCases: open,
        closedCases: closed,
        vaccinationRecords: vaccinations.length,
        loading: false
      });
    });
  }, []);

  const statCards = [
    { label: 'Total Animals', value: stats.totalAnimals, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '🐄' },
    { label: 'Health Reports', value: stats.totalHealthReports, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '📋' },
    { label: 'Mortality Reports', value: stats.totalMortalityReports, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: '💀' },
    { label: 'Phone IVR Reports', value: stats.phoneReports, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: '📞' },
    { label: 'Open Cases', value: stats.openCases, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '🟡' },
    { label: 'Closed Cases', value: stats.closedCases, color: 'text-slate-300', bg: 'bg-slate-800', border: 'border-slate-700', icon: '🟢' },
    { label: 'Vaccinations', value: stats.vaccinationRecords, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: '💉' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-500/30 rounded-2xl p-6 space-y-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
            Phase 1 & 2 Active
          </span>
          <span className="text-xs text-slate-400">Read-only Surveillance Overview</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Government Surveillance Portal</h1>
        <p className="text-xs text-slate-300">
          Welcome, <span className="font-bold text-purple-400">{user?.full_name || 'Government Official'}</span>! District & State Command Center.
        </p>
      </div>

      {/* Live Statistics */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span>Live System Statistics</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statCards.map((sc) => (
            <div key={sc.label} className={`${sc.bg} border ${sc.border} rounded-2xl p-4 space-y-1`}>
              <div className="flex items-center justify-between">
                <span className="text-lg">{sc.icon}</span>
                {stats.loading && <div className="w-4 h-4 border-2 border-slate-600 border-t-purple-400 rounded-full animate-spin" />}
              </div>
              <p className={`text-2xl font-extrabold ${sc.color}`}>{stats.loading ? '—' : sc.value}</p>
              <p className="text-[11px] text-slate-400 font-semibold">{sc.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Surveillance Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cases */}
          <Link to="/government/cases"
            className="group bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all shadow-md flex items-start space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-105 transition-transform border border-blue-500/20 text-blue-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors text-base">Health Case Surveillance</h3>
              <p className="text-xs text-slate-400 mt-1">View all field health reports across all districts.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors mt-1" />
          </Link>

          {/* Mortality */}
          <Link to="/government/mortality"
            className="group bg-slate-900/80 border border-rose-500/20 hover:border-rose-500/50 rounded-2xl p-5 transition-all shadow-md flex items-start space-x-4">
            <div className="p-3 bg-rose-500/10 rounded-xl group-hover:scale-105 transition-transform border border-rose-500/20 text-rose-400">
              <Skull className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-200 group-hover:text-rose-400 transition-colors text-base">Mortality Surveillance</h3>
              <p className="text-xs text-slate-400 mt-1">Aggregate livestock mortality data and death counts.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-rose-400 transition-colors mt-1" />
          </Link>

          {/* Vaccination */}
          <Link to="/government/vaccination"
            className="group bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 transition-all shadow-md flex items-start space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-105 transition-transform border border-purple-500/20 text-purple-400">
              <Syringe className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-200 group-hover:text-purple-400 transition-colors text-base">Vaccination Coverage</h3>
              <p className="text-xs text-slate-400 mt-1">Statewide immunization records grouped by vaccine.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors mt-1" />
          </Link>

          {/* Locations */}
          <Link to="/government/locations"
            className="group bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all shadow-md flex items-start space-x-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-105 transition-transform border border-emerald-500/20 text-emerald-400">
              <Map className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors text-base">Geographic Summary</h3>
              <p className="text-xs text-slate-400 mt-1">Village-block-district location table from GPS reports.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors mt-1" />
          </Link>
        </div>
      </div>

      {/* Future Planned */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-purple-400 opacity-60" />
            <h3 className="font-bold text-slate-400 text-base">GIS Disease Hotspot Intelligence</h3>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-500 border border-slate-700 text-[10px] font-bold uppercase">
            Planned for Phase 7
          </span>
        </div>
        <p className="text-xs text-slate-500">
          PostGIS spatial clustering, outbreak prediction modeling, and interactive heatmap visualization.
        </p>
      </div>
    </div>
  );
};
