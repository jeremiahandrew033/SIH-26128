// useOnlineStatus.ts - Hook for tracking network status & simulated offline toggle

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/env';

const SIMULATED_OFFLINE_KEY = 'demo_simulated_offline';

export function useOnlineStatus() {
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(navigator.onLine);
  const [isBackendReachable, setIsBackendReachable] = useState<boolean>(true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
  });

  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Backend reachability ping
  useEffect(() => {
    if (!isBrowserOnline || isSimulatedOffline) {
      setIsBackendReachable(false);
      return;
    }

    let isMounted = true;
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', cache: 'no-store' });
        if (isMounted) setIsBackendReachable(res.ok);
      } catch (_) {
        if (isMounted) setIsBackendReachable(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isBrowserOnline, isSimulatedOffline]);

  const toggleSimulatedOffline = (simulate?: boolean) => {
    const nextVal = simulate !== undefined ? simulate : !isSimulatedOffline;
    setIsSimulatedOffline(nextVal);
    localStorage.setItem(SIMULATED_OFFLINE_KEY, String(nextVal));
    // Dispatch custom event for immediate UI updates
    window.dispatchEvent(new Event('simulated-offline-changed'));
  };

  useEffect(() => {
    const handleSimChange = () => {
      setIsSimulatedOffline(localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true');
    };
    window.addEventListener('simulated-offline-changed', handleSimChange);
    return () => window.removeEventListener('simulated-offline-changed', handleSimChange);
  }, []);

  const isEffectiveOnline = isBrowserOnline && isBackendReachable && !isSimulatedOffline;

  return {
    isBrowserOnline,
    isBackendReachable,
    isSimulatedOffline,
    isEffectiveOnline,
    toggleSimulatedOffline
  };
}
