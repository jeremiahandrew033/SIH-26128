import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../auth/AuthService';
import { useTranslation } from '../i18n/useTranslation';
import { Activity, ShieldCheck, User, Stethoscope, Building2, Lock, Mail, Globe, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { session, login, loginDemo, error, updateLanguage } = useAuth();
  const { lang, changeLanguage, t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // If already authenticated, redirect to matching portal
  if (session) {
    const role = session.user.role;
    if (role === 'farmer') return <Navigate to="/farmer" replace />;
    if (role === 'veterinary_officer') return <Navigate to="/vet" replace />;
    if (role === 'government_official') return <Navigate to="/government" replace />;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please enter a valid email and password.');
      return;
    }
    setIsSubmitting(true);
    setLocalError(null);
    try {
      await login(email, password);
      // AuthContext will trigger role redirect
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setIsSubmitting(true);
    setLocalError(null);
    try {
      await loginDemo(role);
      if (role === 'farmer') navigate('/farmer');
      else if (role === 'veterinary_officer') navigate('/vet');
      else if (role === 'government_official') navigate('/government');
    } catch (err: any) {
      setLocalError(err.message || 'Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Header / Language bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 sticky top-0 z-50 backdrop-blur">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-extrabold text-slate-100 text-lg tracking-tight">
            LivestockHealth
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(['en', 'te', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  changeLanguage(l);
                  updateLanguage(l);
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded uppercase transition-colors ${
                  lang === l ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Split Desktop / Centered Mobile Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: Desktop Brand Mission Visual */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Phase 0.5 — Authentication Foundation</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
              AI-Enabled Livestock Health
            </h1>

            <p className="text-sm sm:text-base font-semibold text-emerald-400 leading-relaxed">
              Early Detection | Prediction | Prevention | Community Containment | Management
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0">
              National epidemic surveillance and livestock health management platform. Securely connects farmers, veterinary officers, and government authorities.
            </p>

            {/* Platform Trust Highlights */}
            <div className="pt-4 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 text-center text-xs">
              <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                <span className="font-extrabold text-emerald-400 text-base block">Phase 0.5</span>
                <span className="text-[10px] text-slate-400">Auth Active</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                <span className="font-extrabold text-slate-200 text-base block">3 Roles</span>
                <span className="text-[10px] text-slate-400">Farmer/Vet/Gov</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                <span className="font-extrabold text-amber-400 text-base block">SIH Ready</span>
                <span className="text-[10px] text-slate-400">Demo Adapter</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Login Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-slate-100">{t('login')}</h2>
                <p className="text-xs text-slate-400">Sign in to access your platform role dashboard</p>
              </div>

              {(localError || error) && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{localError || error}</span>
                </div>
              )}

              {/* Standard Email/Password Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-slate-300">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="farmer@livestock.gov.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-slate-300">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? t('checkingSession') : t('loginButton')}
                </button>
              </form>

              {/* DEMO LOGIN SECTION */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {t('demoMode')}
                  </span>
                  <span className="text-[10px] text-slate-500">SIH Quick Access</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('farmer')}
                    disabled={isSubmitting}
                    className="p-3 bg-slate-950 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-center transition-all group"
                  >
                    <User className="w-5 h-5 text-emerald-400 mx-auto group-hover:scale-110 transition-transform" />
                    <span className="block text-[10px] font-bold text-slate-200 mt-1.5">{t('farmerDemo')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('veterinary_officer')}
                    disabled={isSubmitting}
                    className="p-3 bg-slate-950 hover:bg-blue-500/10 border border-slate-800 hover:border-blue-500/40 rounded-xl text-center transition-all group"
                  >
                    <Stethoscope className="w-5 h-5 text-blue-400 mx-auto group-hover:scale-110 transition-transform" />
                    <span className="block text-[10px] font-bold text-slate-200 mt-1.5">{t('vetDemo')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('government_official')}
                    disabled={isSubmitting}
                    className="p-3 bg-slate-950 hover:bg-purple-500/10 border border-slate-800 hover:border-purple-500/40 rounded-xl text-center transition-all group"
                  >
                    <Building2 className="w-5 h-5 text-purple-400 mx-auto group-hover:scale-110 transition-transform" />
                    <span className="block text-[10px] font-bold text-slate-200 mt-1.5">{t('govDemo')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
        {t('prototypeFooter')}
      </footer>
    </div>
  );
};
