-- Phase 1 Supabase PostgreSQL Database Schema
-- AI-Enabled Livestock Health, Disease Surveillance & Management Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

----------------------------------------
-- 1. FARMERS
----------------------------------------
CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    preferred_language TEXT DEFAULT 'en',
    village TEXT,
    block TEXT,
    district TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farmers_phone ON farmers(phone);

----------------------------------------
-- 2. HERDS
----------------------------------------
CREATE TABLE IF NOT EXISTS herds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    name TEXT,
    species TEXT,
    animal_count INTEGER DEFAULT 0,
    village TEXT,
    block TEXT,
    district TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_herds_farmer_id ON herds(farmer_id);

----------------------------------------
-- 3. ANIMALS
----------------------------------------
CREATE TABLE IF NOT EXISTS animals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    herd_id UUID REFERENCES herds(id) ON DELETE SET NULL,
    animal_code TEXT UNIQUE NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    sex TEXT,
    date_of_birth DATE,
    approximate_age_years NUMERIC,
    color TEXT,
    identification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_animals_farmer_id ON animals(farmer_id);
CREATE INDEX IF NOT EXISTS idx_animals_animal_code ON animals(animal_code);

----------------------------------------
-- 4. LOCATIONS
----------------------------------------
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy_meters DOUBLE PRECISION,
    village TEXT,
    block TEXT,
    district TEXT,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------
-- 5. HEALTH REPORTS
----------------------------------------
CREATE TABLE IF NOT EXISTS health_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id TEXT UNIQUE NOT NULL,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    herd_id UUID REFERENCES herds(id) ON DELETE SET NULL,
    
    report_type TEXT NOT NULL CHECK (report_type IN ('illness', 'injury', 'abnormal_behavior', 'routine_check')),
    description TEXT,
    symptoms JSONB DEFAULT '[]'::jsonb,
    duration_text TEXT,
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'unknown')),
    
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    
    status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'under_review', 'closed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_reports_case_id ON health_reports(case_id);
CREATE INDEX IF NOT EXISTS idx_health_reports_animal_id ON health_reports(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_reports_farmer_id ON health_reports(farmer_id);
CREATE INDEX IF NOT EXISTS idx_health_reports_created_at ON health_reports(created_at);

----------------------------------------
-- 6. MORTALITY REPORTS
----------------------------------------
CREATE TABLE IF NOT EXISTS mortality_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id TEXT UNIQUE NOT NULL,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    herd_id UUID REFERENCES herds(id) ON DELETE SET NULL,
    
    number_of_deaths INTEGER NOT NULL CHECK (number_of_deaths > 0),
    suspected_cause TEXT,
    description TEXT,
    
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    
    status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'under_review', 'closed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mortality_reports_created_at ON mortality_reports(created_at);

----------------------------------------
-- 7. VACCINATIONS
----------------------------------------
CREATE TABLE IF NOT EXISTS vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
    herd_id UUID REFERENCES herds(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    
    vaccine_name TEXT NOT NULL,
    vaccination_date DATE DEFAULT CURRENT_DATE,
    next_due_date DATE,
    provider TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------
-- 8. TREATMENTS
----------------------------------------
CREATE TABLE IF NOT EXISTS treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
    herd_id UUID REFERENCES herds(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    
    treatment_name TEXT NOT NULL,
    treatment_date DATE DEFAULT CURRENT_DATE,
    provider TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------
-- 9. CASE ATTACHMENTS
----------------------------------------
CREATE TABLE IF NOT EXISTS case_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_attachments_case_id ON case_attachments(case_id);
