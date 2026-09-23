import { API_BASE_URL, IS_DEMO_MODE } from '../config/env';
import { demoRepo } from './demoRepo';
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

/** Read the JWT token from the stored auth session (if any). */
function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('livestock_auth_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.token || null;
  } catch {
    return null;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const token = getAuthToken();
    const authHeaders: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...authHeaders,
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
export const fetchHealth = async (): Promise<HealthResponse> => {
  if (IS_DEMO_MODE) return demoRepo.getHealth();
  return request<HealthResponse>(`${API_BASE_URL}/health`);
};

export const fetchSystemInfo = async (): Promise<SystemInfoResponse> => {
  if (IS_DEMO_MODE) return demoRepo.getSystemInfo();
  return request<SystemInfoResponse>(`${API_BASE_URL}/api/v1/system/info`);
};

// Farmers
export const fetchFarmers = async (): Promise<Farmer[]> => {
  if (IS_DEMO_MODE) return demoRepo.getFarmers();
  return request<Farmer[]>(`${API_BASE_URL}/api/v1/farmers`);
};

export const fetchFarmer = async (id: string): Promise<Farmer> => {
  if (IS_DEMO_MODE) return demoRepo.getFarmer(id);
  return request<Farmer>(`${API_BASE_URL}/api/v1/farmers/${id}`);
};

export const createFarmer = async (payload: Partial<Farmer>): Promise<Farmer> => {
  if (IS_DEMO_MODE) return demoRepo.createFarmer(payload);
  return request<Farmer>(`${API_BASE_URL}/api/v1/farmers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};

// Herds
export const fetchFarmerHerds = async (farmerId: string): Promise<Herd[]> => {
  if (IS_DEMO_MODE) return demoRepo.getHerds(farmerId);
  return request<Herd[]>(`${API_BASE_URL}/api/v1/farmers/${farmerId}/herds`);
};

export const createHerd = async (payload: Partial<Herd>): Promise<Herd> => {
  if (IS_DEMO_MODE) return demoRepo.createHerd(payload);
  return request<Herd>(`${API_BASE_URL}/api/v1/herds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};

// Animals
export const fetchFarmerAnimals = async (farmerId: string): Promise<Animal[]> => {
  if (IS_DEMO_MODE) return demoRepo.getAnimals(farmerId);
  return request<Animal[]>(`${API_BASE_URL}/api/v1/farmers/${farmerId}/animals`);
};

export const fetchAllAnimals = async (query?: string): Promise<Animal[]> => {
  if (IS_DEMO_MODE) return demoRepo.getAnimals(undefined, query);
  return request<Animal[]>(`${API_BASE_URL}/api/v1/animals${query ? `?query=${encodeURIComponent(query)}` : ''}`);
};

export const fetchAnimal = async (id: string): Promise<Animal> => {
  if (IS_DEMO_MODE) return demoRepo.getAnimal(id);
  return request<Animal>(`${API_BASE_URL}/api/v1/animals/${id}`);
};

export const createAnimal = async (payload: Partial<Animal>): Promise<Animal> => {
  if (IS_DEMO_MODE) return demoRepo.createAnimal(payload);
  return request<Animal>(`${API_BASE_URL}/api/v1/animals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};

// Health Reports
export const createHealthReport = async (payload: any): Promise<HealthReport> => {
  if (IS_DEMO_MODE) return demoRepo.createHealthReport(payload);
  return request<HealthReport>(`${API_BASE_URL}/api/v1/health-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};

export const fetchHealthReport = async (caseId: string): Promise<HealthReport> => {
  if (IS_DEMO_MODE) return demoRepo.getHealthReport(caseId);
  return request<HealthReport>(`${API_BASE_URL}/api/v1/health-reports/${caseId}`);
};

export const fetchFarmerHealthReports = async (farmerId: string): Promise<HealthReport[]> => {
  if (IS_DEMO_MODE) return demoRepo.getHealthReports(farmerId);
  return request<HealthReport[]>(`${API_BASE_URL}/api/v1/farmers/${farmerId}/health-reports`);
};

export const fetchAllHealthReports = async (): Promise<HealthReport[]> => {
  if (IS_DEMO_MODE) return demoRepo.getHealthReports();
  return request<HealthReport[]>(`${API_BASE_URL}/api/v1/health-reports`);
};

export const updateHealthReportStatus = async (caseId: string, status: string): Promise<HealthReport> => {
  if (IS_DEMO_MODE) return demoRepo.updateHealthReportStatus(caseId, status);
  return request<HealthReport>(`${API_BASE_URL}/api/v1/health-reports/${caseId}/status?status=${status}`, {
    method: 'PATCH'
  });
};

// Mortality Reports
export const createMortalityReport = async (payload: any): Promise<MortalityReport> => {
  if (IS_DEMO_MODE) return demoRepo.createMortalityReport(payload);
  return request<MortalityReport>(`${API_BASE_URL}/api/v1/mortality-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};

export const fetchMortalityReport = async (caseId: string): Promise<MortalityReport> => {
  if (IS_DEMO_MODE) return demoRepo.getMortalityReport(caseId);
  return request<MortalityReport>(`${API_BASE_URL}/api/v1/mortality-reports/${caseId}`);
};

export const fetchAllMortalityReports = async (): Promise<MortalityReport[]> => {
  if (IS_DEMO_MODE) return demoRepo.getMortalityReports();
  return request<MortalityReport[]>(`${API_BASE_URL}/api/v1/mortality-reports`);
};

// Vaccinations & Treatments
export const createVaccination = async (payload: any): Promise<Vaccination> => {
  if (IS_DEMO_MODE) return demoRepo.createVaccination(payload);
  return request<Vaccination>(`${API_BASE_URL}/api/v1/vaccinations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};

export const fetchAnimalVaccinations = async (animalId: string): Promise<Vaccination[]> => {
  if (IS_DEMO_MODE) return demoRepo.getVaccinations(animalId);
  return request<Vaccination[]>(`${API_BASE_URL}/api/v1/animals/${animalId}/vaccinations`);
};

export const fetchAllVaccinations = async (): Promise<Vaccination[]> => {
  if (IS_DEMO_MODE) return demoRepo.getVaccinations();
  return request<Vaccination[]>(`${API_BASE_URL}/api/v1/vaccinations`);
};

export const createTreatment = async (payload: any): Promise<Treatment> => {
  if (IS_DEMO_MODE) return demoRepo.createTreatment(payload);
  return request<Treatment>(`${API_BASE_URL}/api/v1/treatments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};

export const fetchAnimalTreatments = async (animalId: string): Promise<Treatment[]> => {
  if (IS_DEMO_MODE) return demoRepo.getTreatments(animalId);
  return request<Treatment[]>(`${API_BASE_URL}/api/v1/animals/${animalId}/treatments`);
};

export const fetchAllTreatments = async (): Promise<Treatment[]> => {
  if (IS_DEMO_MODE) return demoRepo.getTreatments();
  return request<Treatment[]>(`${API_BASE_URL}/api/v1/treatments`);
};

// Attachments
export const uploadCaseAttachment = async (caseId: string, file: File): Promise<any> => {
  if (IS_DEMO_MODE) return demoRepo.addCaseAttachment(caseId, file);
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
