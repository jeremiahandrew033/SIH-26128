import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../auth/AuthService';
import { useTranslation } from '../i18n/useTranslation';
import { Activity, Globe, ChevronRight, Sprout, Stethoscope, Landmark, Zap, Loader2 } from 'lucide-react';

type Role = 'farmer' | 'vet' | 'gov';

interface RoleOption {
  id: Role;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  borderHover: string;
  bgHover: string;
  tagColor: string;
  route: string;
}

const roles: RoleOption[] = [
  {
    id: 'farmer',
    emoji: '👨‍🌾',
    title: 'Farmer',
    subtitle: 'Report animal health, manage herd, track vaccinations',
    color: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/60',
    bgHover: 'hover:bg-emerald-500/5',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    route: '/login/farmer',
  },
  {
    id: 'vet',
    emoji: '🩺',
    title: 'Veterinarian',
    subtitle: 'Review cases, examine animals, submit diagnoses',
    color: 'text-blue-400',
    borderHover: 'hover:border-blue-500/60',
    bgHover: 'hover:bg-blue-500/5',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    route: '/login/vet',
  },
  {
    id: 'gov',
    emoji: '🏛️',
    title: 'Government',
    subtitle: 'Disease surveillance, area intelligence, response coordination',
    color: 'text-purple-400',
    borderHover: 'hover:border-purple-500/60',
    bgHover: 'hover:bg-purple-500/5',
    tagColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    route: '/login/gov',
  },
];

// ─── Demo portal config ───────────────────────────────────────────────────────
interface DemoPortal {
  role: UserRole;
  uiRole: Role;
  label: string;
  description: string;
  persona: string;
  destination: string;
  Icon: React.FC<{ className?: string }>;
  gradient: string;
  border: string;
  iconBg: string;
  badge: string;
  badgeText: string;
  glowColor: string;
}

