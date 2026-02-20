-- MediTimeline Database Schema
-- This schema provides a robust foundation for medical history management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  date_of_birth DATE,
  blood_type TEXT,
  allergies TEXT[],
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  
  -- Extracted prescription details
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  department TEXT NOT NULL,
  prescribed_by TEXT,
  hospital TEXT,
  prescription_date DATE,
  diagnosis TEXT,
  instructions TEXT,
  
  -- Metadata
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')) DEFAULT 'medium',
  life_threatening BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical departments lookup table
CREATE TABLE IF NOT EXISTS public.medical_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common medical departments
INSERT INTO public.medical_departments (name, description) VALUES
  ('Cardiology', 'Heart and cardiovascular system'),
  ('Neurology', 'Brain and nervous system'),
  ('Orthopedics', 'Bones, joints, and muscles'),
  ('Pediatrics', 'Children''s health'),
  ('Dermatology', 'Skin conditions'),
  ('Gastroenterology', 'Digestive system'),
  ('Endocrinology', 'Hormones and metabolism'),
  ('Ophthalmology', 'Eye care'),
  ('ENT', 'Ear, nose, and throat'),
  ('General Medicine', 'General health conditions'),
  ('Oncology', 'Cancer treatment'),
  ('Psychiatry', 'Mental health'),
  ('Pulmonology', 'Respiratory system'),
  ('Nephrology', 'Kidney health'),
  ('Rheumatology', 'Autoimmune and joint diseases')
ON CONFLICT (name) DO NOTHING;

-- Medical alerts table
CREATE TABLE IF NOT EXISTS public.medical_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('critical', 'warning', 'info')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health summaries table (for cached/generated summaries)
CREATE TABLE IF NOT EXISTS public.health_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  summary_type TEXT CHECK (summary_type IN ('comprehensive', 'emergency', 'departmental', 'timeline')) NOT NULL,
  summary_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors and hospitals tracking
CREATE TABLE IF NOT EXISTS public.healthcare_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('doctor', 'hospital', 'clinic')) NOT NULL,
  specialization TEXT,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, type)
);

-- User's healthcare provider relationships
CREATE TABLE IF NOT EXISTS public.user_healthcare_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.healthcare_providers(id) ON DELETE CASCADE,
  first_visit_date DATE,
  last_visit_date DATE,
  visit_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON public.prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_department ON public.prescriptions(department);
CREATE INDEX IF NOT EXISTS idx_prescriptions_prescription_date ON public.prescriptions(prescription_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_severity ON public.prescriptions(severity);
CREATE INDEX IF NOT EXISTS idx_prescriptions_life_threatening ON public.prescriptions(life_threatening) WHERE life_threatening = TRUE;
CREATE INDEX IF NOT EXISTS idx_medical_alerts_user_id ON public.medical_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_alerts_unread ON public.medical_alerts(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_health_summaries_user_id ON public.health_summaries(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_healthcare_providers ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Prescriptions policies
CREATE POLICY "Users can view own prescriptions" ON public.prescriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prescriptions" ON public.prescriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prescriptions" ON public.prescriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Medical alerts policies
CREATE POLICY "Users can view own alerts" ON public.medical_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON public.medical_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON public.medical_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Health summaries policies
CREATE POLICY "Users can view own summaries" ON public.health_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries" ON public.health_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User healthcare providers policies
CREATE POLICY "Users can view own healthcare providers" ON public.user_healthcare_providers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own healthcare providers" ON public.user_healthcare_providers
  FOR ALL USING (auth.uid() = user_id);

-- Functions
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate comprehensive health summary
CREATE OR REPLACE FUNCTION generate_health_summary(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_summary JSONB;
BEGIN
  SELECT jsonb_build_object(
    'totalPrescriptions', COUNT(*),
    'activeMedications', jsonb_agg(DISTINCT medication_name) FILTER (WHERE is_active = TRUE),
    'departments', (
      SELECT jsonb_object_agg(department, dept_count)
      FROM (
        SELECT department, COUNT(*) as dept_count
        FROM public.prescriptions
        WHERE user_id = p_user_id
        GROUP BY department
      ) dept_summary
    ),
    'lifeThreatening', COUNT(*) FILTER (WHERE life_threatening = TRUE),
    'highSeverity', COUNT(*) FILTER (WHERE severity = 'high'),
    'oldestPrescription', MIN(prescription_date),
    'latestPrescription', MAX(prescription_date),
    'generatedAt', NOW()
  ) INTO v_summary
  FROM public.prescriptions
  WHERE user_id = p_user_id;
  
  RETURN v_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
