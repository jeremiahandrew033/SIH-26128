import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-auto text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div>
          <p className="font-medium text-slate-300">
            AI-Enabled Livestock Health, Disease Surveillance & Management Platform
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Phase 0 Foundation Prototype | Smart India Hackathon (SIH) Ready Architecture
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs text-slate-500">
          <span>Backend: FastAPI</span>
          <span>•</span>
          <span>Frontend: React + Vite</span>
          <span>•</span>
          <span>Phase: 0</span>
        </div>
      </div>
    </footer>
  );
};
