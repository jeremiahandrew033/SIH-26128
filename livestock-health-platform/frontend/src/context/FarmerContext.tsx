import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Farmer } from '../types';
import { fetchFarmers, createFarmer } from '../services/api';

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
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [activeFarmer, setActiveFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reloadFarmers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFarmers();
      setFarmers(data);
      if (data.length > 0) {
        const savedId = localStorage.getItem('active_farmer_id');
        // Match either saved ID or default demo farmer ID (Ravi Kumar: f1111111-1111-1111-1111-111111111111)
        const found = data.find((f) => f.id === savedId) || data.find((f) => f.id === 'f1111111-1111-1111-1111-111111111111') || data[0];
        setActiveFarmer(found);
        localStorage.setItem('active_farmer_id', found.id);
      } else {
        const defaultFarmer = await createFarmer({
          id: 'f1111111-1111-1111-1111-111111111111',
          name: 'Ravi Kumar',
          phone: '+919876543210',
          preferred_language: 'en',
          village: 'Rampur',
          block: 'Amberpet',
          district: 'Hyderabad'
        });
        setFarmers([defaultFarmer]);
        setActiveFarmer(defaultFarmer);
        localStorage.setItem('active_farmer_id', defaultFarmer.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load farmers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadFarmers();
  }, [reloadFarmers]);

  const selectFarmer = (farmerId: string) => {
    const found = farmers.find((f) => f.id === farmerId);
    if (found) {
      setActiveFarmer(found);
      localStorage.setItem('active_farmer_id', found.id);
    }
  };

  const registerFarmer = async (data: Partial<Farmer>): Promise<Farmer> => {
    const newFarmer = await createFarmer(data);
    await reloadFarmers();
    setActiveFarmer(newFarmer);
    localStorage.setItem('active_farmer_id', newFarmer.id);
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
