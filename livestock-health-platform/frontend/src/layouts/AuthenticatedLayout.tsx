import React from 'react';
import { AuthenticatedNavbar } from '../components/AuthenticatedNavbar';
import { FarmerProvider } from '../context/FarmerContext';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  bgImage?: string;
  bgOverlay?: string;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ 
  children, 
  bgImage, 
  bgOverlay = 'bg-slate-950/95' 
}) => {
  return (
    <FarmerProvider>
      <div 
        className="min-h-screen flex flex-col bg-neutral-dark text-slate-100 antialiased selection:bg-forest-500 selection:text-white bg-cover bg-center bg-fixed relative"
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
      >
        <div className={`absolute inset-0 ${bgOverlay} z-0`}></div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <AuthenticatedNavbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {children}
          </main>
          <footer className="border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm py-4 text-center text-xs text-slate-400 mt-auto">
            <p className="font-medium">Livestock Sentinel • AI-Enabled Livestock Health Surveillance • SIH 2026</p>
          </footer>
        </div>
      </div>
    </FarmerProvider>
  );
};
