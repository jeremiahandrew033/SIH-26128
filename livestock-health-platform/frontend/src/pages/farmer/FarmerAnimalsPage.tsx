import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { useFarmer } from '../../context/FarmerContext';
import { fetchFarmerAnimals } from '../../services/api';
import { Animal } from '../../types';
import { Plus, Tag, ChevronRight, AlertCircle } from 'lucide-react';

export const FarmerAnimalsPage: React.FC = () => {
  const { t } = useTranslation();
  const { activeFarmer } = useFarmer();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');

  useEffect(() => {
    if (!activeFarmer) return;
    setLoading(true);
    fetchFarmerAnimals(activeFarmer.id)
      .then(setAnimals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeFarmer]);

  const filteredAnimals = selectedSpecies === 'all'
    ? animals
    : animals.filter((a) => a.species.toLowerCase() === selectedSpecies.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{t('myAnimals')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered livestock profiles for {activeFarmer?.name}
          </p>
        </div>
        <Link
          to="/farmer/animals/new"
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{t('registerNewAnimal')}</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
        {['all', 'Cattle', 'Buffalo', 'Goat', 'Sheep', 'Poultry'].map((sp) => (
          <button
            key={sp}
            onClick={() => setSelectedSpecies(sp)}
            className={`px-3 py-1.5 rounded-lg border transition-colors flex-shrink-0 ${
              selectedSpecies === sp
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {sp === 'all' ? 'All Species' : sp}
          </button>
        ))}
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-12 text-slate-400 text-sm">{t('loading')}</div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAnimals.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="p-4 bg-slate-800/80 rounded-full w-14 h-14 mx-auto flex items-center justify-center text-slate-400">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-base">No animals found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Click below to register your cattle, buffalo, goat, sheep, or poultry.
            </p>
          </div>
          <Link
            to="/farmer/animals/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white font-medium text-xs rounded-xl shadow"
          >
            <Plus className="w-4 h-4" />
            <span>{t('registerNewAnimal')}</span>
          </Link>
        </div>
      )}

      {/* Animal Cards List */}
      {!loading && !error && filteredAnimals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAnimals.map((animal) => (
            <Link
              key={animal.id}
              to={`/farmer/animals/${animal.id}`}
              className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all shadow-md flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-emerald-400 text-xs font-extrabold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                    {animal.animal_code}
                  </span>
                  <span className="text-xs font-semibold text-slate-300 capitalize">
                    {animal.species}
                  </span>
                </div>
                <h4 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {animal.breed || animal.species} ({animal.sex || 'N/A'})
                </h4>
                <p className="text-xs text-slate-400">
                  Age: {animal.approximate_age_years ? `${animal.approximate_age_years} yrs` : 'N/A'} • Color: {animal.color || 'N/A'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
