import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchHealthReport, fetchMortalityReport, fetchAnimal } from '../../services/api';
import { HealthReport, MortalityReport, Animal } from '../../types';
import { ArrowLeft, MapPin, Image as ImageIcon, Eye } from 'lucide-react';
import { API_BASE_URL } from '../../config/env';

export const GovCaseDetailPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [healthCase, setHealthCase] = useState<HealthReport | null>(null);
  const [mortalityCase, setMortalityCase] = useState<MortalityReport | null>(null);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;
    setLoading(true);
    fetchHealthReport(caseId)
      .then(async (data) => {
        setHealthCase(data);
        if (data.animal_id) { const a = await fetchAnimal(data.animal_id).catch(() => null); setAnimal(a); }
      })
      .catch(async () => {
        const m = await fetchMortalityReport(caseId).catch(() => null);
        if (m) { setMortalityCase(m); if (m.animal_id) { const a = await fetchAnimal(m.animal_id).catch(() => null); setAnimal(a); } }
        else setError(`Case '${caseId}' not found.`);
      })
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <div className="text-center py-12 text-slate-400 text-sm">Loading case data...</div>;
  if (error || (!healthCase && !mortalityCase)) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 text-rose-300 text-xs space-y-3">
        <p className="font-bold">{error || 'Case not found'}</p>
        <button onClick={() => navigate('/government/cases')} className="px-3 py-1.5 bg-rose-500/20 text-rose-200 rounded-lg">Back</button>
      </div>
    );
  }

  const currentCase = healthCase || mortalityCase!;
  const isMortality = !!mortalityCase;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <button onClick={() => navigate('/government/cases')} className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-mono text-purple-400 font-extrabold uppercase flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Government View — Read Only</span>
          </span>
          <h2 className="text-xl font-bold text-slate-100 font-mono">{currentCase.case_id}</h2>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Case ID</span>
            <p className="text-xl font-bold font-mono text-purple-400">{currentCase.case_id}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Status</span>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 inline-block mt-1">
              {currentCase.status.toUpperCase().replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div><span className="text-slate-400 font-semibold uppercase block">Animal</span>
            <span className="font-bold text-slate-200">{animal ? `${animal.animal_code} (${animal.species})` : 'Herd / General'}</span></div>
          <div><span className="text-slate-400 font-semibold uppercase block">Farmer ID</span>
            <span className="font-bold text-slate-200 font-mono">{currentCase.farmer_id}</span></div>
          <div><span className="text-slate-400 font-semibold uppercase block">Report Type</span>
            <span className="font-bold text-slate-200 capitalize">{(currentCase as any).report_type?.replace('_', ' ') || 'Mortality'}</span></div>
          <div><span className="text-slate-400 font-semibold uppercase block">Filed At</span>
            <span className="font-bold text-slate-200">{new Date(currentCase.created_at).toLocaleString()}</span></div>
        </div>

        {!isMortality && healthCase && (
          <div className="space-y-3 text-xs">
            <div><span className="text-slate-400 font-semibold uppercase block">Symptoms</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {healthCase.symptoms.length > 0 ? healthCase.symptoms.map((s) =>
                  <span key={s} className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">{s}</span>
                ) : <span className="text-slate-500">None recorded</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-400 font-semibold uppercase block">Severity</span>
                <span className="font-bold uppercase text-amber-400">{healthCase.severity}</span></div>
            </div>
          </div>
        )}

        {isMortality && mortalityCase && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-300 text-xs">
            <span className="font-bold">Deaths: {mortalityCase.number_of_deaths}</span>
            {mortalityCase.suspected_cause && <p className="mt-1">Suspected cause: {mortalityCase.suspected_cause}</p>}
          </div>
        )}

        {/* Location */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
          <span className="font-bold text-slate-200 flex items-center space-x-1.5"><MapPin className="w-4 h-4 text-purple-400" /><span>Location</span></span>
          {currentCase.location ? (
            <p className="text-slate-400">
              {currentCase.location.village}, {currentCase.location.block}, {currentCase.location.district}
              {currentCase.location.latitude && ` • GPS (${currentCase.location.latitude.toFixed(4)}, ${currentCase.location.longitude?.toFixed(4)})`}
            </p>
          ) : <p className="text-slate-500">No precise location captured.</p>}
        </div>

        {/* Attachments */}
        {currentCase.attachments && currentCase.attachments.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400 flex items-center space-x-1"><ImageIcon className="w-4 h-4 text-purple-400" /><span>Photo Evidence</span></span>
            <div className="grid grid-cols-2 gap-3">
              {currentCase.attachments.map((url, idx) => (
                <a key={idx} href={url.startsWith('/') ? `${API_BASE_URL}${url}` : url} target="_blank" rel="noopener noreferrer"
                  className="block bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500 transition-colors">
                  <img src={url.startsWith('/') ? `${API_BASE_URL}${url}` : url} alt={`Evidence ${idx + 1}`} className="w-full h-36 object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-xs text-slate-500">
          🔒 Government view is read-only. Case management is performed by veterinary officers.
        </div>
      </div>
    </div>
  );
};
