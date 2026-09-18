import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import {
  fetchAnimal,
  fetchAnimalVaccinations,
  fetchAnimalTreatments,
  fetchFarmerHealthReports,
  createVaccination,
  createTreatment
} from '../../services/api';
import { Animal, Vaccination, Treatment, HealthReport } from '../../types';
import { ArrowLeft, Syringe, Stethoscope, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const AnimalProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [healthReports, setHealthReports] = useState<HealthReport[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showVaccinationModal, setShowVaccinationModal] = useState<boolean>(false);
  const [vVaccineName, setVVaccineName] = useState<string>('');
  const [vDate, setVDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [vBatch, setVBatch] = useState<string>('');

  const [showTreatmentModal, setShowTreatmentModal] = useState<boolean>(false);
  const [tTreatmentName, setTTreatmentName] = useState<string>('');
  const [tDate, setTDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tDosage, setTDosage] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchAnimal(id)
      .then(async (data) => {
        setAnimal(data);
        const [vList, tList, hrList] = await Promise.all([
          fetchAnimalVaccinations(data.id).catch(() => []),
          fetchAnimalTreatments(data.id).catch(() => []),
          fetchFarmerHealthReports(data.farmer_id).catch(() => [])
        ]);
        setVaccinations(vList);
        setTreatments(tList);
        setHealthReports(hrList.filter((r) => r.animal_id === data.id));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal || !vVaccineName) return;
    setSubmitting(true);
    try {
      const newV = await createVaccination({
        animal_id: animal.id,
        vaccine_name: vVaccineName,
        vaccination_date: vDate,
        batch_number: vBatch || undefined
      });
      setVaccinations((prev) => [newV, ...prev]);
      setShowVaccinationModal(false);
      setVVaccineName('');
      setVBatch('');
    } catch (err: any) {
      alert(err.message || 'Failed to record vaccination');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal || !tTreatmentName) return;
    setSubmitting(true);
    try {
      const newT = await createTreatment({
        animal_id: animal.id,
        treatment_name: tTreatmentName,
        treatment_date: tDate,
        dosage: tDosage || undefined
      });
      setTreatments((prev) => [newT, ...prev]);
      setShowTreatmentModal(false);
      setTTreatmentName('');
      setTDosage('');
    } catch (err: any) {
      alert(err.message || 'Failed to record treatment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">{t('loading')}</div>;
  }

  if (error || !animal) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 text-rose-300 text-xs space-y-3">
        <p className="font-bold">{error || 'Animal not found'}</p>
        <button onClick={() => navigate('/farmer/animals')} className="px-3 py-1.5 bg-rose-500/20 text-rose-200 rounded-lg">
          Back to Animals
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/farmer/animals')}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-emerald-400 font-extrabold text-sm px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                {animal.animal_code}
              </span>
              <span className="text-xs font-semibold text-slate-300 capitalize">{animal.species}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-0.5">
              {animal.breed || animal.species} Profile
            </h2>
          </div>
        </div>

        <Link
          to="/farmer/report"
          className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-xl shadow transition-colors flex items-center space-x-1.5"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{t('reportSickAnimal')}</span>
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 uppercase text-[10px] font-semibold block">{t('species')}</span>
          <span className="font-bold text-slate-200 capitalize">{animal.species}</span>
        </div>
        <div>
          <span className="text-slate-400 uppercase text-[10px] font-semibold block">{t('breed')}</span>
          <span className="font-bold text-slate-200">{animal.breed || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-400 uppercase text-[10px] font-semibold block">{t('sex')}</span>
          <span className="font-bold text-slate-200">{animal.sex || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-400 uppercase text-[10px] font-semibold block">{t('age')}</span>
          <span className="font-bold text-slate-200">{animal.approximate_age_years ? `${animal.approximate_age_years} Yrs` : 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-400 uppercase text-[10px] font-semibold block">{t('color')}</span>
          <span className="font-bold text-slate-200">{animal.color || 'N/A'}</span>
        </div>
        <div className="col-span-2 sm:col-span-3">
          <span className="text-slate-400 uppercase text-[10px] font-semibold block">{t('identificationNotes')}</span>
          <span className="font-medium text-slate-300">{animal.identification_notes || 'No special notes'}</span>
        </div>
      </div>

      {/* Health Life Timeline */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Animal Health Lifecycle Timeline</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowVaccinationModal(true)}
              className="px-2.5 py-1 bg-blue-600/80 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center space-x-1"
            >
              <Syringe className="w-3.5 h-3.5" />
              <span>+ Vaccination</span>
            </button>
            <button
              onClick={() => setShowTreatmentModal(true)}
              className="px-2.5 py-1 bg-purple-600/80 hover:bg-purple-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center space-x-1"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>+ Treatment</span>
            </button>
          </div>
        </div>

        <div className="relative pl-6 border-l-2 border-slate-800 space-y-6 text-xs">
          {/* Registration */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0 p-1.5 bg-emerald-500 text-white rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-200">Registration</p>
              <p className="text-slate-400 mt-0.5">Code {animal.animal_code} registered in system on {new Date(animal.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Vaccination */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0 p-1.5 bg-blue-500 text-white rounded-full">
              <Syringe className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-200">Vaccination History ({vaccinations.length})</p>
              {vaccinations.length > 0 ? (
                <ul className="mt-1 space-y-1 text-slate-300">
                  {vaccinations.map((v) => (
                    <li key={v.id} className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                      <span className="font-semibold text-blue-400">{v.vaccine_name}</span> • {v.vaccination_date}
                      {v.batch_number && <span className="text-slate-400"> (Batch: {v.batch_number})</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 mt-0.5">No vaccinations recorded yet.</p>
              )}
            </div>
          </div>

          {/* Health Report */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0 p-1.5 bg-amber-500 text-white rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-200">Health Cases ({healthReports.length})</p>
              {healthReports.length > 0 ? (
                <ul className="mt-1 space-y-1.5">
                  {healthReports.map((hr) => (
                    <li key={hr.id}>
                      <Link
                        to={`/farmer/cases/${hr.case_id}`}
                        className="block bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-lg border border-slate-700 font-mono text-emerald-400"
                      >
                        {hr.case_id} • Status: {hr.status.toUpperCase()} ({hr.severity})
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 mt-0.5">No health cases filed for this animal.</p>
              )}
            </div>
          </div>

          {/* Treatment */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0 p-1.5 bg-purple-500 text-white rounded-full">
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-200">Treatment History ({treatments.length})</p>
              {treatments.length > 0 ? (
                <ul className="mt-1 space-y-1 text-slate-300">
                  {treatments.map((t) => (
                    <li key={t.id} className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                      <span className="font-semibold text-purple-400">{t.treatment_name}</span> • {t.treatment_date}
                      {t.dosage && <span className="text-slate-400"> (Dose: {t.dosage})</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 mt-0.5">No treatment records found.</p>
              )}
            </div>
          </div>

          {/* Follow-up */}
          <div className="relative opacity-60">
            <div className="absolute -left-[31px] top-0 p-1.5 bg-slate-700 text-slate-300 rounded-full">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-400">Follow-up Pipeline</p>
              <p className="text-slate-500 mt-0.5">Automated follow-up workflows planned for Phase 8.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Vaccination Modal */}
      {showVaccinationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Syringe className="w-5 h-5 text-blue-400" />
              <span>Record Vaccination</span>
            </h3>
            <form onSubmit={handleAddVaccination} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Vaccine Name *</label>
                <input
                  type="text"
                  required
                  value={vVaccineName}
                  onChange={(e) => setVVaccineName(e.target.value)}
                  placeholder="e.g. FMD Vaccine"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Vaccination Date *</label>
                <input
                  type="date"
                  required
                  value={vDate}
                  onChange={(e) => setVDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={vBatch}
                  onChange={(e) => setVBatch(e.target.value)}
                  placeholder="e.g. BATCH-2026-X"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVaccinationModal(false)}
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

      {/* Add Treatment Modal */}
      {showTreatmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-purple-400" />
              <span>Record Treatment</span>
            </h3>
            <form onSubmit={handleAddTreatment} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Treatment / Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={tTreatmentName}
                  onChange={(e) => setTTreatmentName(e.target.value)}
                  placeholder="e.g. Oxytetracycline 10%"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Treatment Date *</label>
                <input
                  type="date"
                  required
                  value={tDate}
                  onChange={(e) => setTDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Dosage</label>
                <input
                  type="text"
                  value={tDosage}
                  onChange={(e) => setTDosage(e.target.value)}
                  placeholder="e.g. 10 ml IM daily"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTreatmentModal(false)}
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
