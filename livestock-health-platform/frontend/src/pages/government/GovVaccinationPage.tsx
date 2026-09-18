import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllVaccinations } from '../../services/api';
import { Vaccination } from '../../types';
import { ArrowLeft, Syringe, AlertTriangle } from 'lucide-react';

export const GovVaccinationPage: React.FC = () => {
  const navigate = useNavigate();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllVaccinations()
      .then(setVaccinations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Group by vaccine name
  const byVaccine = vaccinations.reduce<Record<string, Vaccination[]>>((acc, v) => {
    const key = v.vaccine_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <button onClick={() => navigate('/government')} className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Syringe className="w-5 h-5 text-purple-400" />
            <span>Vaccination Coverage</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Statewide immunization records grouped by vaccine</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 space-y-1">
          <p className="text-2xl font-extrabold text-purple-400">{loading ? '—' : vaccinations.length}</p>
          <p className="text-xs text-slate-400 font-semibold">Total Vaccination Records</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 space-y-1">
          <p className="text-2xl font-extrabold text-purple-400">{loading ? '—' : Object.keys(byVaccine).length}</p>
          <p className="text-xs text-slate-400 font-semibold">Distinct Vaccine Types</p>
        </div>
      </div>

      {loading && <div className="text-center py-12 text-slate-400 text-sm">Loading vaccination data...</div>}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
        </div>
      )}

      {!loading && !error && vaccinations.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Syringe className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-slate-200">No vaccination records on file</h3>
        </div>
      )}

      {!loading && !error && Object.keys(byVaccine).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase">Records by Vaccine</h3>
          {Object.entries(byVaccine).map(([vaccineName, records]) => (
            <div key={vaccineName} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Syringe className="w-4 h-4 text-purple-400" />
                  <h4 className="font-bold text-purple-400 text-sm">{vaccineName}</h4>
                </div>
                <span className="px-3 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-[10px] font-bold">
                  {records.length} dose{records.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                {records.map((v) => (
                  <div key={v.id} className="flex justify-between items-center py-1 border-b border-slate-800 last:border-0">
                    <span className="text-slate-300">
                      {v.animal_id ? `Animal: ${v.animal_id.slice(0, 8)}...` : 'Herd Record'}
                    </span>
                    <span className="text-slate-400">{v.vaccination_date}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
