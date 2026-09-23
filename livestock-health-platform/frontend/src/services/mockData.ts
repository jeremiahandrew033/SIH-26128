import { Farmer, Herd, Animal, HealthReport, MortalityReport, Vaccination, Treatment } from '../types';

export const INITIAL_DEMO_FARMERS: Farmer[] = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    name: 'Ravi Kumar',
    phone: '+919876543210',
    preferred_language: 'en',
    village: 'Rampur',
    block: 'Amberpet',
    district: 'Hyderabad',
    created_at: new Date('2026-01-15T08:00:00Z').toISOString()
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    name: 'Suresh Reddy',
    phone: '+919876543211',
    preferred_language: 'te',
    village: 'Lakshmipur',
    block: 'Uppal',
    district: 'Hyderabad',
    created_at: new Date('2026-01-16T09:30:00Z').toISOString()
  },
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    name: 'Anitha Devi',
    phone: '+919876543212',
    preferred_language: 'hi',
    village: 'Madhapur',
    block: 'Serilingampally',
    district: 'Hyderabad',
    created_at: new Date('2026-01-18T11:00:00Z').toISOString()
  }
];

export const INITIAL_DEMO_HERDS: Herd[] = [
  {
    id: 'h1111111-1111-1111-1111-111111111111',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    name: 'Rampur Cattle Dairy Herd A',
    species: 'Cattle',
    animal_count: 4,
    village: 'Rampur',
    block: 'Amberpet',
    district: 'Hyderabad',
    created_at: new Date('2026-01-15T08:10:00Z').toISOString(),
    updated_at: new Date('2026-01-15T08:10:00Z').toISOString()
  },
  {
    id: 'h2222222-2222-2222-2222-222222222222',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    name: 'Rampur Goat Unit',
    species: 'Goat',
    animal_count: 3,
    village: 'Rampur',
    block: 'Amberpet',
    district: 'Hyderabad',
    created_at: new Date('2026-01-15T08:15:00Z').toISOString(),
    updated_at: new Date('2026-01-15T08:15:00Z').toISOString()
  },
  {
    id: 'h3333333-3333-3333-3333-333333333333',
    farmer_id: 'f2222222-2222-2222-2222-222222222222',
    name: 'Lakshmipur Buffalo Unit',
    species: 'Buffalo',
    animal_count: 2,
    village: 'Lakshmipur',
    block: 'Uppal',
    district: 'Hyderabad',
    created_at: new Date('2026-01-16T09:40:00Z').toISOString(),
    updated_at: new Date('2026-01-16T09:40:00Z').toISOString()
  },
  {
    id: 'h4444444-4444-4444-4444-444444444444',
    farmer_id: 'f3333333-3333-3333-3333-333333333333',
    name: 'Madhapur Sheep & Goat Unit',
    species: 'Sheep',
    animal_count: 1,
    village: 'Madhapur',
    block: 'Serilingampally',
    district: 'Hyderabad',
    created_at: new Date('2026-01-18T11:15:00Z').toISOString(),
    updated_at: new Date('2026-01-18T11:15:00Z').toISOString()
  }
];

