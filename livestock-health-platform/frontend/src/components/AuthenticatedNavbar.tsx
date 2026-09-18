import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Activity, User, LogOut, Layers, Home } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { NetworkStatusBadge } from './NetworkStatusBadge';

export const AuthenticatedNavbar: React.FC = () => {
  const { user, role, authMode, logout, updateLanguage } = useAuth();
  const { lang, changeLanguage } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPortalPath = () => {
    if (role === 'farmer') return '/farmer';
    if (role === 'veterinary_officer') return '/vet';
    if (role === 'government_official') return '/government';
    return '/login';
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'farmer':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Farmer</span>;
      case 'veterinary_officer':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Veterinary Officer</span>;
      case 'government_official':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">Government Official</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300">User</span>;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to={getPortalPath()} className="flex items-center space-x-3 group">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-100 text-base sm:text-lg tracking-tight">LivestockHealth</span>
              {authMode === 'DEMO' && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Demo Mode
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Phase 0.5 — Auth Foundation
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to={getPortalPath()}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              isActive(getPortalPath())
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>My Portal</span>
          </Link>

          <Link
            to="/workflow"
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              isActive('/workflow')
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Workflow</span>
          </Link>

          <Link
            to="/profile"
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              isActive('/profile')
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>

          <Link
            to="/ivr-demo"
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              isActive('/ivr-demo')
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="text-emerald-400">📞</span>
            <span>IVR Demo</span>
          </Link>
        </nav>

        {/* User Right Badge & Logout */}
        <div className="flex items-center space-x-3">
          <NetworkStatusBadge />

          {/* Language Switcher */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(['en', 'te', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  changeLanguage(l);
                  updateLanguage(l);
                }}
                className={`px-2 py-0.5 text-xs font-bold rounded uppercase transition-colors ${
                  lang === l ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="font-bold text-slate-200">{user?.full_name || 'User'}</span>
            <div className="mt-0.5">{getRoleBadge()}</div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-800 hover:border-rose-500/30 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
