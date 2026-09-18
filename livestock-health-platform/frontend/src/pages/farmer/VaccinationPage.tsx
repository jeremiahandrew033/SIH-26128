import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { useFarmer } from '../../context/FarmerContext';
import { fetchFarmerAnimals, fetchAllVaccinations, createVaccination } from '../../services/api';
import { Animal, Vaccination } from '../../types';
import { ArrowLeft, Syringe, Plus, Calendar, AlertTriangle } from 'lucide-react';

export const VaccinationPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activeFarmer } = useFarmer();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [vaccineName, setVaccineName] = useState<string>('');
  const [vaccineDate, setVaccineDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!activeFarmer) return;
    setLoading(true);
    Promise.all([
      fetchFarmerAnimals(activeFarmer.id),
      fetchAllVaccinations().catch(() => [])
    ])
      .then(([aList, vList]) => {
        setAnimals(aList);
        const farmerAnimalIds = new Set(aList.map((a) => a.id));
        setVaccinations(vList.filter((v) => v.farmer_id === activeFarmer.id || (v.animal_id && farmerAnimalIds.has(v.animal_id))));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeFarmer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarmer || !vaccineName) return;
    setSubmitting(true);
    try {
      const newV = await createVaccination({
        farmer_id: activeFarmer.id,
        animal_id: selectedAnimalId || undefined,
        vaccine_name: vaccineName,
        vaccination_date: vaccineDate,
        batch_number: batchNumber || undefined,
        provider: provider || undefined,
        notes: notes || undefined
      });
      setVaccinations((prev) => [newV, ...prev]);
      setShowModal(false);
      setVaccineName('');
      setBatchNumber('');
      setProvider('');
      setNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit vaccination');
    } finally {
      setSubmitting(false);
    }
  };

  const getAnimalCode = (animalId?: string) => {
    if (!animalId) return 'Herd Record';
    const match = animals.find((a) => a.id === animalId);
    return match ? `${match.animal_code} (${match.species})` : 'Animal';
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/farmer')}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
              <Syringe className="w-5 h-5 text-blue-400" />
              <span>{t('vaccination')}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Immunization records for {activeFarmer?.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Record Vaccination</span>
        </button>
      </div>

      {loading && <div className="text-center py-12 text-slate-400 text-sm">{t('loading')}</div>}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && vaccinations.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Syringe className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-slate-200 text-base">No vaccination records found</h3>
          <p className="text-xs text-slate-400">Log immunizations administered to your livestock.</p>
        </div>
      )}

      {!loading && !error && vaccinations.length > 0 && (
        <div className="space-y-3">
          {vaccinations.map((v) => (
            <div key={v.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex justify-between items-center text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-blue-400 text-sm">{v.vaccine_name}</span>
                  {v.batch_number && (
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded font-mono text-[10px]">
                      Batch: {v.batch_number}
                    </span>
                  )}
                </div>
                <p className="text-slate-300 font-medium">Target: {getAnimalCode(v.animal_id)}</p>
                {v.provider && <p className="text-slate-400">Administered by: {v.provider}</p>}
                {v.notes && <p className="text-slate-400 italic">Notes: {v.notes}</p>}
              </div>
              <div className="text-right text-slate-400 space-y-1">
                <span className="flex items-center space-x-1 font-semibold text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{v.vaccination_date}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Syringe className="w-5 h-5 text-blue-400" />
              <span>Record Vaccination</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Select Animal (Optional)</label>
                <select
                  value={selectedAnimalId}
                  onChange={(e) => setSelectedAnimalId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Entire Herd / General</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.animal_code} - {a.species} ({a.breed || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Vaccine Name *</label>
                <input
                  type="text"
                  required
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  placeholder="e.g. FMD Vaccine / Brucellosis"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Vaccination Date *</label>
                <input
                  type="date"
                  required
                  value={vaccineDate}
                  onChange={(e) => setVaccineDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. BATCH-2026-X"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Provider / Vet Name</label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="e.g. Dr. Anita Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
