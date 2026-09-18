import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { fetchHealthReport, fetchMortalityReport, fetchAnimal, updateHealthReportStatus } from '../../services/api';
import { HealthReport, MortalityReport, Animal } from '../../types';
import { ArrowLeft, MapPin, Image as ImageIcon, Clock, Phone, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../config/env';
import { AIScreeningPanel } from '../../components/AIScreeningPanel';

export const VetCaseDetailPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [healthCase, setHealthCase] = useState<HealthReport | null>(null);
  const [mortalityCase, setMortalityCase] = useState<MortalityReport | null>(null);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

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
        const m = await fetchMortalityReport(caseId).catch(() => null);
        if (m) {
          setMortalityCase(m);
          if (m.animal_id) {
            const a = await fetchAnimal(m.animal_id).catch(() => null);
            setAnimal(a);
          }
        } else {
          setError(`Case '${caseId}' not found.`);
        }
      })
      .finally(() => setLoading(false));
  }, [caseId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!healthCase) return;
    setUpdating(true);
    setStatusMsg(null);
    try {
      const updated = await updateHealthReportStatus(healthCase.case_id, newStatus);
      setHealthCase(updated);
      setStatusMsg(`Status updated to ${newStatus.toUpperCase().replace('_', ' ')}`);
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400 text-sm">{t('loading')}</div>;

  if (error || (!healthCase && !mortalityCase)) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 text-rose-300 text-xs space-y-3">
        <p className="font-bold">{error || 'Case not found'}</p>
        <button onClick={() => navigate('/vet/cases')} className="px-3 py-1.5 bg-rose-500/20 text-rose-200 rounded-lg">
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
          onClick={() => navigate('/vet/cases')}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-mono text-blue-400 font-extrabold uppercase">Vet Triage — Case Details</span>
          <h2 className="text-xl font-bold text-slate-100 font-mono">{currentCase.case_id}</h2>
        </div>
      </div>

      {/* Status Update Feedback */}
      {statusMsg && (
        <div className={`border rounded-xl p-3 text-xs font-medium ${statusMsg.startsWith('Error') ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
          {statusMsg}
        </div>
      )}

      {/* Main Case Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        {/* Status Row */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">{t('caseId')}</span>
            <p className="text-xl font-bold font-mono text-blue-400">{currentCase.case_id}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold uppercase block">{t('status')}</span>
            <div className="flex flex-col items-end gap-1 mt-1">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-block">
                {currentCase.status.toUpperCase().replace('_', ' ')}
              </span>
              {currentCase.source === 'PHONE_IVR' && (
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-700/50 text-slate-300 border border-slate-600 inline-flex items-center gap-1">
                  <Phone className="w-3 h-3" /> PHONE REPORT
                </span>
              )}
              {currentCase.priority === 'HIGH' && (
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> HIGH PRIORITY
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Animal Details */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-400 font-semibold uppercase block">Animal / Species</span>
            <span className="font-bold text-slate-200">
              {animal ? `${animal.animal_code} (${animal.species})` : (currentCase.animal_id ? 'Loading...' : 'Herd / General')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase block">Farmer ID</span>
            <span className="font-bold text-slate-200 font-mono">{currentCase.farmer_id}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase block">Report Type</span>
            <span className="font-bold text-slate-200 capitalize">{(currentCase as any).report_type?.replace('_', ' ') || 'Mortality'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase block">Date Filed</span>
            <span className="font-bold text-slate-200">{new Date(currentCase.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Health Case Details */}
        {!isMortality && healthCase && (
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase block">{t('symptoms')}</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {healthCase.symptoms.length > 0 ? healthCase.symptoms.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-medium">{s}</span>
                )) : <span className="text-slate-500">No symptoms recorded</span>}
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
                <p className="text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 mt-1">{healthCase.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Mortality Details */}
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

        {/* Location Section */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
          <span className="font-bold text-slate-200 flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Location Captured</span>
          </span>
          {currentCase.location ? (
            <p className="text-slate-400">
              {currentCase.location.village || 'Village'}, {currentCase.location.block || 'Block'}, {currentCase.location.district || 'District'}
              {currentCase.location.latitude && ` • GPS (${currentCase.location.latitude.toFixed(4)}, ${currentCase.location.longitude?.toFixed(4)})`}
            </p>
          ) : (
            <p className="text-slate-500">Village location registered with farmer profile.</p>
          )}
        </div>

        {/* Attachments Section */}
        {currentCase.attachments && currentCase.attachments.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400 flex items-center space-x-1">
              <ImageIcon className="w-4 h-4 text-blue-400" />
              <span>Attached Photo Evidence</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCase.attachments.map((attUrl, idx) => (
                <a key={idx} href={attUrl.startsWith('/') ? `${API_BASE_URL}${attUrl}` : attUrl} target="_blank" rel="noopener noreferrer"
                  className="block bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group hover:border-blue-500 transition-colors">
                  <img src={attUrl.startsWith('/') ? `${API_BASE_URL}${attUrl}` : attUrl} alt={`Attachment ${idx + 1}`}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Phase 3 — AI Screening Panel (health cases only, shown to vet for review) */}
        {!isMortality && healthCase && (
          <div className="border-t border-slate-800 pt-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">AI Screening Result</p>
            <AIScreeningPanel
              ai_prediction={healthCase.ai_prediction}
              ai_confidence={healthCase.ai_confidence}
              ai_risk_level={healthCase.ai_risk_level}
              ai_model_version={healthCase.ai_model_version}
              ai_processed_at={healthCase.ai_processed_at}
            />
          </div>
        )}

        {/* Vet Status Actions — only on health cases */}
        {!isMortality && healthCase && (
          <div className="border-t border-slate-800 pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Triage Status Update</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {healthCase.status !== 'under_review' && (
                <button
                  onClick={() => handleStatusChange('under_review')}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Updating...' : '🔵 Mark Under Review'}
                </button>
              )}
              {healthCase.status !== 'closed' && (
                <button
                  onClick={() => handleStatusChange('closed')}
                  disabled={updating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Updating...' : '🟢 Close Case'}
                </button>
              )}
              {healthCase.status !== 'reported' && (
                <button
                  onClick={() => handleStatusChange('reported')}
                  disabled={updating}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-xl disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Updating...' : '🟡 Reopen'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