export const INITIAL_DEMO_ANIMALS: Animal[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    herd_id: 'h1111111-1111-1111-1111-111111111111',
    animal_code: 'COW-0001',
    species: 'Cattle',
    breed: 'Holstein Friesian',
    sex: 'Female',
    date_of_birth: '2023-03-15',
    approximate_age_years: 3.0,
    color: 'Black & White',
    identification_notes: 'Tag #401',
    created_at: new Date('2026-01-15T08:20:00Z').toISOString(),
    updated_at: new Date('2026-01-15T08:20:00Z').toISOString()
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    herd_id: 'h1111111-1111-1111-1111-111111111111',
    animal_code: 'COW-0002',
    species: 'Cattle',
    breed: 'Gir',
    sex: 'Female',
    date_of_birth: '2022-06-10',
    approximate_age_years: 4.0,
    color: 'Reddish Brown',
    identification_notes: 'Left horn curved',
    created_at: new Date('2026-01-15T08:25:00Z').toISOString(),
    updated_at: new Date('2026-01-15T08:25:00Z').toISOString()
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    herd_id: 'h1111111-1111-1111-1111-111111111111',
    animal_code: 'COW-0003',
    species: 'Cattle',
    breed: 'Sahiwal',
    sex: 'Male',
    date_of_birth: '2024-01-20',
    approximate_age_years: 2.0,
    color: 'Light Brown',
    identification_notes: 'Bull calf',
    created_at: new Date('2026-01-15T08:30:00Z').toISOString(),
    updated_at: new Date('2026-01-15T08:30:00Z').toISOString()
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    herd_id: 'h1111111-1111-1111-1111-111111111111',
    animal_code: 'COW-0004',
    species: 'Cattle',
    breed: 'Crossbreed',
    sex: 'Female',
    date_of_birth: '2021-08-05',
    approximate_age_years: 5.0,
    color: 'White',
    identification_notes: 'Tag #404',
    created_at: new Date('2026-01-15T08:35:00Z').toISOString(),
    updated_at: new Date('2026-01-15T08:35:00Z').toISOString()
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    farmer_id: 'f2222222-2222-2222-2222-222222222222',
    herd_id: 'h3333333-3333-3333-3333-333333333333',
    animal_code: 'BUF-0001',
    species: 'Buffalo',
    breed: 'Murrah',
    sex: 'Female',
    date_of_birth: '2021-11-11',
    approximate_age_years: 5.0,
    color: 'Jet Black',
    identification_notes: 'Ring horns',
    created_at: new Date('2026-01-16T09:45:00Z').toISOString(),
    updated_at: new Date('2026-01-16T09:45:00Z').toISOString()
  },
  {
    id: 'a6666666-6666-6666-6666-666666666666',
    farmer_id: 'f2222222-2222-2222-2222-222222222222',
    herd_id: 'h3333333-3333-3333-3333-333333333333',
    animal_code: 'BUF-0002',
    species: 'Buffalo',
    breed: 'Nili-Ravi',
    sex: 'Female',
    date_of_birth: '2022-04-18',
    approximate_age_years: 4.0,
    color: 'Black with white forehead',
    identification_notes: 'Wall eyes',
    created_at: new Date('2026-01-16T09:50:00Z').toISOString(),
    updated_at: new Date('2026-01-16T09:50:00Z').toISOString()
  },
  {
    id: 'a7777777-7777-7777-7777-777777777777',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    herd_id: 'h2222222-2222-2222-2222-222222222222',
    animal_code: 'GOAT-0001',
    species: 'Goat',
    breed: 'Osmanabadi',
    sex: 'Female',
    date_of_birth: '2024-05-12',
    approximate_age_years: 2.0,
    color: 'Black',
    identification_notes: 'Bearded ewe',
    created_at: new Date('2026-01-15T08:40:00Z').toISOString(),
    updated_at: new Date('2026-01-15T08:40:00Z').toISOString()
  },
  {
    id: 'a8888888-8888-8888-8888-888888888888',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    herd_id: 'h2222222-2222-2222-2222-222222222222',
    animal_code: 'GOAT-0002',
    species: 'Goat',
    breed: 'Black Bengal',
    sex: 'Male',
    date_of_birth: '2024-02-01',
    approximate_age_years: 1.5,
    color: 'Dark Grey',
    identification_notes: 'Young buck',
    created_at: new Date('2026-01-15T08:45:00Z').toISOString(),
    updated_at: new Date('2026-01-15T08:45:00Z').toISOString()
  },
  {
    id: 'a9999999-9999-9999-9999-999999999999',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    herd_id: 'h2222222-2222-2222-2222-222222222222',
    animal_code: 'GOAT-0003',
    species: 'Goat',
    breed: 'Jamnapari',
    sex: 'Female',
    date_of_birth: '2023-09-09',
    approximate_age_years: 2.5,
    color: 'White & Brown',
    identification_notes: 'Long ears',
    created_at: new Date('2026-01-15T08:50:00Z').toISOString(),
    updated_at: new Date('2026-01-15T08:50:00Z').toISOString()
  },
  {
    id: 'a1010101-1010-1010-1010-101010101010',
    farmer_id: 'f3333333-3333-3333-3333-333333333333',
    herd_id: 'h4444444-4444-4444-4444-444444444444',
    animal_code: 'SHP-0001',
    species: 'Sheep',
    breed: 'Deccani',
    sex: 'Female',
    date_of_birth: '2023-11-30',
    approximate_age_years: 2.0,
    color: 'Black Face',
    identification_notes: 'Polled ewe',
    created_at: new Date('2026-01-18T11:20:00Z').toISOString(),
    updated_at: new Date('2026-01-18T11:20:00Z').toISOString()
  }
];

