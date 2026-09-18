import { useState, useEffect, useCallback } from 'react';
import { fetchHealth, fetchSystemInfo } from '../services/api';
import { SystemStatusState } from '../types';

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatusState>({
    backendConnected: false,
    apiStatus: 'UNKNOWN',
    environment: 'development',
    phase: 'Phase 0',
    serviceName: 'livestock-health-platform-api',
    systemName: 'AI-Enabled Livestock Health, Disease Surveillance & Management Platform',
    version: '0.1.0',
    loading: true,
    error: null,
    lastChecked: null,
  });

  const checkStatus = useCallback(async () => {
    setStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [healthRes, infoRes] = await Promise.all([
        fetchHealth(),
        fetchSystemInfo(),
      ]);

      setStatus({
        backendConnected: true,
        apiStatus: healthRes.status.toUpperCase(),
        environment: infoRes.environment,
        phase: infoRes.phase,
        serviceName: healthRes.service,
        systemName: infoRes.name,
        version: infoRes.version,
        loading: false,
        error: null,
        lastChecked: new Date(),
      });
    } catch (err: any) {
      setStatus((prev) => ({
        ...prev,
        backendConnected: false,
        apiStatus: 'ERROR',
        loading: false,
        error: err.message || 'Backend unavailable. Make sure the FastAPI server is running on port 8000.',
        lastChecked: new Date(),
      }));
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return { ...status, refreshStatus: checkStatus };
}
