import React, { useRef, useState } from 'react';
import {
  Video,
  AlertTriangle,
  Info,
  CheckCircle2,
  Eye,
  Activity,
  Tag,
  Zap,
  BellRing,
} from 'lucide-react';

const DEMO_VIDEO_SRC = '/videos/cctv-demo.mp4';

const DEMO_FEATURES = [
  { icon: Eye,           label: 'Livestock detection',               desc: 'YOLOv11 identifies individual animals in each frame' },
  { icon: Activity,      label: 'Multi-animal tracking',             desc: 'ByteTrack assigns persistent identities across frames' },
  { icon: Tag,           label: 'Tracking IDs across video frames',  desc: 'Each animal keeps the same ID throughout the clip' },
  { icon: AlertTriangle, label: 'Abnormal behaviour observation',    desc: 'Motion patterns flagged against healthy baselines' },
  { icon: BellRing,      label: 'Early health-risk alert generation', desc: 'Persistent anomalies trigger automated alert events' },
];

export const CctvDemoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError]   = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Section header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30">
            <Video className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">CCTV Monitoring</h2>
            <p className="text-xs text-slate-400 mt-0.5">AI Computer Vision · YOLOv11 · ByteTrack</p>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                        bg-violet-500/10 text-violet-300 border border-violet-500/30 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Recorded AI Demonstration
        </div>
      </div>

      {/* ── Description ────────────────────────────────────────────── */}
      <p className="text-sm text-slate-300 leading-relaxed -mt-1">
        Watch how the livestock monitoring system detects and tracks animals using computer
        vision and identifies potential health-risk behaviour.
      </p>

      {/* ── Video player ───────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 relative">

        {/* Missing-file / error placeholder */}
        {videoError && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-9 h-9 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-100 font-bold">Demo video not found</p>
              <p className="text-slate-400 text-sm mt-1">
                CCTV demonstration video will appear here once{' '}
                <code className="text-amber-300 bg-slate-800 px-1 rounded">
                  public/videos/cctv-demo.mp4
                </code>{' '}
                is placed in the project.
              </p>
            </div>
          </div>
        )}

        {/* Loading shimmer — shown until metadata fires or error */}
        {!videoError && !videoLoaded && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 px-6">
            <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 text-sm">Loading demonstration…</p>
          </div>
        )}

        {/* HTML5 video — always rendered so events fire; hidden via CSS until loaded */}
        <video
          ref={videoRef}
          src={DEMO_VIDEO_SRC}
          controls
          playsInline
          preload="metadata"
          onError={() => setVideoError(true)}
          onLoadedMetadata={() => setVideoLoaded(true)}
          aria-label="Recorded CCTV AI demonstration showing livestock detection and tracking"
          className="w-full max-h-[520px] bg-slate-950"
          style={{ display: videoLoaded && !videoError ? 'block' : 'none' }}
        >
          <p className="text-slate-400 p-4">
            Your browser does not support HTML5 video. Please update your browser to watch
            this demonstration.
          </p>
        </video>
      </div>

      {/* ── What this demonstration shows ──────────────────────────── */}
      <div className="card-base p-4 flex flex-col gap-3">
        <p className="section-title flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-violet-400" />
          What this demonstration shows
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DEMO_FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-500/25 shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}

          {/* Extra full-width note */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 sm:col-span-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All detections run at 15–30 FPS on a local GPU. The system links animal
              tracking IDs back to registered animal profiles in the Farmer Portal.
            </p>
          </div>
        </div>
      </div>

      {/* ── Transparency note ──────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl
                      bg-blue-500/5 border border-blue-500/20">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300 leading-relaxed">
          <span className="font-semibold">Transparency note — </span>
          This is a recorded demonstration of the AI CCTV prototype. Live camera processing
          is available in the separate computer-vision prototype running locally via Streamlit.
        </p>
      </div>

    </div>
  );
};