const DEMO_PORTALS: DemoPortal[] = [
  {
    role: 'farmer',
    uiRole: 'farmer',
    label: 'Explore Farmer Portal',
    description: 'Report illness, track herd health & vaccinations',
    persona: 'Ravi Kumar — Demo Farmer',
    destination: '/farmer',
    Icon: Sprout,
    gradient: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-500/40 hover:border-emerald-400/70',
    iconBg: 'bg-emerald-500/15',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    badgeText: 'Farmer',
    glowColor: 'hover:shadow-emerald-500/20',
  },
  {
    role: 'veterinary_officer',
    uiRole: 'vet',
    label: 'Explore Veterinarian Portal',
    description: 'Manage cases, diagnose animals & submit findings',
    persona: 'Dr. Anita Sharma — Demo Veterinarian',
    destination: '/vet',
    Icon: Stethoscope,
    gradient: 'from-blue-600 to-cyan-700',
    border: 'border-blue-500/40 hover:border-blue-400/70',
    iconBg: 'bg-blue-500/15',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    badgeText: 'Veterinarian',
    glowColor: 'hover:shadow-blue-500/20',
  },
  {
    role: 'government_official',
    uiRole: 'gov',
    label: 'Explore Government Portal',
    description: 'Disease surveillance, response coordination & analytics',
    persona: 'Shri Rajesh Verma — District Director',
    destination: '/government',
    Icon: Landmark,
    gradient: 'from-purple-600 to-violet-700',
    border: 'border-purple-500/40 hover:border-purple-400/70',
    iconBg: 'bg-purple-500/15',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    badgeText: 'Government',
    glowColor: 'hover:shadow-purple-500/20',
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export const Login: React.FC = () => {
  const { session, loginDemo, updateLanguage } = useAuth();
  const { lang, changeLanguage } = useTranslation();
  const navigate = useNavigate();

  const [selected, setSelected] = useState<Role | null>(null);
  const [demoLoading, setDemoLoading] = useState<UserRole | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  // If already authenticated, redirect to matching portal
  if (session) {
    const role = session.user.role;
    if (role === 'farmer') return <Navigate to="/farmer" replace />;
    if (role === 'veterinary_officer') return <Navigate to="/vet" replace />;
    if (role === 'government_official') return <Navigate to="/government" replace />;
  }

  const handleDemoEnter = async (portal: DemoPortal) => {
    if (demoLoading) return; // prevent double-click
    setDemoLoading(portal.role);
    setDemoError(null);
    try {
      await loginDemo(portal.role);
      navigate(portal.destination, { replace: true });
    } catch (err: any) {
      setDemoError(err.message || 'Failed to start demo session. Please try again.');
      setDemoLoading(null);
    }
  };

  const handleContinue = () => {
    if (selected) {
      const roleOption = roles.find(r => r.id === selected);
      if (roleOption) navigate(roleOption.route);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col text-slate-100 bg-cover bg-center relative"
      style={{ backgroundImage: `url(/assets/backgrounds/farmer_bg.jpg)` }}
    >
      {/* Dimming overlay */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"></div>

      {/* Language bar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-extrabold text-sm text-slate-300 tracking-widest uppercase">
            Livestock Sentinel
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <div className="flex bg-slate-900/70 p-1 rounded-lg border border-slate-700/50">
            {(['en', 'te', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => { changeLanguage(l); updateLanguage(l); }}
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

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        {/* Brand */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-2">
            <Activity className="w-9 h-9 text-emerald-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            LIVESTOCK<br />
            <span className="text-emerald-400">SENTINEL</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-md mx-auto">
            AI-powered livestock health surveillance &amp; early warning
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {['Early Detection', 'Prediction', 'Prevention', 'Containment'].map(tag => (
              <span key={tag} className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── ONE-CLICK DEMO PORTALS ── */}
        <div className="w-full max-w-lg mb-6">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">
                SIH Demo Mode
              </span>
            </div>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
            <div className="mb-4">
              <h2 className="text-lg font-extrabold text-slate-100 tracking-tight">
                Explore the platform using demo portals
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Instant access — no username or password required
              </p>
            </div>

            {/* Error banner */}
            {demoError && (
              <div className="mb-4 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium">
                {demoError}
              </div>
            )}

            {/* Three demo buttons */}
            <div className="space-y-3">
              {DEMO_PORTALS.map((portal) => {
                const isThis = demoLoading === portal.role;
                const isOther = demoLoading !== null && demoLoading !== portal.role;
                return (
                  <button
                    key={portal.role}
                    id={`demo-btn-${portal.uiRole}`}
                    type="button"
                    onClick={() => handleDemoEnter(portal)}
                    disabled={demoLoading !== null}
                    className={`
                      w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200
                      bg-slate-950/60 shadow-lg
                      ${portal.border}
                      ${portal.glowColor} hover:shadow-xl
                      ${isOther ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      ${isThis ? 'scale-[0.99]' : 'hover:scale-[1.01] active:scale-[0.99]'}
                      group
                    `}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${portal.iconBg} flex items-center justify-center`}>
                      {isThis ? (
                        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                      ) : (
                        <portal.Icon className="w-6 h-6 text-slate-200" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-extrabold text-slate-100 group-hover:text-white transition-colors">
                          {isThis ? 'Opening portal…' : portal.label}
                        </span>
                        <span className={`hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border ${portal.badge}`}>
                          {portal.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors truncate">
                        {isThis ? portal.persona : portal.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      className={`flex-shrink-0 w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-all duration-200 ${
                        isThis ? '' : 'group-hover:translate-x-1'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="w-full max-w-lg flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-slate-700/50" />
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            or select a role for manual sign-in
          </span>
          <div className="flex-1 h-px bg-slate-700/50" />
        </div>

        {/* ── Role Selection Card (preserved for real auth) ── */}
        <div className="w-full max-w-md">
          <div className="bg-slate-900/70 border border-slate-700/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-100">Who are you?</h2>
              <p className="text-xs text-slate-400 mt-1">Select your role to continue</p>
            </div>

            <div className="space-y-3">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelected(r.id)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-2xl border transition-all text-left group ${
                    selected === r.id
                      ? `border-2 ${r.color.replace('text-', 'border-').replace('-400', '-500')} bg-opacity-10 ${r.bgHover}`
                      : `border border-slate-700/60 ${r.borderHover} ${r.bgHover}`
                  }`}
                >
                  <span className="text-3xl flex-shrink-0">{r.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`text-base font-bold ${selected === r.id ? r.color : 'text-slate-200'}`}>
                        {r.title}
                      </span>
                      {selected === r.id && (
                        <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${r.tagColor}`}>
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed truncate">{r.subtitle}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${selected === r.id ? r.color : 'text-slate-600'}`} />
                </button>
              ))}
            </div>

            <button
              onClick={handleContinue}
              disabled={!selected}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-lg"
            >
              Continue →
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-500">
        SIH 2026 Prototype — Livestock Sentinel — AI-Enabled Livestock Health Surveillance
      </footer>
    </div>
  );
};
