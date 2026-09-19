import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Activity, User, Phone, Lock, Mail, Stethoscope, Building2, MapPin, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';

type Step = 'personal' | 'professional' | 'account';

export const RegisterVet: React.FC = () => {
  const { registerVet } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [organization, setOrganization] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validatePhone = (phone: string) => /^(\+91|91|0)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const steps: Step[] = ['personal', 'professional', 'account'];
  const stepIndex = steps.indexOf(step);
  const stepLabels = ['Personal', 'Professional', 'Account'];

  const nextStep = () => {
    setError(null);
    if (step === 'personal') {
      if (!fullName.trim()) { setError('Full name is required.'); return; }
      if (!mobile.trim()) { setError('Mobile number is required.'); return; }
      if (!validatePhone(mobile)) { setError('Please enter a valid Indian mobile number.'); return; }
      if (email && !validateEmail(email)) { setError('Please enter a valid email address.'); return; }
      setStep('professional');
    } else if (step === 'professional') {
      if (!licenseNumber.trim()) { setError('Veterinary registration/license number is required.'); return; }
      if (!organization.trim()) { setError('Organization / clinic / department is required.'); return; }
      if (!district.trim()) { setError('District / service area is required.'); return; }
      setStep('account');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setIsSubmitting(true);
    try {
      const normalizedPhone = mobile.startsWith('+91') ? mobile : `+91${mobile.replace(/^(91|0)/, '')}`;
      await registerVet({
        full_name: fullName.trim(),
        phone: normalizedPhone,
        email: email.trim() || undefined,
        password,
        license_number: licenseNumber.trim(),
        organization: organization.trim(),
        district: district.trim(),
      });
      setRegistered(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success/Pending state screen
  if (registered) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 bg-cover bg-center p-4"
        style={{ backgroundImage: `url(/assets/backgrounds/vet_bg.jpg)` }}
      >
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md text-center space-y-5">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Registration Submitted</h2>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-300">PENDING VERIFICATION</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your veterinarian account has been created. It is pending administrative verification before you receive full access to the platform.
            </p>
            <div className="bg-slate-800/60 rounded-xl p-4 text-left space-y-2 text-xs text-slate-400">
              <p className="font-semibold text-slate-300 mb-2">Account Details</p>
              <p>👤 Dr. {fullName}</p>
              <p>📞 {mobile}</p>
              <p>🏥 {organization} — {district}</p>
              <p>🪪 License: {licenseNumber}</p>
            </div>
            <p className="text-xs text-slate-500">
              For the prototype demo, use the <strong className="text-slate-300">demo account</strong> to access the veterinary portal immediately.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/login/vet')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Go to Vet Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 bg-cover bg-center p-4"
      style={{ backgroundImage: `url(/assets/backgrounds/vet_bg.jpg)` }}
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-3">
            <Activity className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">LIVESTOCK SENTINEL</h1>
          <p className="text-xs text-blue-400 font-semibold mt-1">Veterinarian Registration</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6 space-x-2">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center space-x-1.5 ${i <= stepIndex ? 'text-blue-400' : 'text-slate-600'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i < stepIndex ? 'bg-blue-500 border-blue-500 text-white' :
                  i === stepIndex ? 'border-blue-500 text-blue-400' :
                  'border-slate-700 text-slate-600'
                }`}>
                  {i < stepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs font-semibold hidden sm:inline">{stepLabels[i]}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 max-w-[40px] ${i < stepIndex ? 'bg-blue-500' : 'bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center space-x-3 mb-6">
            {step !== 'personal' ? (
              <button onClick={() => setStep(steps[stepIndex - 1])} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
            ) : (
              <Link to="/login/vet" className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </Link>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {step === 'personal' && 'Personal Details'}
                {step === 'professional' && 'Professional Details'}
                {step === 'account' && 'Create Account'}
              </h2>
              <p className="text-xs text-slate-400">Step {stepIndex + 1} of 3</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Personal */}
          {step === 'personal' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input type="text" placeholder="Dr. Full Name" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input type="tel" placeholder="+91 9876543210" value={mobile} onChange={e => setMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Email (Optional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input type="email" placeholder="dr.name@vet.gov.in" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button onClick={nextStep} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors">
                <span>Next: Professional Details</span><ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Professional */}
          {step === 'professional' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Veterinary License / Registration No. *</label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input type="text" placeholder="e.g. VCI/TS/12345" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Organization / Clinic / Department *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input type="text" placeholder="e.g. District Veterinary Hospital" value={organization} onChange={e => setOrganization(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">District / Service Area *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input type="text" placeholder="e.g. Karimnagar" value={district} onChange={e => setDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button onClick={nextStep} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors">
                <span>Next: Create Account</span><ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 3: Account */}
          {step === 'account' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start space-x-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">Your account will be in <strong>Pending Verification</strong> state until approved. Use the demo account for immediate access.</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 space-y-1 text-xs text-slate-400">
                <p className="font-semibold text-slate-300 mb-1">Summary</p>
                <p>👤 {fullName} | 📞 {mobile}</p>
                <p>🪪 {licenseNumber} — {organization}</p>
                <p>📍 {district}</p>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50">
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Registration'}</span>
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500 mt-4">
            Already registered? <Link to="/login/vet" className="text-blue-400 hover:text-blue-300 font-semibold">Sign In →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
