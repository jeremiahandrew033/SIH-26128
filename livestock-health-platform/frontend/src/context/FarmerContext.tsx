import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Farmer } from '../types';
import { fetchFarmer, createFarmer } from '../services/api';
import { useAuth } from '../auth/AuthContext';

interface FarmerContextType {
  farmers: Farmer[];
  activeFarmer: Farmer | null;
  loading: boolean;
  error: string | null;
  selectFarmer: (farmerId: string) => void;
  registerFarmer: (data: Partial<Farmer>) => Promise<Farmer>;
  reloadFarmers: () => Promise<void>;
}

const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

export const FarmerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [activeFarmer, setActiveFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reloadFarmers = useCallback(async () => {
    // If not a farmer or not logged in, just clear state
    if (!user || role !== 'farmer') {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Instead of listing ALL farmers, we just fetch our own farmer profile
      const data = await fetchFarmer(user.id);
      setFarmers([data]);
      setActiveFarmer(data);
    } catch (err: any) {
      // If we are logged in but our farmer profile isn't found (maybe registration pending)
      setError(err.message || 'Failed to load farmer profile');
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    reloadFarmers();
  }, [reloadFarmers]);

  const selectFarmer = (farmerId: string) => {
    const found = farmers.find((f) => f.id === farmerId);
    if (found) {
      setActiveFarmer(found);
    }
  };

  const registerFarmer = async (data: Partial<Farmer>): Promise<Farmer> => {
    const newFarmer = await createFarmer(data);
    await reloadFarmers();
    return newFarmer;
  };

  return (
    <FarmerContext.Provider
      value={{
        farmers,
        activeFarmer,
        loading,
        error,
        selectFarmer,
        registerFarmer,
        reloadFarmers
      }}
    >
      {children}
    </FarmerContext.Provider>
  );
};

export const useFarmer = () => {
  const context = useContext(FarmerContext);
  if (!context) {
    throw new Error('useFarmer must be used within a FarmerProvider');
  }
  return context;
};
