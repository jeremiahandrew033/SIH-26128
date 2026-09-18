import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { useFarmer } from '../../context/FarmerContext';
import { fetchFarmerAnimals, fetchFarmerHerds, createHealthReport, uploadCaseAttachment } from '../../services/api';
import { offlineStore } from '../../offline/OfflineStore';
import { SyncQueue } from '../../offline/SyncQueue';
import { useOnlineStatus } from '../../offline/useOnlineStatus';
import { Animal, Herd, LocationPayload } from '../../types';
import { ArrowLeft, Camera, MapPin, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft, Brain } from 'lucide-react';
import { AIScreeningPanel } from '../../components/AIScreeningPanel';
import { API_BASE_URL } from '../../config/env';

const SYMPTOM_OPTIONS = [
  'Fever-like signs',
  'Reduced feeding',
  'Coughing',
  'Nasal discharge',
  'Diarrhea',
  'Lameness',
  'Skin lesions',
  'Swelling',
  'Excess salivation',
  'Abnormal behavior',
  'Weakness',
  'Other'
];

export const HealthReportFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { activeFarmer } = useFarmer();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [herds, setHerds] = useState<Herd[]>([]);

  // Form State
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [selectedHerdId, setSelectedHerdId] = useState<string>('');
  const [reportType, setReportType] = useState<string>('illness');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [severity, setSeverity] = useState<string>('moderate');

  // Attachment State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // AI Pre-screening State (client-side preview before submit)
  const [aiScreening, setAiScreening] = useState<{
    prediction?: string;
    confidence?: number;
    risk_level?: 'LOW' | 'WATCH' | 'HIGH';
    model_version?: string;
    processed_at?: string;
  } | null>(null);
  const [aiScreening_loading, setAiScreeningLoading] = useState(false);

  // Location State
  const [location, setLocation] = useState<LocationPayload>({
    village: activeFarmer?.village || '',
    block: activeFarmer?.block || '',
    district: activeFarmer?.district || ''
  });
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'capturing' | 'success' | 'failed'>('idle');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeFarmer) return;
    Promise.all([
      fetchFarmerAnimals(activeFarmer.id).catch(() => []),
      fetchFarmerHerds(activeFarmer.id).catch(() => [])
    ]).then(([aList, hList]) => {
      setAnimals(aList);
      setHerds(hList);
      if (aList.length > 0) setSelectedAnimalId(aList[0].id);
    });
  }, [activeFarmer]);

  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setAiScreening(null);

      // Attempt client-side AI pre-screening via backend /api/v1/health/ai-screen
      const isOnline = navigator.onLine && localStorage.getItem('demo_simulated_offline') !== 'true';
      if (isOnline) {
        setAiScreeningLoading(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
          // Pass selected symptoms for context
          selectedSymptoms.forEach((s) => formData.append('symptoms', s));
          const res = await fetch(`${API_BASE_URL}/api/v1/health/ai-screen`, {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            setAiScreening(data);
          }
        } catch (e) {
          // Silently skip — not critical
        } finally {
          setAiScreeningLoading(false);
        }
      }
    }
  };

  const captureGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('failed');
      return;
    }
    setGpsStatus('capturing');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy_meters: pos.coords.accuracy
        }));
        setGpsStatus('success');
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        setGpsStatus('failed');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async () => {
    if (!activeFarmer) return;
    if (!selectedAnimalId && !selectedHerdId) {
      setError('Please select an animal or herd.');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Photo size check (5 MB limit for offline store)
    if (photoFile && photoFile.size > 5 * 1024 * 1024 && !useOnlineStatus().isEffectiveOnline) {
      setError('Photo exceeds 5 MB size limit for offline storage. Please choose a smaller photo or reconnect before submitting.');
      setSubmitting(false);
      return;
    }

    const payload = {
      farmer_id: activeFarmer.id,
      animal_id: selectedAnimalId || undefined,
      herd_id: selectedHerdId || undefined,
      report_type: reportType,
      description: description || undefined,
      symptoms: selectedSymptoms,
      duration_text: duration || undefined,
      severity,
      location: (location.latitude || location.village) ? location : undefined,
    };

    // Check if offline
    const isOnline = navigator.onLine && localStorage.getItem('demo_simulated_offline') !== 'true';

    if (!isOnline) {
      try {
        const localId = `LOCAL-HEALTH-${Date.now()}`;
        
        await offlineStore.saveRecord({
          id: localId,
          entity_type: 'health_report',
          payload,
          photo_blob: photoFile || null,
          photo_name: photoFile ? photoFile.name : undefined,
          created_at: new Date().toISOString(),
          sync_status: 'pending'
        });

        await SyncQueue.addOperation('health_report', payload, localId);

        // Show offline success notification & navigate
        alert("Report saved offline. Case will sync automatically when connectivity returns.");
        navigate('/farmer/cases');
      } catch (err: any) {
        setError(err.message || 'Failed to save record offline.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      const createdReport = await createHealthReport(payload);

      // Upload attachment photo if selected
      if (photoFile) {
        await uploadCaseAttachment(createdReport.case_id, photoFile).catch((e) => {
          console.warn('Photo upload failed:', e);
        });
      }

      navigate(`/farmer/cases/${createdReport.case_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <button
          onClick={() => navigate('/farmer')}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100">{t('reportSickAnimal')}</h2>
          <p className="text-xs text-slate-400">Step {step} of 8 • Mobile Guided Form</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Form Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Step 1: Select Animal or Herd */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-200 text-base">{t('selectAnimalOrHerd')}</h3>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-400">Target Animal</label>
              <select
                value={selectedAnimalId}
                onChange={(e) => {
                  setSelectedAnimalId(e.target.value);
                  setSelectedHerdId('');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Select Animal --</option>
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.animal_code} - {a.species} ({a.breed || 'Standard'})
                  </option>
                ))}
              </select>

              {herds.length > 0 && (
                <>
                  <div className="text-center text-xs text-slate-500 uppercase font-bold">OR</div>
                  <label className="block text-xs font-semibold text-slate-400">Entire Herd / Flock</label>
                  <select
                    value={selectedHerdId}
                    onChange={(e) => {
                      setSelectedHerdId(e.target.value);
                      setSelectedAnimalId('');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Herd --</option>
                    {herds.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name || h.species} ({h.animal_count} count)
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Report Type */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-200 text-base">{t('reportType')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'illness', label: t('illness') },
                { id: 'injury', label: t('injury') },
                { id: 'abnormal_behavior', label: t('abnormalBehavior') },
                { id: 'routine_check', label: t('routineCheck') }
              ].map((rt) => (
                <button
                  type="button"
                  key={rt.id}
                  onClick={() => setReportType(rt.id)}
                  className={`p-4 rounded-xl border font-bold text-xs text-left transition-all ${
                    reportType === rt.id
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Symptoms Checklist */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-200 text-base">{t('symptoms')}</h3>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 border border-slate-800 rounded-xl bg-slate-950">
              {SYMPTOM_OPTIONS.map((sym) => {
                const checked = selectedSymptoms.includes(sym);
                return (
                  <button
                    type="button"
                    key={sym}
                    onClick={() => handleSymptomToggle(sym)}
                    className={`p-3 rounded-lg border text-xs font-semibold text-left transition-all ${
                      checked
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {checked ? '✓ ' : ''}{sym}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400">{t('description')}</label>
              <textarea
                rows={3}
                placeholder="Add any free-text observations or details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Step 4: Duration */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-200 text-base">{t('duration')}</h3>
            <input
              type="text"
              placeholder="e.g. 2 days, 1 week, since yesterday"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {/* Step 5: Severity */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-200 text-base">{t('severity')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'mild', label: t('mild'), color: 'emerald' },
                { id: 'moderate', label: t('moderate'), color: 'amber' },
                { id: 'severe', label: t('severe'), color: 'rose' },
                { id: 'unknown', label: t('unknown'), color: 'slate' }
              ].map((sev) => (
                <button
                  type="button"
                  key={sev.id}
                  onClick={() => setSeverity(sev.id)}
                  className={`p-4 rounded-xl border font-bold text-xs text-left transition-all ${
                    severity === sev.id
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {sev.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Photo Attachment */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-200 text-base">{t('attachPhoto')}</h3>
            <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center space-y-3 bg-slate-950">
              {photoPreview ? (
                <div className="space-y-3">
                  <img src={photoPreview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-cover border border-slate-700" />
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); setAiScreening(null); }}
                    className="text-xs text-rose-400 font-semibold underline"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <div className="p-4 bg-slate-900 rounded-full w-14 h-14 mx-auto flex items-center justify-center text-emerald-400">
                    <Camera className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 block">Take or Choose Photo</span>
                  <span className="text-[10px] text-slate-500 block">Allowed: JPEG, PNG, WEBP (Max 10 MB)</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
                </label>
              )}
            </div>

            {/* AI Pre-screening Preview */}
            {aiScreening_loading && (
              <div className="flex items-center space-x-2 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                <Brain className="w-4 h-4 animate-pulse" />
                <span>Running AI screening on your photo...</span>
              </div>
            )}
            {aiScreening && !aiScreening_loading && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">AI Pre-Screening Preview</p>
                <AIScreeningPanel
                  ai_prediction={aiScreening.prediction}
                  ai_confidence={aiScreening.confidence}
                  ai_risk_level={aiScreening.risk_level}
                  ai_model_version={aiScreening.model_version}
                  ai_processed_at={aiScreening.processed_at}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 7: Location Capture */}
        {step === 7 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-200 text-base">{t('captureLocation')}</h3>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Device GPS Geolocation</span>
                <button
                  type="button"
                  onClick={captureGps}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{gpsStatus === 'capturing' ? 'Capturing...' : 'Capture GPS'}</span>
                </button>
              </div>

              {location.latitude && (
                <p className="text-xs font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                  Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude?.toFixed(6)} (Acc: {location.accuracy_meters?.toFixed(1)}m)
                </p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <span className="block text-xs font-semibold text-slate-400">{t('manualLocation')}</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder={t('village')}
                  value={location.village || ''}
                  onChange={(e) => setLocation({ ...location, village: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
                <input
                  type="text"
                  placeholder={t('block')}
                  value={location.block || ''}
                  onChange={(e) => setLocation({ ...location, block: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
                <input
                  type="text"
                  placeholder={t('district')}
                  value={location.district || ''}
                  onChange={(e) => setLocation({ ...location, district: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Final Review & Submit */}
        {step === 8 && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-200 text-base">Review & Submit Report</h3>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <p><span className="text-slate-400">Target:</span> <span className="font-bold text-emerald-400">{selectedAnimalId ? 'Selected Animal' : 'Selected Herd'}</span></p>
              <p><span className="text-slate-400">Report Type:</span> <span className="font-bold capitalize">{reportType}</span></p>
              <p><span className="text-slate-400">Symptoms:</span> <span className="font-semibold text-slate-200">{selectedSymptoms.join(', ') || 'None selected'}</span></p>
              <p><span className="text-slate-400">Severity:</span> <span className="font-bold uppercase text-amber-400">{severity}</span></p>
              <p><span className="text-slate-400">Photo Attached:</span> {photoFile ? photoFile.name : 'No photo'}</p>
            </div>
          </div>
        )}

        {/* Step Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 8 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow flex items-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? t('loading') : t('submitReport')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
