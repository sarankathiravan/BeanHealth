-- BeanHealth Database Setup for Beginners
-- Copy and paste this ENTIRE file into Supabase SQL Editor

-- First, we enable some helpful features
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the main users table (both patients and doctors)
CREATE TABLE public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('patient', 'doctor')) NOT NULL,
  avatar_url TEXT,
  
  -- Doctor-only fields
  specialty TEXT,
  
  -- Patient-only fields
  date_of_birth DATE,
  condition TEXT,
  subscription_tier TEXT DEFAULT 'FreeTrial',
  urgent_credits INTEGER DEFAULT 5,
  trial_ends_at TIMESTAMPTZ,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vitals table (patient health measurements)
CREATE TABLE public.vitals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Blood Pressure (like "130/85")
  blood_pressure_value TEXT,
  blood_pressure_unit TEXT DEFAULT 'mmHg',
  blood_pressure_trend TEXT DEFAULT 'stable',
  
  -- Heart Rate (like "72")
  heart_rate_value TEXT,
  heart_rate_unit TEXT DEFAULT 'bpm',
  heart_rate_trend TEXT DEFAULT 'stable',
  
  -- Temperature (like "98.6")
  temperature_value TEXT,
  temperature_unit TEXT DEFAULT '°F',
  temperature_trend TEXT DEFAULT 'stable',
  
  -- Optional glucose
  glucose_value TEXT,
  glucose_unit TEXT DEFAULT 'mg/dL',
  glucose_trend TEXT DEFAULT 'stable',
  
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medications table
CREATE TABLE public.medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,              -- Like "Aspirin"
  dosage TEXT NOT NULL,            -- Like "81mg"
  frequency TEXT NOT NULL,         -- Like "Once daily"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medical records table
CREATE TABLE public.medical_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,              -- Like "Lab Report"
  summary TEXT NOT NULL,           -- Brief description
  doctor TEXT NOT NULL,            -- Doctor's name
  category TEXT NOT NULL,          -- User-defined category
  file_url TEXT,                   -- Link to uploaded file
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create relationships between patients and doctors
CREATE TABLE public.patient_doctor_relationships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, doctor_id)    -- Each patient-doctor pair only once
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  text TEXT,
  audio_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes to make queries faster
CREATE INDEX idx_vitals_patient_id ON public.vitals(patient_id);
CREATE INDEX idx_medications_patient_id ON public.medications(patient_id);
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_chat_messages_recipient_id ON public.chat_messages(recipient_id);

-- Enable Row Level Security (RLS) - this is IMPORTANT for privacy!
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_doctor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Security policies (who can see what data)
-- Users can see their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Patients can see their own vitals, doctors can see their patients' vitals
CREATE POLICY "View own vitals" ON public.vitals
  FOR SELECT USING (
    patient_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.patient_doctor_relationships 
      WHERE patient_id = vitals.patient_id AND doctor_id = auth.uid()
    )
  );

CREATE POLICY "Insert own vitals" ON public.vitals
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Update own vitals" ON public.vitals
  FOR UPDATE USING (patient_id = auth.uid());

-- Similar policies for medications
CREATE POLICY "View own medications" ON public.medications
  FOR SELECT USING (
    patient_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.patient_doctor_relationships 
      WHERE patient_id = medications.patient_id AND doctor_id = auth.uid()
    )
  );

CREATE POLICY "Manage own medications" ON public.medications
  FOR ALL USING (patient_id = auth.uid());

-- Medical records policies
CREATE POLICY "View own records" ON public.medical_records
  FOR SELECT USING (
    patient_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.patient_doctor_relationships 
      WHERE patient_id = medical_records.patient_id AND doctor_id = auth.uid()
    )
  );

CREATE POLICY "Manage own records" ON public.medical_records
  FOR ALL USING (patient_id = auth.uid());

-- Chat policies
CREATE POLICY "View own messages" ON public.chat_messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Update own messages" ON public.chat_messages
  FOR UPDATE USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Relationship policies
CREATE POLICY "View own relationships" ON public.patient_doctor_relationships
  FOR SELECT USING (patient_id = auth.uid() OR doctor_id = auth.uid());

-- Function to auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for auto-updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.users (id, email, name, role, specialty) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'dr.smith@clinic.com', 'Dr. Smith', 'doctor', 'Cardiologist'),
  ('550e8400-e29b-41d4-a716-446655440002', 'dr.jones@clinic.com', 'Dr. Jones', 'doctor', 'General Practitioner');

INSERT INTO public.users (id, email, name, role, date_of_birth, condition, subscription_tier, urgent_credits, notes) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'jane@example.com', 'Jane Doe', 'patient', '1985-05-23', 'Hypertension', 'Paid', 5, 'Sample patient for testing');

-- Link patient to doctors
INSERT INTO public.patient_doctor_relationships (patient_id, doctor_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002');

-- Add sample vitals
INSERT INTO public.vitals (patient_id, blood_pressure_value, heart_rate_value, temperature_value) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', '130/85', '72', '98.6');

-- Add sample medications
INSERT INTO public.medications (patient_id, name, dosage, frequency) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Lisinopril', '10mg', 'Once a day'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Amlodipine', '5mg', 'Once a day');

-- Add sample chat message
INSERT INTO public.chat_messages (sender_id, recipient_id, text, is_read) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Hi Jane, just checking in on your blood pressure readings.', true);