import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { UserRole } from './AuthService';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    // Redirect to matching portal or login
    if (role === 'farmer') return <Navigate to="/farmer" replace />;
    if (role === 'veterinary_officer') return <Navigate to="/vet" replace />;
    if (role === 'government_official') return <Navigate to="/government" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
