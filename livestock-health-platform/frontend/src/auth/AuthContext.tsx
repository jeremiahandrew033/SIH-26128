import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, AuthSession, UserProfile, UserRole } from './AuthService';

interface AuthContextType {
  session: AuthSession | null;
  user: UserProfile | null;
  role: UserRole | null;
  authMode: 'REAL' | 'DEMO' | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, pass: string) => Promise<void>;
  loginDemo: (role: UserRole) => Promise<void>;
  registerFarmer: (data: Partial<UserProfile>) => Promise<void>;
  registerVet: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  updateLanguage: (lang: 'en' | 'te' | 'hi') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Restore session on launch
    const existing = AuthService.getSession();
    if (existing) {
      setSession(existing);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const sess = await AuthService.login(email, pass);
      setSession(sess);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const sess = await AuthService.loginDemo(role);
      setSession(sess);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the authentication service.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerFarmer = async (data: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const sess = await AuthService.registerFarmer(data);
      setSession(sess);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerVet = async (data: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const sess = await AuthService.registerVet(data);
      setSession(sess);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setSession(null);
  };

  const updateLanguage = (lang: 'en' | 'te' | 'hi') => {
    if (session) {
      const updatedUser = { ...session.user, preferred_language: lang };
      const updatedSess = { ...session, user: updatedUser };
      setSession(updatedSess);
      localStorage.setItem('livestock_auth_session', JSON.stringify(updatedSess));
    }
    localStorage.setItem('farmer_language', lang);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Checking secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        role: session?.user.role || null,
        authMode: session?.authMode || null,
        loading,
        error,
        login,
        loginDemo,
        registerFarmer,
        registerVet,
        logout,
        updateLanguage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
