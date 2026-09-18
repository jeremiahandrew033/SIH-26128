import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { useFarmer } from '../../context/FarmerContext';
import { FolderHeart, AlertTriangle, Skull, Syringe, Stethoscope, ClipboardList, Plus } from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { activeFarmer } = useFarmer();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-2 shadow-lg">
        <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          Farmer Assistance Portal
        </span>
        <h2 className="text-2xl font-bold text-slate-100">
          Namaste, {activeFarmer?.name || 'Farmer'}!
        </h2>
        <p className="text-xs text-slate-300">
          Village: <span className="text-emerald-400 font-semibold">{activeFarmer?.village || 'Kollur'}</span> • Block: {activeFarmer?.block || 'Ramachandrapuram'} • District: {activeFarmer?.district || 'Sangareddy'}
        </p>
      </div>

      {/* Primary Actions Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Quick Services
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* My Animals */}
          <Link
            to="/farmer/animals"
            className="group bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 transition-all shadow-md flex items-start space-x-4"
          >
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-105 transition-transform border border-emerald-500/20">
              <FolderHeart className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                {t('myAnimals')}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                View registered cattle, buffalo, goats, sheep, and poultry records.
              </p>
            </div>
          </Link>

          {/* Report Sick Animal */}
          <Link
            to="/farmer/report"
            className="group bg-slate-900/80 border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-5 transition-all shadow-md flex items-start space-x-4"
          >
            <div className="p-3 bg-amber-500/10 rounded-xl group-hover:scale-105 transition-transform border border-amber-500/30">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                {t('reportSickAnimal')}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Submit symptoms, photo attachments, and location for immediate review.
              </p>
            </div>
          </Link>

          {/* Report Mortality */}
          <Link
            to="/farmer/mortality"
            className="group bg-slate-900/80 border border-rose-500/30 hover:border-rose-500/60 rounded-xl p-5 transition-all shadow-md flex items-start space-x-4"
          >
            <div className="p-3 bg-rose-500/10 rounded-xl group-hover:scale-105 transition-transform border border-rose-500/30">
              <Skull className="w-7 h-7 text-rose-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 group-hover:text-rose-400 transition-colors">
                {t('reportMortality')}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Record animal or herd death numbers with location disclaimer.
              </p>
            </div>
          </Link>

          {/* Vaccination */}
          <Link
            to="/farmer/animals"
            className="group bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 transition-all shadow-md flex items-start space-x-4"
          >
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-105 transition-transform border border-blue-500/30">
              <Syringe className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                {t('vaccination')}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Check immunization records and upcoming vaccination due dates.
              </p>
            </div>
          </Link>

          {/* Treatment History */}
          <Link
            to="/farmer/animals"
            className="group bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 transition-all shadow-md flex items-start space-x-4"
          >
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-105 transition-transform border border-purple-500/30">
              <Stethoscope className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
                {t('treatmentHistory')}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Review past medications, doctor prescriptions, and medical logs.
              </p>
            </div>
          </Link>

          {/* My Cases */}
          <Link
            to="/farmer/cases"
            className="group bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 transition-all shadow-md flex items-start space-x-4"
          >
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-105 transition-transform border border-emerald-500/30">
              <ClipboardList className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                {t('myCases')}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Track submitted health and mortality cases with status badges.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Action Float */}
      <div className="pt-4 flex justify-center">
        <Link
          to="/farmer/animals/new"
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('registerNewAnimal')}</span>
        </Link>
      </div>
    </div>
  );
};
