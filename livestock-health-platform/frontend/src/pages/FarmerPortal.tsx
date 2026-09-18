import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTranslation } from '../i18n/useTranslation';
import { FolderHeart, AlertTriangle, Skull, Syringe, ClipboardList, Plus, RefreshCw } from 'lucide-react';

export const FarmerPortal: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
            Phase 2 Active
          </span>
          <span className="text-xs text-slate-400">Authenticated Role: Farmer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Farmer Portal
        </h1>
        <p className="text-xs text-slate-300">
          Welcome, <span className="font-bold text-emerald-400">{user?.full_name || 'Farmer'}</span>! Manage your livestock, file health reports, and work offline seamlessly.
        </p>
      </div>

      {/* Primary Action Services Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Livestock Services
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* My Animals */}
          <Link
            to="/farmer/animals"
            className="group bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all shadow-md flex items-start space-x-4"
          >
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-105 transition-transform border border-emerald-500/20 text-emerald-400">
              <FolderHeart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors text-base">
                {t('myAnimals')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                View registered cattle, buffalo, goats, sheep, and poultry records.
              </p>
            </div>
          </Link>

          {/* Report Sick Animal */}
          <Link
            to="/farmer/report"
            className="group bg-slate-900/80 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-5 transition-all shadow-md flex items-start space-x-4"
          >
            <div className="p-3 bg-amber-500/10 rounded-xl group-hover:scale-105 transition-transform border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors text-base">
                {t('reportSickAnimal')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Submit symptoms, photo evidence, and GPS location for rapid response. Works offline.
              </p>
            </div>
          </Link>

          {/* Report Mortality */}
          <Link
            to="/farmer/mortality"
            className="group bg-slate-900/80 border border-rose-500/30 hover:border-rose-500/60 rounded-2xl p-5 transition-all shadow-md flex items-start space-x-4"
          >
            <div className="p-3 bg-rose-500/10 rounded-xl group-hover:scale-105 transition-transform border border-rose-500/30 text-rose-400">
              <Skull className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 group-hover:text-rose-400 transition-colors text-base">
                {t('reportMortality')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Record animal or herd death numbers with location disclaimer. Works offline.
              </p>
            </div>
          </Link>

          {/* Offline Sync Dashboard */}
          <Link
            to="/farmer/sync"
            className="group bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-5 transition-all shadow-md flex items-start space-x-4"
          >
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-105 transition-transform border border-emerald-500/30 text-emerald-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors text-base">
                Offline Sync Dashboard
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Manage pending offline reports, view sync history, and trigger manual sync.
              </p>
            </div>
          </Link>

          {/* Vaccination */}
          <Link
            to="/farmer/vaccination"
            className="group bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all shadow-md flex items-start space-x-4"
          >
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-105 transition-transform border border-blue-500/20 text-blue-400">
              <Syringe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors text-base">
                {t('vaccination')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Track immunization schedules and booster due dates in animal profile.
              </p>
            </div>
          </Link>

          {/* My Cases */}
          <Link
            to="/farmer/cases"
            className="group bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all shadow-md flex items-start space-x-4"
          >
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-105 transition-transform border border-emerald-500/20 text-emerald-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors text-base">
                {t('myCases')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Monitor filed reports and status badges (PENDING SYNC, SYNCED, REPORTED).
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="pt-2 flex justify-center">
        <Link
          to="/farmer/animals/new"
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('registerNewAnimal')}</span>
        </Link>
      </div>
    </div>
  );
};
