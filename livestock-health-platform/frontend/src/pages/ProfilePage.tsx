import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useTranslation } from '../i18n/useTranslation';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, role, authMode, logout, updateLanguage } = useAuth();
  const { lang, changeLanguage, t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">{user?.full_name || 'User Profile'}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                {role?.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">• {authMode} Auth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg text-xs">
        <h2 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-3">
          Account Metadata
        </h2>

        <div className="divide-y divide-slate-800">
          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-400">User ID</span>
            <span className="font-mono text-slate-200">{user?.id}</span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-400">Auth User ID</span>
            <span className="font-mono text-slate-300">{user?.auth_user_id}</span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-400">Email</span>
            <span className="font-semibold text-slate-200">{user?.email || 'N/A'}</span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-400">Phone</span>
            <span className="font-semibold text-slate-200">{user?.phone || 'N/A'}</span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-400">System Role</span>
            <span className="font-bold text-emerald-400 capitalize">{role?.replace('_', ' ')}</span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-400">Authentication Mode</span>
            <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
              {authMode === 'DEMO' ? 'Demo Mode (SIH Prototype)' : 'Supabase Auth'}
            </span>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg text-xs">
        <h2 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-3">
          Preferences & Settings
        </h2>

        <div className="space-y-2">
          <label className="block text-slate-400 font-semibold uppercase">{t('language')}</label>
          <div className="flex space-x-2">
            {(['en', 'te', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  changeLanguage(l);
                  updateLanguage(l);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  lang === l
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {l === 'en' ? 'English' : l === 'te' ? 'తెలుగు (Telugu)' : 'हिंदी (Hindi)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs rounded-xl border border-rose-500/30 transition-all flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};
