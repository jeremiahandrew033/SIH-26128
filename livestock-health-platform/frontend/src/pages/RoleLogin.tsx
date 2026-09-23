import React, { useState } from "react";
import { useNavigate, useParams, Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { UserRole } from "../auth/AuthService";
import { Activity, Lock, Mail, Phone, AlertCircle, ArrowLeft } from "lucide-react";

export const RoleLogin: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const { session, login, loginDemo, error } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validRoles = ["farmer", "vet", "gov"];
  if (!role || !validRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  if (session) {
    const userRole = session.user.role;
    if (userRole === "farmer")              return <Navigate to="/farmer"     replace />;
    if (userRole === "veterinary_officer")  return <Navigate to="/vet"        replace />;
    if (userRole === "government_official") return <Navigate to="/government" replace />;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) { setLocalError("Please enter valid credentials."); return; }
    setIsSubmitting(true);
    setLocalError(null);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setLocalError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    try {
      const demoRole: UserRole =
        role === "farmer" ? "farmer"
        : role === "vet"  ? "veterinary_officer"
        :                   "government_official";
      await loginDemo(demoRole);
      if (demoRole === "farmer")               navigate("/farmer",     { replace: true });
      else if (demoRole === "veterinary_officer") navigate("/vet",     { replace: true });
      else                                       navigate("/government", { replace: true });
    } catch (err: any) {
      setLocalError(err.message || "Demo login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  let inputLabel = "Mobile / Email", inputPlaceholder = "Enter your contact";
  let Icon = Mail, bgImage = "/assets/backgrounds/farmer_bg.jpg";
  let roleTitle = "Farmer Login", demoLabel = "Use Demo Farmer Account";
  let demoUsername = "farmer.demo", demoPassword = "farmer123";

  if (role === "farmer") {
    inputLabel = "Mobile Number"; inputPlaceholder = "+91 9876543210";
    Icon = Phone; bgImage = "/assets/backgrounds/farmer_bg.jpg";
    roleTitle = "Farmer Login"; demoLabel = "Use Demo Farmer Account";
    demoUsername = "farmer.demo"; demoPassword = "farmer123";
  } else if (role === "vet") {
    inputLabel = "Mobile / Email"; inputPlaceholder = "dr.name@vet.gov.in";
    Icon = Mail; bgImage = "/assets/backgrounds/vet_bg.jpg";
    roleTitle = "Veterinarian Login"; demoLabel = "Use Demo Veterinarian Account";
    demoUsername = "vet.demo"; demoPassword = "vet123";
  } else if (role === "gov") {
    inputLabel = "Authorized ID / Email"; inputPlaceholder = "official@gov.in";
    Icon = Mail; bgImage = "/assets/backgrounds/gov_bg.jpg";
    roleTitle = "Government Authorized Login"; demoLabel = "Use Demo Government Account";
    demoUsername = "gov.demo"; demoPassword = "gov123";
  }

  const isDemoMode: boolean =
    (import.meta as any).env?.VITE_DEMO_MODE === "true" ||
    !(import.meta as any).env?.VITE_API_BASE_URL;

  return (
    <div
      className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-100 selection:bg-emerald-500 selection:text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md mx-auto p-4">

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">LIVESTOCK SENTINEL</h1>
          <p className="text-xs font-semibold text-emerald-400 mt-1">AI-powered livestock health surveillance</p>
          {isDemoMode && (
            <span className="inline-block mt-2 px-3 py-0.5 bg-amber-500/15 border border-amber-500/40 rounded-full text-amber-400 text-[10px] font-bold uppercase tracking-widest">
              Demo Mode — SIH Prototype
            </span>
          )}
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">

          <div className="flex items-center space-x-3">
            <button type="button" onClick={() => navigate("/login")} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <h2 className="text-xl font-bold text-slate-100">{roleTitle}</h2>
          </div>

          {(localError || error) && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          {isDemoMode && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-amber-400 text-sm font-bold">Quick Demo Access</span>
                <span className="text-amber-600/70 text-xs">— no password required</span>
              </div>
              <div className="text-xs font-mono bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 flex flex-wrap gap-x-5 gap-y-1">
                <span><span className="text-slate-500">username </span><span className="text-emerald-400">{demoUsername}</span></span>
                <span><span className="text-slate-500">password </span><span className="text-emerald-400">{demoPassword}</span></span>
              </div>
              <button
                id={`demo-login-btn-${role}`}
                type="button"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-extrabold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" /> Signing in...</>
                ) : demoLabel}
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600 font-medium">{isDemoMode ? "or sign in manually" : "sign in"}</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-slate-300">{inputLabel}</label>
              <div className="relative">
                <Icon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input type="text" placeholder={inputPlaceholder} value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-slate-300">Password / PIN</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input type="password" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition-colors disabled:opacity-50">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {role === "farmer" && (
            <div className="pt-2 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-400">New Farmer? <Link to="/register/farmer" className="text-emerald-400 hover:text-emerald-300 font-bold">Register</Link></p>
            </div>
          )}
          {role === "vet" && (
            <div className="pt-2 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-400">New Veterinarian? <Link to="/register/vet" className="text-emerald-400 hover:text-emerald-300 font-bold">Register</Link></p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
