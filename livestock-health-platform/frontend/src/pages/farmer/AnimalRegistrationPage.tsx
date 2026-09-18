import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { useFarmer } from '../../context/FarmerContext';
import { createAnimal, fetchFarmerHerds } from '../../services/api';
import { offlineStore } from '../../offline/OfflineStore';
import { SyncQueue } from '../../offline/SyncQueue';
import { Herd } from '../../types';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const AnimalRegistrationPage: React.FC = () => {
  const { t } = useTranslation();
  const { activeFarmer } = useFarmer();
  const navigate = useNavigate();

  const [herds, setHerds] = useState<Herd[]>([]);
  const [species, setSpecies] = useState<string>('Cattle');
  const [breed, setBreed] = useState<string>('');
  const [sex, setSex] = useState<string>('Female');
  const [approxAge, setApproxAge] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [idNotes, setIdNotes] = useState<string>('');
  const [herdId, setHerdId] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeFarmer) return;
    fetchFarmerHerds(activeFarmer.id).then(setHerds).catch(() => {});
  }, [activeFarmer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarmer) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      farmer_id: activeFarmer.id,
      herd_id: herdId || undefined,
      species,
      breed: breed || undefined,
      sex,
      approximate_age_years: approxAge ? parseFloat(approxAge) : undefined,
      color: color || undefined,
      identification_notes: idNotes || undefined,
    };

    const isOnline = navigator.onLine && localStorage.getItem('demo_simulated_offline') !== 'true';

    if (!isOnline) {
      try {
        const localId = `LOCAL-${species.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;

        await offlineStore.saveRecord({
          id: localId,
          entity_type: 'animal',
          payload,
          created_at: new Date().toISOString(),
          sync_status: 'pending'
        });

        await SyncQueue.addOperation('animal', payload, localId);

        alert("Animal registration saved offline. Record will sync automatically when connectivity returns.");
        navigate('/farmer/animals');
      } catch (err: any) {
        setError(err.message || 'Failed to save animal record offline.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      await createAnimal(payload);

      navigate('/farmer/animals');
    } catch (err: any) {
      setError(err.message || 'Failed to register animal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <button
          onClick={() => navigate('/farmer/animals')}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100">{t('registerNewAnimal')}</h2>
          <p className="text-xs text-slate-400">
            Auto-generates unique animal tag code upon saving.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg">
        {/* Species Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-slate-300">
            {t('species')} *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Poultry'].map((sp) => (
              <button
                type="button"
                key={sp}
                onClick={() => setSpecies(sp)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  species === sp
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>

        {/* Breed & Sex */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-slate-300">
              {t('breed')}
            </label>
            <input
              type="text"
              placeholder="e.g. Gir, Murrah, Osmanabadi"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-slate-300">
              {t('sex')}
            </label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Female">{t('female')}</option>
              <option value="Male">{t('male')}</option>
            </select>
          </div>
        </div>

        {/* Age & Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-slate-300">
              {t('age')}
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 3.5"
              value={approxAge}
              onChange={(e) => setApproxAge(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-slate-300">
              {t('color')}
            </label>
            <input
              type="text"
              placeholder="e.g. Black & White, Reddish Brown"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Herd Selection */}
        {herds.length > 0 && (
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-slate-300">
              {t('selectHerd')}
            </label>
            <select
              value={herdId}
              onChange={(e) => setHerdId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- No Herd Selected --</option>
              {herds.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name || h.species} ({h.animal_count} animals)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Identification Notes */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase text-slate-300">
            {t('identificationNotes')}
          </label>
          <textarea
            rows={2}
            placeholder="Tag number, horn shape, ear notches, distinctive marks..."
            value={idNotes}
            onChange={(e) => setIdNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Form Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? t('loading') : t('submitAnimal')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/farmer/animals')}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};
