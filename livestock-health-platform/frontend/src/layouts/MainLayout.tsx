import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  bgImage?: string;
  bgOverlay?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, bgImage, bgOverlay = 'bg-slate-950/95' }) => {
  return (
    <div 
      className="min-h-screen flex flex-col bg-slate-950 text-slate-100 bg-cover bg-center bg-fixed relative"
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
    >
      <div className={`absolute inset-0 ${bgOverlay} z-0`}></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
