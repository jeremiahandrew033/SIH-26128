import React, { useState, useEffect, useRef } from 'react';
import { Camera, ExternalLink, RefreshCw, Wifi, WifiOff, AlertTriangle, Monitor } from 'lucide-react';

const STREAMLIT_URL = 'http://localhost:8501';

export const CctvPrototypePage: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const checkStatus = async () => {
    setStatus('checking');
    setIframeLoaded(false);
    setIframeError(false);
    try {
      await fetch(STREAMLIT_URL, { mode: 'no-cors', cache: 'no-store' });
      // no-cors will always return opaque response if server is up
      setStatus('online');
    } catch {
      setStatus('offline');
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIframeError(false);
    setStatus('online');
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  const refresh = () => {
    checkStatus();
    if (iframeRef.current) {
      iframeRef.current.src = STREAMLIT_URL;
    }
  };

  return (
    <div className="p-4 h-[calc(100vh-5rem)] flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30">
            <Camera className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">CCTV Livestock Monitoring</h1>
            <p className="text-xs text-slate-400">Guardian Camera · Real-time Herd Tracking · Phase 5 Preview</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            status === 'online'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : status === 'offline'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {status === 'online' ? (
              <><Wifi className="w-3 h-3" /> Engine Online</>
            ) : status === 'offline' ? (
              <><WifiOff className="w-3 h-3" /> Engine Offline</>
            ) : (
              <><RefreshCw className="w-3 h-3 animate-spin" /> Connecting...</>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={refresh}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Open in new tab */}
          <a
            href={STREAMLIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Full Screen
          </a>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden relative">

        {/* Offline state */}
        {status === 'offline' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/90 gap-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <WifiOff className="w-10 h-10 text-rose-400" />
            </div>
            <div className="text-center">
              <p className="text-slate-100 font-bold text-lg">CCTV Engine Offline</p>
              <p className="text-slate-400 text-sm mt-1 max-w-sm">
                The Streamlit ML backend is not running on <code className="text-amber-400">localhost:8501</code>.
              </p>
            </div>
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 text-xs font-mono text-slate-300 max-w-md">
              <p className="text-slate-500 mb-2"># Run this command to start it:</p>
              <p className="text-emerald-400">cd ml/guardian/cctv_prototype</p>
              <p className="text-emerald-400">streamlit run app.py --server.port 8501 \</p>
              <p className="text-emerald-400 pl-4">--server.enableCORS false \</p>
              <p className="text-emerald-400 pl-4">--server.enableXsrfProtection false</p>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Retry Connection
            </button>
          </div>
        )}

        {/* Iframe blocked / embedding issue fallback */}
        {status === 'online' && iframeLoaded && iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/90 gap-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
            </div>
            <div className="text-center">
              <p className="text-slate-100 font-bold text-lg">Cannot embed in this view</p>
              <p className="text-slate-400 text-sm mt-1">The browser blocked the embedded frame. Open it full screen instead.</p>
            </div>
            <a
              href={STREAMLIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors"
            >
              <Monitor className="w-4 h-4" /> Open CCTV App in New Tab
            </a>
          </div>
        )}

        {/* Loading spinner while iframe loads */}
        {status === 'online' && !iframeLoaded && !iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900 gap-3 pointer-events-none">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading CCTV engine...</p>
          </div>
        )}

        {/* The iframe */}
        {status !== 'offline' && (
          <iframe
            ref={iframeRef}
            src={STREAMLIT_URL}
            className="w-full h-full border-0"
            title="CCTV Streamlit Prototype"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="camera; microphone"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        )}
      </div>

      {/* Info footer */}
      <div className="flex items-center gap-4 flex-shrink-0 text-xs text-slate-500">
        <span>🐄 YOLOv11 · ByteTrack · Behaviour Analysis</span>
        <span>·</span>
        <span>Phase 5 — Guardian Camera Prototype</span>
        <span>·</span>
        <span>Animal profiles linked to Farmer Portal</span>
      </div>
    </div>
  );
};
