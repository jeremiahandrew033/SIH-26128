import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllHealthReports, fetchAllMortalityReports } from '../../services/api';
import { HealthReport, MortalityReport } from '../../types';
import { ArrowLeft, MapPin, AlertTriangle, Map } from 'lucide-react';

interface LocationSummary {
  village: string;
  block: string;
  district: string;
  latitude?: number;
  longitude?: number;
  reportCount: number;
}

export const GovLocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchAllHealthReports().catch(() => [] as HealthReport[]),
      fetchAllMortalityReports().catch(() => [] as MortalityReport[])
    ]).then(([healthReports, mortalityReports]) => {
      const allReports = [...healthReports, ...mortalityReports];
      const locationMap: Record<string, LocationSummary> = {};

      for (const r of allReports) {
        if (r.location) {
          const key = `${r.location.village || 'Unknown'}|${r.location.block || ''}|${r.location.district || ''}`;
          if (locationMap[key]) {
            locationMap[key].reportCount++;
          } else {
            locationMap[key] = {
              village: r.location.village || 'Unknown Village',
              block: r.location.block || 'N/A',
              district: r.location.district || 'N/A',
              latitude: r.location.latitude,
              longitude: r.location.longitude,
              reportCount: 1
            };
          }
        }
      }

      setLocations(Object.values(locationMap).sort((a, b) => b.reportCount - a.reportCount));
    })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <button onClick={() => navigate('/government')} className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span>Geographic Location Summary</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Villages and districts with reported livestock health events</p>
        </div>
      </div>

      {loading && <div className="text-center py-12 text-slate-400 text-sm">Loading geographic data...</div>}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
        </div>
      )}

      {!loading && !error && locations.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <MapPin className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-slate-200">No location data available</h3>
          <p className="text-xs text-slate-400">Location data is captured when farmers submit health reports with GPS or village info.</p>
        </div>
      )}

      {!loading && !error && locations.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">{locations.length} distinct location{locations.length !== 1 ? 's' : ''} on record</p>

          {/* Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-800/60 border-b border-slate-800">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-400 uppercase">Village</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-400 uppercase">Block</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-400 uppercase">District</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-400 uppercase">GPS</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-400 uppercase">Reports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {locations.map((loc, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-200">{loc.village}</td>
                    <td className="px-4 py-3 text-slate-400">{loc.block}</td>
                    <td className="px-4 py-3 text-slate-400">{loc.district}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      {loc.latitude ? `${loc.latitude.toFixed(3)}, ${loc.longitude?.toFixed(3)}` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold">
                        {loc.reportCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Phase 7 GIS Teaser */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-start space-x-4">
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 opacity-50">
          <Map className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-bold text-slate-400">GIS Intelligence Heatmap</h3>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-500 border border-slate-700 text-[10px] font-bold uppercase rounded">Planned for Phase 7</span>
          </div>
          <p className="text-xs text-slate-500">
            Interactive PostGIS spatial clustering and disease outbreak heatmap visualization will be available in Phase 7.
          </p>
        </div>
      </div>
    </div>
  );
};