export const INITIAL_DEMO_HEALTH_REPORTS: HealthReport[] = [
  {
    id: 'hr-001',
    case_id: 'LIV-2026-000101',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    animal_id: 'a2222222-2222-2222-2222-222222222222',
    herd_id: 'h1111111-1111-1111-1111-111111111111',
    report_type: 'illness',
    description: 'Reduced feeding and skin lesions noticed on back and neck.',
    symptoms: ['Reduced feeding', 'Skin lesions'],
    duration_text: '2 days',
    severity: 'moderate',
    status: 'reported',
    attachments: [],
    ai_prediction: 'Suspected Lumpy Skin Disease (LSD) / Poxvirus Lesions',
    ai_confidence: 0.88,
    ai_risk_level: 'HIGH',
    ai_model_version: 'v2.1-mobilenet-sih-demo',
    ai_processed_at: new Date('2026-02-10T10:00:00Z').toISOString(),
    location: {
      latitude: 17.4833,
      longitude: 78.2167,
      village: 'Rampur',
      block: 'Amberpet',
      district: 'Hyderabad'
    },
    created_at: new Date('2026-02-10T09:45:00Z').toISOString(),
    updated_at: new Date('2026-02-10T10:00:00Z').toISOString()
  },
  {
    id: 'hr-002',
    case_id: 'LIV-2026-000102',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    animal_id: 'a1111111-1111-1111-1111-111111111111',
    herd_id: 'h1111111-1111-1111-1111-111111111111',
    report_type: 'abnormal_behavior',
    description: 'Cow showing abnormal behavior and agitation during milking.',
    symptoms: ['Abnormal behavior'],
    duration_text: '1 day',
    severity: 'mild',
    status: 'under_review',
    attachments: [],
    ai_prediction: 'Behavioral distress / Subclinical Mastitis check suggested',
    ai_confidence: 0.72,
    ai_risk_level: 'WATCH',
    ai_model_version: 'v2.1-mobilenet-sih-demo',
    ai_processed_at: new Date('2026-02-12T14:30:00Z').toISOString(),
    location: {
      latitude: 17.4833,
      longitude: 78.2167,
      village: 'Rampur',
      block: 'Amberpet',
      district: 'Hyderabad'
    },
    created_at: new Date('2026-02-12T14:15:00Z').toISOString(),
    updated_at: new Date('2026-02-13T10:00:00Z').toISOString()
  },
  {
    id: 'hr-003',
    case_id: 'LIV-2026-000103',
    farmer_id: 'f2222222-2222-2222-2222-222222222222',
    animal_id: 'a5555555-5555-5555-5555-555555555555',
    herd_id: 'h3333333-3333-3333-3333-333333333333',
    report_type: 'illness',
    description: 'Buffalo walking with visible stiffness and lameness in left hind leg.',
    symptoms: ['Lameness'],
    duration_text: '3 days',
    severity: 'moderate',
    status: 'reported',
    attachments: [],
    ai_prediction: 'Foot Rot or Joint Trauma',
    ai_confidence: 0.81,
    ai_risk_level: 'WATCH',
    ai_model_version: 'v2.1-mobilenet-sih-demo',
    ai_processed_at: new Date('2026-02-14T09:00:00Z').toISOString(),
    location: {
      latitude: 17.3984,
      longitude: 78.5583,
      village: 'Lakshmipur',
      block: 'Uppal',
      district: 'Hyderabad'
    },
    created_at: new Date('2026-02-14T08:50:00Z').toISOString(),
    updated_at: new Date('2026-02-14T09:00:00Z').toISOString()
  },
  {
    id: 'hr-004',
    case_id: 'LIV-2026-000104',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    animal_id: 'a8888888-8888-8888-8888-888888888888',
    herd_id: 'h2222222-2222-2222-2222-222222222222',
    report_type: 'illness',
    description: 'Young goat exhibiting lethargy and weakness.',
    symptoms: ['Weakness'],
    duration_text: '2 days',
    severity: 'mild',
    status: 'closed',
    attachments: [],
    location: {
      latitude: 17.4833,
      longitude: 78.2167,
      village: 'Rampur',
      block: 'Amberpet',
      district: 'Hyderabad'
    },
    created_at: new Date('2026-02-15T11:00:00Z').toISOString(),
    updated_at: new Date('2026-02-17T16:00:00Z').toISOString()
  },
  {
    id: 'hr-005',
    case_id: 'LIV-2026-000105',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    animal_id: 'a3333333-3333-3333-3333-333333333333',
    herd_id: 'h1111111-1111-1111-1111-111111111111',
    report_type: 'illness',
    description: 'Bull calf coughing continuously and showing mild nasal discharge.',
    symptoms: ['Coughing', 'Nasal discharge'],
    duration_text: '4 days',
    severity: 'moderate',
    status: 'reported',
    attachments: [],
    ai_prediction: 'Infectious Bovine Rhinotracheitis (IBR) / Respiratory Infection',
    ai_confidence: 0.85,
    ai_risk_level: 'HIGH',
    ai_model_version: 'v2.1-mobilenet-sih-demo',
    ai_processed_at: new Date('2026-02-18T10:00:00Z').toISOString(),
    location: {
      latitude: 17.4833,
      longitude: 78.2167,
      village: 'Rampur',
      block: 'Amberpet',
      district: 'Hyderabad'
    },
    created_at: new Date('2026-02-18T09:30:00Z').toISOString(),
    updated_at: new Date('2026-02-18T10:00:00Z').toISOString()
  }
];

