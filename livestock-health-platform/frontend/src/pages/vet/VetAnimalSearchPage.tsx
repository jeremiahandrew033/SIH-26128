import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { fetchAllAnimals } from '../../services/api';
import { Animal } from '../../types';
import { ArrowLeft, Search, Tag, ChevronRight, AlertTriangle } from 'lucide-react';

export const VetAnimalSearchPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>('');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searched, setSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const results = await fetchAllAnimals(query || undefined);
      setAnimals(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <button
          onClick={() => navigate('/vet')}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-400" />
            <span>Animal Registry Search</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Search by animal code, species, breed, or farmer ID</p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter animal code, species, breed, or farmer ID..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </form>

      {loading && <div className="text-center py-12 text-slate-400 text-sm">{t('loading')}</div>}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && searched && animals.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Tag className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-slate-200 text-base">No animals found</h3>
          <p className="text-xs text-slate-400">
            {query ? `No animals matching "${query}".` : 'Enter a search term to find animals.'}
          </p>
        </div>
      )}

      {!loading && !searched && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Search className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-slate-200 text-base">Search the Animal Registry</h3>
          <p className="text-xs text-slate-400">
            Type an animal code (e.g. COW-0001), species, breed, or farmer ID to look up livestock records.
          </p>
        </div>
      )}

      {!loading && animals.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-medium">{animals.length} result{animals.length !== 1 ? 's' : ''} found</p>
          {animals.map((animal) => (
            <Link
              key={animal.id}
              to={`/farmer/animals/${animal.id}`}
              className="block bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 rounded-xl p-4 transition-all shadow-md group"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-blue-400 text-xs font-extrabold px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded">
                      {animal.animal_code}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 capitalize">{animal.species}</span>
                  </div>
                  <h4 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {animal.breed || animal.species} ({animal.sex || 'N/A'})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Age: {animal.approximate_age_years ? `${animal.approximate_age_years} yrs` : 'N/A'} •
                    Color: {animal.color || 'N/A'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">Farmer ID: {animal.farmer_id}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
