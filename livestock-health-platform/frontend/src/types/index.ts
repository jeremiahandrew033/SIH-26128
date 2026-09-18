export interface HealthResponse {
  status: string;
  service: string;
  phase: string;
}

export interface SystemInfoResponse {
  name: string;
  version: string;
  phase: string;
  environment: string;
}

export interface SystemStatusState {
  backendConnected: boolean;
  apiStatus: string;
  environment: string;
  phase: string;
  serviceName: string;
  systemName: string;
  version: string;
  loading: boolean;
  error: string | null;
  lastChecked: Date | null;
}

// Phase 1 Domain Models
export interface Farmer {
  id: string;
  name: string;
  phone?: string;
  preferred_language: 'en' | 'te' | 'hi';
  village?: string;
  block?: string;
  district?: string;
  created_at: string;
}

export interface Herd {
  id: string;
  farmer_id: string;
  name?: string;
  species: string;
  animal_count: number;
  village?: string;
  block?: string;
  district?: string;
  created_at: string;
  updated_at: string;
}

export interface Animal {
  id: string;
  farmer_id: string;
  herd_id?: string;
  animal_code: string;
  species: string;
  breed?: string;
  sex?: string;
  date_of_birth?: string;
  approximate_age_years?: number;
  color?: string;
  identification_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LocationPayload {
  latitude?: number;
  longitude?: number;
  accuracy_meters?: number;
  village?: string;
  block?: string;
  district?: string;
}

export interface HealthReport {
  id: string;
  case_id: string;
  farmer_id: string;
  animal_id?: string;
  herd_id?: string;
  report_type: 'illness' | 'injury' | 'abnormal_behavior' | 'routine_check';
  description?: string;
  symptoms: string[];
  duration_text?: string;
  severity: 'mild' | 'moderate' | 'severe' | 'unknown';
  location_id?: string;
  location?: LocationPayload;
  status: 'reported' | 'under_review' | 'closed';
  attachments: string[];
  // Phase 3 — AI Screening
  ai_prediction?: string;
  ai_confidence?: number;
  ai_risk_level?: 'LOW' | 'WATCH' | 'HIGH';
  ai_model_version?: string;
  ai_processed_at?: string;
  source?: string;
  priority?: string;
  caller_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface MortalityReport {
  id: string;
  case_id: string;
  farmer_id: string;
  animal_id?: string;
  herd_id?: string;
  number_of_deaths: number;
  suspected_cause?: string;
  description?: string;
  location_id?: string;
  location?: LocationPayload;
  status: 'reported' | 'under_review' | 'closed';
  disclaimer: string;
  attachments: string[];
  source?: string;
  priority?: string;
  caller_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Vaccination {
  id: string;
  farmer_id: string;
  animal_id?: string;
  herd_id?: string;
  vaccine_name: string;
  vaccination_date?: string;
  batch_number?: string;
  next_due_date?: string;
  provider?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Treatment {
  id: string;
  farmer_id: string;
  animal_id?: string;
  herd_id?: string;
  treatment_name: string;
  treatment_date?: string;
  dosage?: string;
  provider?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
