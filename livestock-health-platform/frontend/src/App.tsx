import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { RoleGuard } from './auth/RoleGuard';

// Layouts & Base Pages
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { RoleLogin } from './pages/RoleLogin';
import { RegisterFarmer } from './pages/RegisterFarmer';
import { RegisterVet } from './pages/RegisterVet';
import { HealthPage } from './pages/HealthPage';
import { ArchitecturePage } from './pages/ArchitecturePage';

// Portals
import { FarmerPortal } from './pages/FarmerPortal';
import { VetPortal } from './pages/VetPortal';
import { GovernmentPortal } from './pages/GovernmentPortal';
import { WorkflowPage } from './pages/WorkflowPage';
import { ProfilePage } from './pages/ProfilePage';

// Demo
import { IvrDemoPage } from './pages/demo/IvrDemoPage';
import { CctvPrototypePage } from './pages/CctvPrototypePage';

// Farmer Sub-pages
import { FarmerAnimalsPage } from './pages/farmer/FarmerAnimalsPage';
import { AnimalRegistrationPage } from './pages/farmer/AnimalRegistrationPage';
import { AnimalProfilePage } from './pages/farmer/AnimalProfilePage';
import { HealthReportFormPage } from './pages/farmer/HealthReportFormPage';
import { MortalityReportFormPage } from './pages/farmer/MortalityReportFormPage';
import { FarmerCasesPage } from './pages/farmer/FarmerCasesPage';
import { CaseDetailPage } from './pages/farmer/CaseDetailPage';
import { VaccinationPage } from './pages/farmer/VaccinationPage';
import { TreatmentPage } from './pages/farmer/TreatmentPage';
import { SyncDashboardPage } from './pages/farmer/SyncDashboardPage';

// Vet Sub-pages
import { VetCasesPage } from './pages/vet/VetCasesPage';
import { VetCaseDetailPage } from './pages/vet/VetCaseDetailPage';
import { VetAnimalSearchPage } from './pages/vet/VetAnimalSearchPage';

// Government Sub-pages
import { GovCasesPage } from './pages/government/GovCasesPage';
import { GovCaseDetailPage } from './pages/government/GovCaseDetailPage';
import { GovMortalityPage } from './pages/government/GovMortalityPage';
import { GovVaccinationPage } from './pages/government/GovVaccinationPage';
import { GovLocationsPage } from './pages/government/GovLocationsPage';

// Root Redirect
const RootRedirect: React.FC = () => {
  const { session, role, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (role === 'farmer') return <Navigate to="/farmer" replace />;
  if (role === 'veterinary_officer') return <Navigate to="/vet" replace />;
  if (role === 'government_official') return <Navigate to="/government" replace />;
  return <Navigate to="/login" replace />;
};

const FarmerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <RoleGuard allowedRoles={['farmer']}>
      <AuthenticatedLayout bgImage="/assets/backgrounds/farmer_bg.jpg" bgOverlay="bg-slate-950/85">
        {children}
      </AuthenticatedLayout>
    </RoleGuard>
  </ProtectedRoute>
);

const VetLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <RoleGuard allowedRoles={['veterinary_officer']}>
      <AuthenticatedLayout bgImage="/assets/backgrounds/vet_bg.jpg" bgOverlay="bg-slate-950/90">
        {children}
      </AuthenticatedLayout>
    </RoleGuard>
  </ProtectedRoute>
);

const GovLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <RoleGuard allowedRoles={['government_official']}>
      <AuthenticatedLayout bgImage="/assets/backgrounds/gov_bg.jpg" bgOverlay="bg-slate-950/85">
        {children}
      </AuthenticatedLayout>
    </RoleGuard>
  </ProtectedRoute>
);

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Root & Login */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/:role" element={<RoleLogin />} />
      <Route path="/register/farmer" element={<RegisterFarmer />} />
      <Route path="/register/vet" element={<RegisterVet />} />

      {/* System Monitoring & Demo */}
      <Route path="/health" element={<MainLayout bgImage="/assets/backgrounds/guardian_bg.jpg" bgOverlay="bg-slate-950/90"><HealthPage /></MainLayout>} />
      <Route path="/architecture" element={<MainLayout bgImage="/assets/backgrounds/guardian_bg.jpg" bgOverlay="bg-slate-950/90"><ArchitecturePage /></MainLayout>} />
      <Route path="/ivr-demo" element={<IvrDemoPage />} />
      <Route path="/cctv" element={<MainLayout bgImage="/assets/backgrounds/guardian_bg.jpg" bgOverlay="bg-slate-950/90"><CctvPrototypePage /></MainLayout>} />

      {/* ─────────── FARMER ROUTES ─────────── */}
      <Route path="/farmer" element={<FarmerLayout><FarmerPortal /></FarmerLayout>} />
      <Route path="/farmer/animals" element={<FarmerLayout><FarmerAnimalsPage /></FarmerLayout>} />
      <Route path="/farmer/animals/new" element={<FarmerLayout><AnimalRegistrationPage /></FarmerLayout>} />
      <Route path="/farmer/animals/:id" element={<FarmerLayout><AnimalProfilePage /></FarmerLayout>} />
      <Route path="/farmer/report" element={<FarmerLayout><HealthReportFormPage /></FarmerLayout>} />
      <Route path="/farmer/mortality" element={<FarmerLayout><MortalityReportFormPage /></FarmerLayout>} />
      <Route path="/farmer/vaccination" element={<FarmerLayout><VaccinationPage /></FarmerLayout>} />
      <Route path="/farmer/treatments" element={<FarmerLayout><TreatmentPage /></FarmerLayout>} />
      <Route path="/farmer/cases" element={<FarmerLayout><FarmerCasesPage /></FarmerLayout>} />
      <Route path="/farmer/cases/:caseId" element={<FarmerLayout><CaseDetailPage /></FarmerLayout>} />
      <Route path="/farmer/sync" element={<FarmerLayout><SyncDashboardPage /></FarmerLayout>} />

      {/* ─────────── VET ROUTES ─────────── */}
      <Route path="/vet" element={<VetLayout><VetPortal /></VetLayout>} />
      <Route path="/vet/cases" element={<VetLayout><VetCasesPage /></VetLayout>} />
      <Route path="/vet/cases/:caseId" element={<VetLayout><VetCaseDetailPage /></VetLayout>} />
      <Route path="/vet/animals" element={<VetLayout><VetAnimalSearchPage /></VetLayout>} />

      {/* ─────────── GOVERNMENT ROUTES ─────────── */}
      <Route path="/government" element={<GovLayout><GovernmentPortal /></GovLayout>} />
      <Route path="/government/cases" element={<GovLayout><GovCasesPage /></GovLayout>} />
      <Route path="/government/cases/:caseId" element={<GovLayout><GovCaseDetailPage /></GovLayout>} />
      <Route path="/government/mortality" element={<GovLayout><GovMortalityPage /></GovLayout>} />
      <Route path="/government/vaccination" element={<GovLayout><GovVaccinationPage /></GovLayout>} />
      <Route path="/government/locations" element={<GovLayout><GovLocationsPage /></GovLayout>} />

      {/* ─────────── SHARED ROUTES ─────────── */}
      <Route path="/workflow" element={<ProtectedRoute><AuthenticatedLayout><WorkflowPage /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AuthenticatedLayout><ProfilePage /></AuthenticatedLayout></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
