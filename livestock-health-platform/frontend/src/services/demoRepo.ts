import {
  Farmer,
  Herd,
  Animal,
  HealthReport,
  MortalityReport,
  Vaccination,
  Treatment,
  HealthResponse,
  SystemInfoResponse
} from '../types';
import {
  INITIAL_DEMO_FARMERS,
  INITIAL_DEMO_HERDS,
  INITIAL_DEMO_ANIMALS,
  INITIAL_DEMO_HEALTH_REPORTS,
  INITIAL_DEMO_MORTALITY_REPORTS,
  INITIAL_DEMO_VACCINATIONS,
  INITIAL_DEMO_TREATMENTS
} from './mockData';

const KEY_FARMERS = 'livestock_demo_farmers_v1';
const KEY_HERDS = 'livestock_demo_herds_v1';
const KEY_ANIMALS = 'livestock_demo_animals_v1';
const KEY_HEALTH_REPORTS = 'livestock_demo_health_reports_v1';
const KEY_MORTALITY_REPORTS = 'livestock_demo_mortality_reports_v1';
const KEY_VACCINATIONS = 'livestock_demo_vaccinations_v1';
const KEY_TREATMENTS = 'livestock_demo_treatments_v1';

class DemoRepository {
  constructor() {
    this.ensureInitialized();
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to persist demo data in localStorage', e);
    }
  }

  public ensureInitialized(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(KEY_FARMERS)) {
      this.setItem(KEY_FARMERS, INITIAL_DEMO_FARMERS);
    }
    if (!localStorage.getItem(KEY_HERDS)) {
      this.setItem(KEY_HERDS, INITIAL_DEMO_HERDS);
    }
    if (!localStorage.getItem(KEY_ANIMALS)) {
      this.setItem(KEY_ANIMALS, INITIAL_DEMO_ANIMALS);
    }
    if (!localStorage.getItem(KEY_HEALTH_REPORTS)) {
      this.setItem(KEY_HEALTH_REPORTS, INITIAL_DEMO_HEALTH_REPORTS);
    }
    if (!localStorage.getItem(KEY_MORTALITY_REPORTS)) {
      this.setItem(KEY_MORTALITY_REPORTS, INITIAL_DEMO_MORTALITY_REPORTS);
    }
    if (!localStorage.getItem(KEY_VACCINATIONS)) {
      this.setItem(KEY_VACCINATIONS, INITIAL_DEMO_VACCINATIONS);
    }
    if (!localStorage.getItem(KEY_TREATMENTS)) {
      this.setItem(KEY_TREATMENTS, INITIAL_DEMO_TREATMENTS);
    }
  }

  public resetAllDemoData(): void {
    localStorage.setItem(KEY_FARMERS, JSON.stringify(INITIAL_DEMO_FARMERS));
    localStorage.setItem(KEY_HERDS, JSON.stringify(INITIAL_DEMO_HERDS));
    localStorage.setItem(KEY_ANIMALS, JSON.stringify(INITIAL_DEMO_ANIMALS));
    localStorage.setItem(KEY_HEALTH_REPORTS, JSON.stringify(INITIAL_DEMO_HEALTH_REPORTS));
    localStorage.setItem(KEY_MORTALITY_REPORTS, JSON.stringify(INITIAL_DEMO_MORTALITY_REPORTS));
    localStorage.setItem(KEY_VACCINATIONS, JSON.stringify(INITIAL_DEMO_VACCINATIONS));
    localStorage.setItem(KEY_TREATMENTS, JSON.stringify(INITIAL_DEMO_TREATMENTS));
  }

  // System
  public getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'livestock-health-platform-demo-engine',
      phase: 'phase-1'
    };
  }

  public getSystemInfo(): SystemInfoResponse {
    return {
      name: 'AI-Enabled Livestock Health, Disease Surveillance & Management Platform (Demo Mode)',
      version: '0.1.0-demo',
      phase: 'phase-1',
      environment: 'demo'
    };
  }

  // Farmers
  public getFarmers(): Farmer[] {
    return this.getItem(KEY_FARMERS, INITIAL_DEMO_FARMERS);
  }

  public getFarmer(id: string): Farmer {
    const farmers = this.getFarmers();
    const found = farmers.find((f) => f.id === id);
    if (found) return found;
    // Fallback default demo farmer
    return (
      farmers[0] || {
        id,
        name: 'Ravi Kumar',
        phone: '+919876543210',
        preferred_language: 'en',
        village: 'Rampur',
        block: 'Amberpet',
        district: 'Hyderabad',
        created_at: new Date().toISOString()
      }
    );
  }

  public createFarmer(data: Partial<Farmer>): Farmer {
    const farmers = this.getFarmers();
    const newFarmer: Farmer = {
      id: data.id || `f-${Date.now()}`,
      name: data.name || 'New Farmer',
      phone: data.phone || '',
      preferred_language: data.preferred_language || 'en',
      village: data.village || 'Rampur',
      block: data.block || 'Amberpet',
      district: data.district || 'Hyderabad',
      created_at: new Date().toISOString()
    };
    farmers.push(newFarmer);
    this.setItem(KEY_FARMERS, farmers);
    return newFarmer;
  }

  // Herds
  public getHerds(farmerId?: string): Herd[] {
    const herds = this.getItem(KEY_HERDS, INITIAL_DEMO_HERDS);
    if (!farmerId) return herds;
    return herds.filter((h) => h.farmer_id === farmerId);
  }

  public createHerd(data: Partial<Herd>): Herd {
    const herds = this.getHerds();
    const newHerd: Herd = {
      id: data.id || `h-${Date.now()}`,
      farmer_id: data.farmer_id || 'f1111111-1111-1111-1111-111111111111',
      name: data.name || 'New Herd Unit',
      species: data.species || 'Cattle',
      animal_count: data.animal_count || 1,
      village: data.village || 'Rampur',
      block: data.block || 'Amberpet',
      district: data.district || 'Hyderabad',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    herds.push(newHerd);
    this.setItem(KEY_HERDS, herds);
    return newHerd;
  }

  // Animals
  public getAnimals(farmerId?: string, query?: string): Animal[] {
    let animals = this.getItem(KEY_ANIMALS, INITIAL_DEMO_ANIMALS);
    if (farmerId) {
      animals = animals.filter((a) => a.farmer_id === farmerId);
    }
    if (query) {
      const q = query.toLowerCase();
      animals = animals.filter(
        (a) =>
          a.animal_code.toLowerCase().includes(q) ||
          a.species.toLowerCase().includes(q) ||
          (a.breed && a.breed.toLowerCase().includes(q))
      );
    }
    return animals;
  }

  public getAnimal(id: string): Animal {
    const animals = this.getAnimals();
    const found = animals.find((a) => a.id === id || a.animal_code === id);
    if (found) return found;
    return (
      animals[0] || {
        id,
        farmer_id: 'f1111111-1111-1111-1111-111111111111',
        animal_code: 'COW-0001',
        species: 'Cattle',
        breed: 'Holstein Friesian',
        sex: 'Female',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );
  }

  public createAnimal(data: Partial<Animal>): Animal {
    const animals = this.getAnimals();
    const newAnimal: Animal = {
      id: data.id || `a-${Date.now()}`,
      farmer_id: data.farmer_id || 'f1111111-1111-1111-1111-111111111111',
      herd_id: data.herd_id,
      animal_code: data.animal_code || `ANM-${Math.floor(1000 + Math.random() * 9000)}`,
      species: data.species || 'Cattle',
      breed: data.breed || 'Indigenous',
      sex: data.sex || 'Female',
      date_of_birth: data.date_of_birth || '2023-01-01',
      approximate_age_years: data.approximate_age_years || 2,
      color: data.color || 'Brown',
      identification_notes: data.identification_notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    animals.push(newAnimal);
    this.setItem(KEY_ANIMALS, animals);
    return newAnimal;
  }

  // Health Reports
  public getHealthReports(farmerId?: string): HealthReport[] {
    const reports = this.getItem(KEY_HEALTH_REPORTS, INITIAL_DEMO_HEALTH_REPORTS);
    if (!farmerId) return reports;
    return reports.filter((r) => r.farmer_id === farmerId);
  }

  public getHealthReport(caseId: string): HealthReport {
    const reports = this.getHealthReports();
    const found = reports.find((r) => r.case_id === caseId || r.id === caseId);
    if (found) return found;
    throw new Error(`Case ${caseId} not found`);
  }

  public createHealthReport(payload: any): HealthReport {
    const reports = this.getHealthReports();
    const caseId = `LIV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    // Generate realistic AI pre-screening mock for demo presentation
    const symptoms = Array.isArray(payload.symptoms) ? payload.symptoms : [];
    let aiPred = 'Routine Clinical Observation';
    let aiRisk: 'LOW' | 'WATCH' | 'HIGH' = 'WATCH';
    let aiConf = 0.82;

    if (symptoms.some((s: string) => /skin|lesion|blister/i.test(s))) {
      aiPred = 'Suspected Lumpy Skin Disease (LSD)';
      aiRisk = 'HIGH';
      aiConf = 0.91;
    } else if (symptoms.some((s: string) => /lame|foot|hoof|walk/i.test(s))) {
      aiPred = 'Suspected Foot & Mouth Disease (FMD) / Lameness';
      aiRisk = 'HIGH';
      aiConf = 0.87;
    } else if (symptoms.some((s: string) => /cough|nasal|breath/i.test(s))) {
      aiPred = 'Bovine Respiratory Disease (BRD)';
      aiRisk = 'WATCH';
      aiConf = 0.84;
    }

    const newReport: HealthReport = {
      id: `hr-${Date.now()}`,
      case_id: caseId,
      farmer_id: payload.farmer_id || 'f1111111-1111-1111-1111-111111111111',
      animal_id: payload.animal_id,
      herd_id: payload.herd_id,
      report_type: payload.report_type || 'illness',
      description: payload.description || '',
      symptoms: symptoms,
      duration_text: payload.duration_text || '1 day',
      severity: payload.severity || 'moderate',
      location: payload.location || {
        village: 'Rampur',
        block: 'Amberpet',
        district: 'Hyderabad'
      },
      status: 'reported',
      attachments: payload.attachments || [],
      ai_prediction: aiPred,
      ai_confidence: aiConf,
      ai_risk_level: aiRisk,
      ai_model_version: 'v2.1-mobilenet-sih-demo',
      ai_processed_at: now,
      created_at: now,
      updated_at: now
    };

    reports.unshift(newReport);
    this.setItem(KEY_HEALTH_REPORTS, reports);
    return newReport;
  }

  public updateHealthReportStatus(caseId: string, status: string): HealthReport {
    const reports = this.getHealthReports();
    const report = reports.find((r) => r.case_id === caseId || r.id === caseId);
    if (!report) {
      throw new Error(`Report ${caseId} not found`);
    }
    report.status = status as any;
    report.updated_at = new Date().toISOString();
    this.setItem(KEY_HEALTH_REPORTS, reports);
    return report;
  }

  // Attachments
  public addCaseAttachment(caseId: string, file: File): { id: string; file_path: string } {
    const reports = this.getHealthReports();
    const report = reports.find((r) => r.case_id === caseId || r.id === caseId);
    const blobUrl = URL.createObjectURL(file);
    if (report) {
      report.attachments = report.attachments || [];
      report.attachments.push(blobUrl);
      this.setItem(KEY_HEALTH_REPORTS, reports);
    }
    return {
      id: `att-${Date.now()}`,
      file_path: blobUrl
    };
  }

  // Mortality Reports
  public getMortalityReports(): MortalityReport[] {
    return this.getItem(KEY_MORTALITY_REPORTS, INITIAL_DEMO_MORTALITY_REPORTS);
  }

  public getMortalityReport(caseId: string): MortalityReport {
    const reports = this.getMortalityReports();
    const found = reports.find((r) => r.case_id === caseId || r.id === caseId);
    if (found) return found;
    throw new Error(`Mortality case ${caseId} not found`);
  }

  public createMortalityReport(payload: any): MortalityReport {
    const reports = this.getMortalityReports();
    const caseId = `MORT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const newReport: MortalityReport = {
      id: `mr-${Date.now()}`,
      case_id: caseId,
      farmer_id: payload.farmer_id || 'f1111111-1111-1111-1111-111111111111',
      animal_id: payload.animal_id,
      herd_id: payload.herd_id,
      number_of_deaths: payload.number_of_deaths || 1,
      suspected_cause: payload.suspected_cause || 'Unknown',
      description: payload.description || '',
      location: payload.location || {
        village: 'Rampur',
        block: 'Amberpet',
        district: 'Hyderabad'
      },
      status: 'reported',
      disclaimer: 'Official veterinary post-mortem examination is required for confirmation.',
      attachments: payload.attachments || [],
      created_at: now,
      updated_at: now
    };

    reports.unshift(newReport);
    this.setItem(KEY_MORTALITY_REPORTS, reports);
    return newReport;
  }

  // Vaccinations & Treatments
  public getVaccinations(animalId?: string): Vaccination[] {
    const list = this.getItem(KEY_VACCINATIONS, INITIAL_DEMO_VACCINATIONS);
    if (!animalId) return list;
    return list.filter((v) => v.animal_id === animalId);
  }

  public createVaccination(payload: any): Vaccination {
    const list = this.getVaccinations();
    const now = new Date().toISOString();
    const newV: Vaccination = {
      id: `v-${Date.now()}`,
      farmer_id: payload.farmer_id || 'f1111111-1111-1111-1111-111111111111',
      animal_id: payload.animal_id,
      herd_id: payload.herd_id,
      vaccine_name: payload.vaccine_name || 'Vaccine',
      vaccination_date: payload.vaccination_date || now.split('T')[0],
      batch_number: payload.batch_number || `BATCH-${Date.now()}`,
      next_due_date: payload.next_due_date,
      provider: payload.provider || 'Field Vet',
      notes: payload.notes || '',
      created_at: now,
      updated_at: now
    };
    list.unshift(newV);
    this.setItem(KEY_VACCINATIONS, list);
    return newV;
  }

  public getTreatments(animalId?: string): Treatment[] {
    const list = this.getItem(KEY_TREATMENTS, INITIAL_DEMO_TREATMENTS);
    if (!animalId) return list;
    return list.filter((t) => t.animal_id === animalId);
  }

  public createTreatment(payload: any): Treatment {
    const list = this.getTreatments();
    const now = new Date().toISOString();
    const newT: Treatment = {
      id: `t-${Date.now()}`,
      farmer_id: payload.farmer_id || 'f1111111-1111-1111-1111-111111111111',
      animal_id: payload.animal_id,
      herd_id: payload.herd_id,
      treatment_name: payload.treatment_name || 'Treatment',
      treatment_date: payload.treatment_date || now.split('T')[0],
      dosage: payload.dosage || '',
      provider: payload.provider || 'Field Vet',
      notes: payload.notes || '',
      created_at: now,
      updated_at: now
    };
    list.unshift(newT);
    this.setItem(KEY_TREATMENTS, list);
    return newT;
  }

  // Simulated AI Pre-screening
  public simulateAiScreening(file: File, symptoms: string[] = []): any {
    let pred = 'Low Disease Risk — Typical Presentation';
    let conf = 0.89;
    let risk: 'LOW' | 'WATCH' | 'HIGH' = 'LOW';

    if (symptoms.some((s) => /skin|lesion|blister|pox/i.test(s))) {
      pred = 'Lumpy Skin Disease (LSD) / Pox-like Cutaneous Lesions';
      conf = 0.92;
      risk = 'HIGH';
    } else if (symptoms.some((s) => /lame|leg|foot|hoof|swelling/i.test(s))) {
      pred = 'Foot & Mouth Disease (FMD) / Interdigital Necrobacillosis';
      conf = 0.87;
      risk = 'HIGH';
    } else if (symptoms.some((s) => /cough|fever|saliva|weak/i.test(s))) {
      pred = 'Bovine Respiratory Complex / Haemorrhagic Septicaemia Suspicion';
      conf = 0.84;
      risk = 'WATCH';
    }

    return {
      prediction: pred,
      confidence: conf,
      risk_level: risk,
      model_version: 'v2.1-mobilenet-sih-demo',
      processed_at: new Date().toISOString(),
      disclaimer: 'AI Pre-screening is supportive and non-diagnostic for veterinary triage only.'
    };
  }
}

export const demoRepo = new DemoRepository();