export const INITIAL_DEMO_MORTALITY_REPORTS: MortalityReport[] = [
  {
    id: 'mr-001',
    case_id: 'MORT-2026-00001',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    herd_id: 'h2222222-2222-2222-2222-222222222222',
    number_of_deaths: 2,
    suspected_cause: 'Sudden weakness / Enterotoxaemia',
    description: 'Two goats in Rampur goat unit collapsed suddenly.',
    status: 'reported',
    disclaimer: 'Official veterinary post-mortem examination is required for confirmation.',
    attachments: [],
    location: {
      latitude: 17.4833,
      longitude: 78.2167,
      village: 'Rampur',
      block: 'Amberpet',
      district: 'Hyderabad'
    },
    created_at: new Date('2026-02-05T12:00:00Z').toISOString(),
    updated_at: new Date('2026-02-05T12:00:00Z').toISOString()
  },
  {
    id: 'mr-002',
    case_id: 'MORT-2026-00002',
    farmer_id: 'f2222222-2222-2222-2222-222222222222',
    animal_id: 'a6666666-6666-6666-6666-666666666666',
    herd_id: 'h3333333-3333-3333-3333-333333333333',
    number_of_deaths: 1,
    suspected_cause: 'Severe acute bloat',
    description: 'One buffalo calf died in Lakshmipur after acute digestive swelling.',
    status: 'closed',
    disclaimer: 'Official veterinary post-mortem examination is required for confirmation.',
    attachments: [],
    location: {
      latitude: 17.3984,
      longitude: 78.5583,
      village: 'Lakshmipur',
      block: 'Uppal',
      district: 'Hyderabad'
    },
    created_at: new Date('2026-02-11T16:00:00Z').toISOString(),
    updated_at: new Date('2026-02-12T10:00:00Z').toISOString()
  }
];

