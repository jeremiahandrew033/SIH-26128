import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Activity, User, Phone, Lock, MapPin, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Globe } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const LIVESTOCK_SPECIES = ['Cattle (Cow/Bull)', 'Buffalo', 'Goat', 'Sheep', 'Pig', 'Poultry', 'Mixed'];

type Step = 'personal' | 'location' | 'livestock' | 'account';

export const RegisterFarmer: React.FC = () => {
  const { registerFarmer } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [species, setSpecies] = useState('');
  const [animalCount, setAnimalCount] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en'|'te'|'hi'>('en');

  const validatePhone = (phone: string) => /^(\+91|91|0)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));

  const nextStep = () => {
    setError(null);
    if (step === 'personal') {
      if (!fullName.trim()) { setError('Full name is required.'); return; }
      if (!mobile.trim()) { setError('Mobile number is required.'); return; }
      if (!validatePhone(mobile)) { setError('Please enter a valid Indian mobile number.'); return; }
      setStep('location');
    } else if (step === 'location') {
      if (!state) { setError('Please select your state.'); return; }
      if (!district.trim()) { setError('District is required.'); return; }
      if (!village.trim()) { setError('Village is required.'); return; }
      setStep('livestock');
    } else if (step === 'livestock') {
      if (!species) { setError('Please select livestock type.'); return; }
      if (!animalCount || parseInt(animalCount) <= 0) { setError('Please enter a valid number of animals.'); return; }
      setStep('account');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || password.length < 4) { setError('Password/PIN must be at least 4 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setIsSubmitting(true);
    try {
      const normalizedPhone = mobile.startsWith('+91') ? mobile : `+91${mobile.replace(/^(91|0)/, '')}`;
      await registerFarmer({
        full_name: fullName.trim(),
        phone: normalizedPhone,
        password,
        state,
        district: district.trim(),
        village: village.trim(),
        livestock_species: species,
        animal_count: parseInt(animalCount),
        preferred_language: preferredLanguage,
      });
      navigate('/farmer');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: Step[] = ['personal', 'location', 'livestock', 'account'];
  const stepIndex = steps.indexOf(step);
  const stepLabels = ['Personal', 'Location', 'Livestock', 'Account'];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 bg-cover bg-center p-4"
      style={{ backgroundImage: `url(/assets/backgrounds/farmer_bg.jpg)` }}
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-3">
            <Activity className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">LIVESTOCK SENTINEL</h1>
          <p className="text-xs text-emerald-400 font-semibold mt-1">Farmer Registration</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6 space-x-2">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center space-x-1.5 ${i <= stepIndex ? 'text-emerald-400' : 'text-slate-600'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i < stepIndex ? 'bg-emerald-500 border-emerald-500 text-white' :
                  i === stepIndex ? 'border-emerald-500 text-emerald-400' :
                  'border-slate-700 text-slate-600'
                }`}>
                  {i < stepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs font-semibold hidden sm:inline">{stepLabels[i]}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 max-w-[40px] ${i < stepIndex ? 'bg-emerald-500' : 'bg-slate-700'}`} />
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
              <Link to="/login/farmer" className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </Link>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {step === 'personal' && 'Personal Details'}
                {step === 'location' && 'Your Location'}
                {step === 'livestock' && 'Your Livestock'}
                {step === 'account' && 'Create Account'}
              </h2>
              <p className="text-xs text-slate-400">Step {stepIndex + 1} of 4</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Personal Details */}
          {step === 'personal' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. Ravi Kumar"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Used for IVR phone reporting system</p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Preferred Language *</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <select
                    value={preferredLanguage}
                    onChange={e => setPreferredLanguage(e.target.value as 'en'|'te'|'hi')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 appearance-none"
                  >
                    <option value="en">English</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                  </select>
                </div>
              </div>
              <button onClick={nextStep} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors">
                <span>Next: Location</span><ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 'location' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">State *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 appearance-none"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">District *</label>
                <input
                  type="text"
                  placeholder="e.g. Karimnagar"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Village *</label>
                <input
                  type="text"
                  placeholder="e.g. Manchal"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button onClick={nextStep} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors">
                <span>Next: Livestock</span><ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 3: Livestock */}
          {step === 'livestock' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Primary Livestock Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {LIVESTOCK_SPECIES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpecies(s)}
                      className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all text-left ${
                        species === s
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Approximate Number of Animals *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 15"
                  value={animalCount}
                  onChange={e => setAnimalCount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button onClick={nextStep} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors">
                <span>Next: Create Account</span><ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 4: Account Creation */}
          {step === 'account' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Password / PIN *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="Min 4 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Confirm Password / PIN *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              {/* Summary */}
              <div className="bg-slate-800/60 rounded-xl p-3 space-y-1 text-xs text-slate-400">
                <p className="font-semibold text-slate-300 mb-1">Registration Summary</p>
                <p>👤 {fullName} | 📞 {mobile}</p>
                <p>📍 {village}, {district}, {state}</p>
                <p>🐄 {species} — ~{animalCount} animals</p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating account...' : 'Create Farmer Account'}</span>
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500 mt-4">
            Already registered? <Link to="/login/farmer" className="text-emerald-400 hover:text-emerald-300 font-semibold">Sign In →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
