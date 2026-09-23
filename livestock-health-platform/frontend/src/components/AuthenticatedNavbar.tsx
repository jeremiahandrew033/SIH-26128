import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Activity, User, LogOut, Layers, Home, Camera, Menu, X } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { NetworkStatusBadge } from './NetworkStatusBadge';
import { Badge } from './Badge';

export const AuthenticatedNavbar: React.FC = () => {
  const { user, role, authMode, logout, updateLanguage } = useAuth();
  const { lang, changeLanguage } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
        return <Badge variant="forest">Farmer</Badge>;
      case 'veterinary_officer':
        return <Badge variant="info">Veterinary Officer</Badge>;
      case 'government_official':
        return <Badge variant="info">Government Official</Badge>;
      default:
        return <Badge variant="slate">User</Badge>;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: getPortalPath(), label: 'My Portal', icon: Home },
    { path: '/workflow', label: 'Workflow', icon: Layers },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/ivr-demo', label: 'IVR Demo', icon: null, emoji: '📞' },
    { path: '/cctv', label: 'CCTV', icon: Camera },
  ];

  return (
    <header className="border-b border-slate-800/50 bg-slate-950/90 backdrop-blur sticky top-0 z-50 shadow-lg transition-all duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to={getPortalPath()} className="flex items-center space-x-3 group flex-shrink-0">
          <div className="p-2 bg-forest-500/10 rounded-xl border border-forest-500/20 group-hover:border-forest-500/40 transition-colors">
            <Activity className="w-5 h-5 text-forest-400" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-100 text-base tracking-tight">LivestockHealth</span>
              {authMode === 'DEMO' && <Badge variant="alert" size="sm">Demo</Badge>}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              SIH Phase 0.5
            </span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1 flex-1 mx-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-250 flex items-center space-x-1.5 ${
                  isActive(item.path)
                    ? 'bg-forest-500/20 text-forest-300 border border-forest-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {Icon ? <Icon className="w-4 h-4" /> : <span>{item.emoji}</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <NetworkStatusBadge />

          {/* Language Switcher */}
          <div className="hidden sm:flex items-center space-x-0.5 bg-slate-900/50 p-1 rounded-lg border border-slate-800/50">
            {(['en', 'te', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  changeLanguage(l);
                  updateLanguage(l);
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${l === lang ? 'bg-forest-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* User Info */}
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="font-bold text-slate-200 truncate max-w-[120px]">{user?.full_name || 'User'}</span>
            <div className="mt-0.5">{getRoleBadge()}</div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 bg-slate-900/50 hover:bg-critical-500/10 text-slate-400 hover:text-critical-400 rounded-lg border border-slate-800 hover:border-critical-500/30 transition-all duration-250"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/50 bg-slate-900/50 backdrop-blur p-4 space-y-2 animate-slide-down">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive(item.path)
                    ? 'bg-forest-500/20 text-forest-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {Icon ? <Icon className="w-4 h-4" /> : <span>{item.emoji}</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800/50 flex items-center space-x-0.5">
            {(['en', 'te', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  changeLanguage(l);
                  updateLanguage(l);
                }}
                className={`flex-1 px-2 py-1.5 text-xs font-bold rounded transition-colors ${l === lang ? 'bg-forest-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
