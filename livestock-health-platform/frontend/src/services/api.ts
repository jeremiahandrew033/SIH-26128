import { API_BASE_URL } from '../config/env';
import {
  HealthResponse,
  SystemInfoResponse,
  Farmer,
  Herd,
  Animal,
  HealthReport,
  MortalityReport,
  Vaccination,
  Treatment
} from '../types';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {})
      }
    });

    if (!response.ok) {
      let detail = `Request failed with status ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) detail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      } catch (_) {}
      throw new ApiError(detail, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Backend unavailable. Make sure the FastAPI server is running on port 8000.');
  }
}

// Base System
export const fetchHealth = () => request<HealthResponse>(`${API_BASE_URL}/health`);
export const fetchSystemInfo = () => request<SystemInfoResponse>(`${API_BASE_URL}/api/v1/system/info`);

// Farmers
export const fetchFarmers = () => request<Farmer[]>(`${API_BASE_URL}/api/v1/farmers`);
export const fetchFarmer = (id: string) => request<Farmer>(`${API_BASE_URL}/api/v1/farmers/${id}`);
export const createFarmer = (payload: Partial<Farmer>) => request<Farmer>(`${API_BASE_URL}/api/v1/farmers`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

// Herds
export const fetchFarmerHerds = (farmerId: string) => request<Herd[]>(`${API_BASE_URL}/api/v1/farmers/${farmerId}/herds`);
export const createHerd = (payload: Partial<Herd>) => request<Herd>(`${API_BASE_URL}/api/v1/herds`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

// Animals
export const fetchFarmerAnimals = (farmerId: string) => request<Animal[]>(`${API_BASE_URL}/api/v1/farmers/${farmerId}/animals`);
export const fetchAllAnimals = (query?: string) => request<Animal[]>(`${API_BASE_URL}/api/v1/animals${query ? `?query=${encodeURIComponent(query)}` : ''}`);
export const fetchAnimal = (id: string) => request<Animal>(`${API_BASE_URL}/api/v1/animals/${id}`);
export const createAnimal = (payload: Partial<Animal>) => request<Animal>(`${API_BASE_URL}/api/v1/animals`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

// Health Reports
export const createHealthReport = (payload: any) => request<HealthReport>(`${API_BASE_URL}/api/v1/health-reports`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
export const fetchHealthReport = (caseId: string) => request<HealthReport>(`${API_BASE_URL}/api/v1/health-reports/${caseId}`);
export const fetchFarmerHealthReports = (farmerId: string) => request<HealthReport[]>(`${API_BASE_URL}/api/v1/farmers/${farmerId}/health-reports`);
export const fetchAllHealthReports = () => request<HealthReport[]>(`${API_BASE_URL}/api/v1/health-reports`);
export const updateHealthReportStatus = (caseId: string, status: string) => request<HealthReport>(`${API_BASE_URL}/api/v1/health-reports/${caseId}/status?status=${status}`, {
  method: 'PATCH'
});

// Mortality Reports
export const createMortalityReport = (payload: any) => request<MortalityReport>(`${API_BASE_URL}/api/v1/mortality-reports`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
export const fetchMortalityReport = (caseId: string) => request<MortalityReport>(`${API_BASE_URL}/api/v1/mortality-reports/${caseId}`);
export const fetchAllMortalityReports = () => request<MortalityReport[]>(`${API_BASE_URL}/api/v1/mortality-reports`);

// Vaccinations & Treatments
export const createVaccination = (payload: any) => request<Vaccination>(`${API_BASE_URL}/api/v1/vaccinations`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
export const fetchAnimalVaccinations = (animalId: string) => request<Vaccination[]>(`${API_BASE_URL}/api/v1/animals/${animalId}/vaccinations`);
export const fetchAllVaccinations = () => request<Vaccination[]>(`${API_BASE_URL}/api/v1/vaccinations`);

export const createTreatment = (payload: any) => request<Treatment>(`${API_BASE_URL}/api/v1/treatments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
export const fetchAnimalTreatments = (animalId: string) => request<Treatment[]>(`${API_BASE_URL}/api/v1/animals/${animalId}/treatments`);
export const fetchAllTreatments = () => request<Treatment[]>(`${API_BASE_URL}/api/v1/treatments`);

// Attachments
export const uploadCaseAttachment = async (caseId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/api/v1/health-reports/${caseId}/attachments`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new ApiError(err.detail || 'Upload failed', response.status);
  }
  return await response.json();
};