export const INITIAL_DEMO_VACCINATIONS: Vaccination[] = [
  {
    id: 'v-001',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    animal_id: 'a1111111-1111-1111-1111-111111111111',
    herd_id: 'h1111111-1111-1111-1111-111111111111',
    vaccine_name: 'FMD Vaccine',
    vaccination_date: '2025-10-01',
    batch_number: 'FMD-2025-B4',
    next_due_date: '2026-04-01',
    provider: 'Government Veterinary Clinic',
    notes: 'Annual FMD booster dose',
    created_at: new Date('2025-10-01T10:00:00Z').toISOString(),
    updated_at: new Date('2025-10-01T10:00:00Z').toISOString()
  },
  {
    id: 'v-002',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    animal_id: 'a2222222-2222-2222-2222-222222222222',
    herd_id: 'h1111111-1111-1111-1111-111111111111',
    vaccine_name: 'LSD Vaccine',
    vaccination_date: '2025-11-15',
    batch_number: 'LSD-994',
    next_due_date: '2026-11-15',
    provider: 'Dr. Anita Sharma',
    notes: 'Lumpy Skin Disease preventive dose',
    created_at: new Date('2025-11-15T11:00:00Z').toISOString(),
    updated_at: new Date('2025-11-15T11:00:00Z').toISOString()
  },
  {
    id: 'v-003',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    animal_id: 'a3333333-3333-3333-3333-333333333333',
    herd_id: 'h1111111-1111-1111-1111-111111111111',
    vaccine_name: 'HS Vaccine',
    vaccination_date: '2025-08-20',
    batch_number: 'HS-882',
    next_due_date: '2026-08-20',
    provider: 'Government Veterinary Clinic',
    notes: 'Haemorrhagic Septicaemia vaccination',
    created_at: new Date('2025-08-20T09:00:00Z').toISOString(),
    updated_at: new Date('2025-08-20T09:00:00Z').toISOString()
  }
];

export const INITIAL_DEMO_TREATMENTS: Treatment[] = [
  {
    id: 't-001',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    animal_id: 'a1111111-1111-1111-1111-111111111111',
    herd_id: 'h1111111-1111-1111-1111-111111111111',
    treatment_name: 'Supportive care & hydration',
    treatment_date: '2026-01-10',
    dosage: 'Single dose electrolyte fluid',
    provider: 'Dr. Anita Sharma',
    notes: 'Dehydration prevention and electrolyte rest',
    created_at: new Date('2026-01-10T11:00:00Z').toISOString(),
    updated_at: new Date('2026-01-10T11:00:00Z').toISOString()
  },
  {
    id: 't-002',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    animal_id: 'a2222222-2222-2222-2222-222222222222',
    herd_id: 'h1111111-1111-1111-1111-111111111111',
    treatment_name: 'Antiseptic wound care',
    treatment_date: '2026-02-01',
    dosage: 'Topical spray 2x daily',
    provider: 'Rampur Vet Assistant',
    notes: 'Cleaned and disinfected skin lesions',
    created_at: new Date('2026-02-01T14:00:00Z').toISOString(),
    updated_at: new Date('2026-02-01T14:00:00Z').toISOString()
  }
];
