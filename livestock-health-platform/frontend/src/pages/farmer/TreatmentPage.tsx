import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { useFarmer } from '../../context/FarmerContext';
import { fetchFarmerAnimals, fetchAllTreatments, createTreatment } from '../../services/api';
import { Animal, Treatment } from '../../types';
import { ArrowLeft, Stethoscope, Plus, Calendar, AlertTriangle } from 'lucide-react';

export const TreatmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activeFarmer } = useFarmer();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [treatmentName, setTreatmentName] = useState<string>('');
  const [treatmentDate, setTreatmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dosage, setDosage] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!activeFarmer) return;
    setLoading(true);
    Promise.all([
      fetchFarmerAnimals(activeFarmer.id),
      fetchAllTreatments().catch(() => [])
    ])
      .then(([aList, tList]) => {
        setAnimals(aList);
        const farmerAnimalIds = new Set(aList.map((a) => a.id));
        setTreatments(tList.filter((tr) => tr.farmer_id === activeFarmer.id || (tr.animal_id && farmerAnimalIds.has(tr.animal_id))));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeFarmer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarmer || !treatmentName) return;
    setSubmitting(true);
    try {
      const newT = await createTreatment({
        farmer_id: activeFarmer.id,
        animal_id: selectedAnimalId || undefined,
        treatment_name: treatmentName,
        treatment_date: treatmentDate,
        dosage: dosage || undefined,
        provider: provider || undefined,
        notes: notes || undefined
      });
      setTreatments((prev) => [newT, ...prev]);
      setShowModal(false);
      setTreatmentName('');
      setDosage('');
      setProvider('');
      setNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit treatment record');
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
              <Stethoscope className="w-5 h-5 text-purple-400" />
              <span>{t('treatmentHistory')}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Medical treatment logs for {activeFarmer?.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-xl shadow transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Record Treatment</span>
        </button>
      </div>

      {loading && <div className="text-center py-12 text-slate-400 text-sm">{t('loading')}</div>}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && treatments.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-slate-200 text-base">No treatment records found</h3>
          <p className="text-xs text-slate-400">Log medications and prescriptions administered to your livestock.</p>
        </div>
      )}

      {!loading && !error && treatments.length > 0 && (
        <div className="space-y-3">
          {treatments.map((tr) => (
            <div key={tr.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex justify-between items-center text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-purple-400 text-sm">{tr.treatment_name}</span>
                  {tr.dosage && (
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded font-mono text-[10px]">
                      Dose: {tr.dosage}
                    </span>
                  )}
                </div>
                <p className="text-slate-300 font-medium">Target: {getAnimalCode(tr.animal_id)}</p>
                {tr.provider && <p className="text-slate-400">Prescribed/Administered by: {tr.provider}</p>}
                {tr.notes && <p className="text-slate-400 italic">Notes: {tr.notes}</p>}
              </div>
              <div className="text-right text-slate-400 space-y-1">
                <span className="flex items-center space-x-1 font-semibold text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>{tr.treatment_date}</span>
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
              <Stethoscope className="w-5 h-5 text-purple-400" />
              <span>Record Treatment</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Select Animal (Optional)</label>
                <select
                  value={selectedAnimalId}
                  onChange={(e) => setSelectedAnimalId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
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
                <label className="block font-medium text-slate-300 mb-1">Treatment / Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={treatmentName}
                  onChange={(e) => setTreatmentName(e.target.value)}
                  placeholder="e.g. Oxytetracycline 10%"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Treatment Date *</label>
                <input
                  type="date"
                  required
                  value={treatmentDate}
                  onChange={(e) => setTreatmentDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Dosage</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 10 ml IM daily"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Provider / Vet Name</label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="e.g. Dr. Anita Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl disabled:opacity-50"
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
