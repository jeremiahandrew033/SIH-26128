import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { useFarmer } from '../../context/FarmerContext';
import { fetchFarmerAnimals, fetchFarmerHerds, createMortalityReport, uploadCaseAttachment } from '../../services/api';
import { offlineStore } from '../../offline/OfflineStore';
import { SyncQueue } from '../../offline/SyncQueue';
import { useOnlineStatus } from '../../offline/useOnlineStatus';
import { Animal, Herd, LocationPayload } from '../../types';
import { ArrowLeft, Skull, AlertCircle, Camera, Save } from 'lucide-react';

export const MortalityReportFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { activeFarmer } = useFarmer();
  const navigate = useNavigate();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [herds, setHerds] = useState<Herd[]>([]);

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [selectedHerdId, setSelectedHerdId] = useState<string>('');
  const [deathsCount, setDeathsCount] = useState<number>(1);
  const [suspectedCause, setSuspectedCause] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [location, setLocation] = useState<LocationPayload>({
    village: activeFarmer?.village || '',
    block: activeFarmer?.block || '',
    district: activeFarmer?.district || ''
  });

  const captureGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy_meters: pos.coords.accuracy
        }));
      });
    }
  };

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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarmer) return;

    if (!selectedAnimalId && !selectedHerdId) {
      setError('Please select an animal or herd.');
      return;
    }

    if (deathsCount <= 0) {
      setError('Number of deaths must be greater than 0.');
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
      number_of_deaths: deathsCount,
      suspected_cause: suspectedCause || undefined,
      description: description || undefined,
      location: (location.latitude || location.village) ? location : undefined,
    };

    const isOnline = navigator.onLine && localStorage.getItem('demo_simulated_offline') !== 'true';

    if (!isOnline) {
      try {
        const localId = `LOCAL-MORTALITY-${Date.now()}`;
        
        await offlineStore.saveRecord({
          id: localId,
          entity_type: 'mortality_report',
          payload,
          photo_blob: photoFile || null,
          photo_name: photoFile ? photoFile.name : undefined,
          created_at: new Date().toISOString(),
          sync_status: 'pending'
        });

        await SyncQueue.addOperation('mortality_report', payload, localId);

        alert("Mortality report saved offline. Case will sync automatically when connectivity returns.");
        navigate('/farmer/cases');
      } catch (err: any) {
        setError(err.message || 'Failed to save mortality report offline.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      const report = await createMortalityReport(payload);

      if (photoFile) {
        await uploadCaseAttachment(report.case_id, photoFile).catch((e) => {
          console.warn('Photo upload failed:', e);
        });
      }

      navigate(`/farmer/cases/${report.case_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit mortality report.');
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
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Skull className="w-5 h-5 text-rose-400" />
            <span>{t('reportMortality')}</span>
          </h2>
          <p className="text-xs text-slate-400">Record suspected livestock mortality case</p>
        </div>
      </div>

      {/* Mandatory Warning Banner Disclaimer */}
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start space-x-3 text-rose-300">
        <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          {t('mortalityDisclaimer')}
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        {/* Animal / Herd Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase text-slate-300">
            {t('selectAnimalOrHerd')} *
          </label>
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
            <select
              value={selectedHerdId}
              onChange={(e) => {
                setSelectedHerdId(e.target.value);
                setSelectedAnimalId('');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Or Select Herd --</option>
              {herds.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name || h.species} ({h.animal_count} count)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Number of Deaths */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase text-slate-300">
            {t('numberOfDeaths')} *
          </label>
          <input
            type="number"
            min={1}
            value={deathsCount}
            onChange={(e) => setDeathsCount(parseInt(e.target.value) || 1)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-rose-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Suspected Cause */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase text-slate-300">
            {t('suspectedCause')}
          </label>
          <input
            type="text"
            placeholder="e.g. Sudden weakness, Bloat, Unknown"
            value={suspectedCause}
            onChange={(e) => setSuspectedCause(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase text-slate-300">
            {t('description')}
          </label>
          <textarea
            rows={3}
            placeholder="Detailed circumstances, timeline, symptoms prior to death..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Location Section */}
        <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">{t('captureLocation')}</span>
            <button
              type="button"
              onClick={captureGps}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Capture GPS
            </button>
          </div>
          {location.latitude && (
            <p className="text-[10px] font-mono text-emerald-400">
              GPS: {location.latitude.toFixed(4)}, {location.longitude?.toFixed(4)}
            </p>
          )}
        </div>

        {/* Optional Photo Attachment */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-slate-300">
            {t('attachPhoto')} (Optional)
          </label>
          <div className="border border-dashed border-slate-800 rounded-xl p-4 bg-slate-950 text-center">
            {photoPreview ? (
              <div className="space-y-2">
                <img src={photoPreview} alt="Preview" className="max-h-36 mx-auto rounded-lg object-cover" />
                <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="text-xs text-rose-400 underline">
                  Remove Photo
                </button>
              </div>
            ) : (
              <label className="cursor-pointer inline-flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
                <Camera className="w-4 h-4" />
                <span>Upload Photo</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center space-x-3 pt-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? t('loading') : t('submitMortalityReport')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/farmer')}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};
