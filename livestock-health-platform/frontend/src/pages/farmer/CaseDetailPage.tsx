import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { fetchHealthReport, fetchMortalityReport, fetchAnimal } from '../../services/api';
import { HealthReport, MortalityReport, Animal } from '../../types';
import { ArrowLeft, CheckCircle2, MapPin, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../../config/env';
import { AIScreeningPanel } from '../../components/AIScreeningPanel';

export const CaseDetailPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        if (data.animal_id) {
          const a = await fetchAnimal(data.animal_id).catch(() => null);
          setAnimal(a);
        }
      })
      .catch(async () => {
        // Try mortality report fetch
        const m = await fetchMortalityReport(caseId).catch(() => null);
        if (m) {
          setMortalityCase(m);
          if (m.animal_id) {
            const a = await fetchAnimal(m.animal_id).catch(() => null);
            setAnimal(a);
          }
        } else {
          setError(`Case ID '${caseId}' not found.`);
        }
      })
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">{t('loading')}</div>;
  }

  if (error || (!healthCase && !mortalityCase)) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 text-rose-300 text-xs space-y-3">
        <p className="font-bold">{error || 'Case not found'}</p>
        <button onClick={() => navigate('/farmer/cases')} className="px-3 py-1.5 bg-rose-500/20 text-rose-200 rounded-lg">
          Back to Cases
        </button>
      </div>
    );
  }

  const currentCase = healthCase || mortalityCase!;
  const isMortality = !!mortalityCase;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Header */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <button
          onClick={() => navigate('/farmer/cases')}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase">Case Details</span>
          <h2 className="text-xl font-bold text-slate-100 font-mono">{currentCase.case_id}</h2>
        </div>
      </div>

      {/* Success Confirmation Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-base">
          <CheckCircle2 className="w-5 h-5" />
          <span>{t('successTitle')}</span>
        </div>
        <p className="text-xs text-emerald-300/90 leading-relaxed">
          {t('successMessage')}
        </p>
      </div>

      {/* Main Case Summary Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">{t('caseId')}</span>
            <p className="text-xl font-bold font-mono text-emerald-400">{currentCase.case_id}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold uppercase block">{t('status')}</span>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-block mt-1">
              🟡 {currentCase.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Animal Details */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-400 font-semibold uppercase block">Animal / Species</span>
            <span className="font-bold text-slate-200">
              {animal ? `${animal.animal_code} (${animal.species})` : (currentCase.animal_id ? 'Animal Recorded' : 'Herd Record')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase block">Date & Time</span>
            <span className="font-bold text-slate-200">
              {new Date(currentCase.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Health Case Specifics */}
        {!isMortality && healthCase && (
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase block">{t('reportType')}</span>
              <span className="font-bold text-slate-200 capitalize">{healthCase.report_type.replace('_', ' ')}</span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold uppercase block">{t('symptoms')}</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {healthCase.symptoms.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-semibold uppercase block">{t('severity')}</span>
                <span className="font-bold uppercase text-amber-400">{healthCase.severity}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase block">Duration</span>
                <span className="font-bold text-slate-200">{healthCase.duration_text || 'N/A'}</span>
              </div>
            </div>


            {healthCase.description && (
              <div>
                <span className="text-slate-400 font-semibold uppercase block">{t('description')}</span>
                <p className="text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 mt-1">
                  {healthCase.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Mortality Case Specifics */}
        {isMortality && mortalityCase && (
          <div className="space-y-3 text-xs">
            <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-300">
              <span className="font-bold block">Deaths Count: {mortalityCase.number_of_deaths}</span>
              <p className="text-[10px] mt-1">{mortalityCase.disclaimer}</p>
            </div>
            {mortalityCase.suspected_cause && (
              <div>
                <span className="text-slate-400 font-semibold uppercase block">{t('suspectedCause')}</span>
                <span className="font-bold text-slate-200">{mortalityCase.suspected_cause}</span>
              </div>
            )}
          </div>
        )}

        {/* Geolocation Section */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
          <span className="font-bold text-slate-200 flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Location Captured</span>
          </span>
          {currentCase.location ? (
            <p className="text-slate-400">
              {currentCase.location.village || 'Kollur'}, {currentCase.location.block || 'Block'}, {currentCase.location.district || 'District'}
              {currentCase.location.latitude && ` • GPS (${currentCase.location.latitude.toFixed(4)}, ${currentCase.location.longitude?.toFixed(4)})`}
            </p>
          ) : (
            <p className="text-slate-500">Village location registered with profile.</p>
          )}
        </div>

        {/* Attachments Section */}
        {currentCase.attachments && currentCase.attachments.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400 flex items-center space-x-1">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Attached Photo</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCase.attachments.map((attUrl, idx) => (
                <a
                  key={idx}
                  href={attUrl.startsWith('/') ? `${API_BASE_URL}${attUrl}` : attUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group hover:border-emerald-500 transition-colors"
                >
                  <img
                    src={attUrl.startsWith('/') ? `${API_BASE_URL}${attUrl}` : attUrl}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phase 3 — AI Screening Panel (health cases only) */}
      {!isMortality && healthCase && (
        <AIScreeningPanel
          ai_prediction={healthCase.ai_prediction}
          ai_confidence={healthCase.ai_confidence}
          ai_risk_level={healthCase.ai_risk_level}
          ai_model_version={healthCase.ai_model_version}
          ai_processed_at={healthCase.ai_processed_at}
        />
      )}
    </div>
  );
};
