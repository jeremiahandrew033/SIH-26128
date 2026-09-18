import React, { useState } from 'react';
import { Phone, CheckCircle, AlertTriangle, Activity, Skull, UserPlus } from 'lucide-react';
import { fetchFarmers, createFarmer, createHealthReport, createMortalityReport, fetchFarmerAnimals } from '../../services/api';
import { Farmer, Animal } from '../../types';
import { MainLayout } from '../../layouts/MainLayout';

export const IvrDemoPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [step, setStep] = useState<'IDLE' | 'CALLING' | 'MENU' | 'REPORT_HEALTH' | 'REPORT_MORTALITY' | 'SUCCESS'>('IDLE');
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Health Report State
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | 'unknown'>('unknown');
  
  // Mortality Report State
  const [deaths, setDeaths] = useState('1');
  
  const [caseId, setCaseId] = useState('');

  const handleCall = async () => {
    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError(null);
    setStep('CALLING');
    try {
      const farmers = await fetchFarmers();
      const existing = farmers.find(f => f.phone === phoneNumber);
      if (existing) {
        setFarmer(existing);
        const anims = await fetchFarmerAnimals(existing.id).catch(() => []);
        setAnimals(anims);
        if (anims.length > 0) setSelectedAnimalId(anims[0].id);
        setStep('MENU');
      } else {
        // Auto-create a pending farmer for demo purposes
        const newFarmer = await createFarmer({
          name: 'Unknown Farmer',
          phone: phoneNumber,
          preferred_language: 'en'
        });
        setFarmer(newFarmer);
        setAnimals([]);
        setSelectedAnimalId('');
        setStep('MENU');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
      setStep('IDLE');
    }
  };

  const submitHealthReport = async () => {
    if (!farmer) return;
    try {
      const res = await createHealthReport({
        farmer_id: farmer.id,
        animal_id: selectedAnimalId || undefined,
        report_type: 'illness',
        symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
        severity: severity,
        source: 'PHONE_IVR',
        caller_phone: phoneNumber,
        location: { village: farmer.village || 'Unknown' }
      });
      setCaseId(res.case_id);
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Failed to submit');
    }
  };

  const submitMortalityReport = async () => {
    if (!farmer) return;
    try {
      const res = await createMortalityReport({
        farmer_id: farmer.id,
        animal_id: selectedAnimalId || undefined,
        number_of_deaths: parseInt(deaths, 10),
        source: 'PHONE_IVR',
        caller_phone: phoneNumber,
        location: { village: farmer.village || 'Unknown' }
      });
      setCaseId(res.case_id);
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Failed to submit');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-slate-800/50 p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-400" />
                PHONE / IVR DEMO
              </h1>
              <p className="text-slate-400 text-sm mt-1">Simulate incoming farmer phone reports</p>
            </div>
            {step !== 'IDLE' && (
              <button 
                onClick={() => {
                  setStep('IDLE');
                  setFarmer(null);
                  setCaseId('');
                  setError(null);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 border border-rose-500/20 rounded-lg hover:bg-rose-500/10"
              >
                End Call
              </button>
            )}
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-300">{error}</p>
              </div>
            )}

            {step === 'IDLE' && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">Incoming Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  placeholder="+91 9876543210"
                />
                <button
                  onClick={handleCall}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Simulate Call
                </button>
              </div>
            )}

            {step === 'CALLING' && (
              <div className="text-center py-12">
                <div className="animate-pulse flex flex-col items-center">
                  <Phone className="w-12 h-12 text-emerald-400 mb-4" />
                  <p className="text-slate-300 font-medium">Connecting to IVR...</p>
                  <p className="text-slate-500 text-sm mt-2">Identifying caller: {phoneNumber}</p>
                </div>
              </div>
            )}

            {step === 'MENU' && farmer && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Identified Caller</p>
                    <p className="text-white font-medium">{farmer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Phone</p>
                    <p className="text-slate-300 font-mono text-sm">{farmer.phone}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-slate-400 text-center mb-4">"Welcome to LivestockHealth. Please select an option:"</p>
                  
                  <button onClick={() => setStep('REPORT_HEALTH')} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-left flex items-center gap-4 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <span className="text-amber-400 font-bold group-hover:hidden">1</span>
                      <Activity className="w-5 h-5 text-amber-400 hidden group-hover:block" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">Report Sick Animal</p>
                      <p className="text-xs text-slate-500 mt-0.5">Health issues, diseases, injuries</p>
                    </div>
                  </button>

                  <button onClick={() => setStep('REPORT_MORTALITY')} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-left flex items-center gap-4 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                      <span className="text-rose-400 font-bold group-hover:hidden">2</span>
                      <Skull className="w-5 h-5 text-rose-400 hidden group-hover:block" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">Report Animal Death</p>
                      <p className="text-xs text-slate-500 mt-0.5">Mortality reporting</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {step === 'REPORT_HEALTH' && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" /> Report Sickness
                </h3>
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Symptoms (Voice Input Simulated)</label>
                  <input
                    type="text"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. fever, not eating"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Select Animal (Optional)</label>
                  <select 
                    value={selectedAnimalId} 
                    onChange={(e) => setSelectedAnimalId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                  >
                    <option value="">-- None / General --</option>
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>{a.animal_code} - {a.species}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Severity</label>
                  <select 
                    value={severity} 
                    onChange={(e: any) => setSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                  >
                    <option value="unknown">Unknown / Not sure</option>
                    <option value="mild">Mild (Normal Priority)</option>
                    <option value="moderate">Moderate (Normal Priority)</option>
                    <option value="severe">Severe (High Priority)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setStep('MENU')} className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl font-medium">Back</button>
                  <button onClick={submitHealthReport} className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold">Submit Report</button>
                </div>
              </div>
            )}

            {step === 'REPORT_MORTALITY' && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Skull className="w-5 h-5 text-rose-400" /> Report Death
                </h3>
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Number of Deaths</label>
                  <input
                    type="number"
                    min="1"
                    value={deaths}
                    onChange={(e) => setDeaths(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">If &gt; 1, report will be marked as High Priority</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Select Animal (Optional)</label>
                  <select 
                    value={selectedAnimalId} 
                    onChange={(e) => setSelectedAnimalId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                  >
                    <option value="">-- None / General --</option>
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>{a.animal_code} - {a.species}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setStep('MENU')} className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl font-medium">Back</button>
                  <button onClick={submitMortalityReport} className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-bold">Submit Report</button>
                </div>
              </div>
            )}

            {step === 'SUCCESS' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Report Registered</h3>
                <p className="text-slate-400">"Your livestock health report has been registered."</p>
                
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mt-6 max-w-xs mx-auto">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Case Number</p>
                  <p className="text-lg font-mono text-emerald-400">{caseId}</p>
                </div>

                <button onClick={() => {
                  setStep('IDLE');
                  setCaseId('');
                  setSymptoms('');
                  setSeverity('unknown');
                  setDeaths('1');
                }} className="mt-8 text-slate-400 hover:text-white underline text-sm">
                  Start New Call
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
