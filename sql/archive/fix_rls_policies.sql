-- Fix RLS policies to allow doctors to search for patients
-- Run this in your Supabase SQL editor

-- First, drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Doctors can search patients" ON public.users;
DROP POLICY IF EXISTS "Patients can view their doctors" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;

-- Create a simpler policy that allows:
-- 1. Users to see their own profile
-- 2. Any authenticated user to see patient records (for doctor search)
-- 3. Patients to see their doctors through relationships
CREATE POLICY "Users can view profiles" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR  -- Users can see their own profile
    (
      -- Allow viewing patient profiles for search functionality
      role = 'patient' AND auth.uid() IS NOT NULL
    ) OR
    (
      -- Patients can see their doctors
      EXISTS (
        SELECT 1 FROM public.patient_doctor_relationships pdr
        WHERE pdr.patient_id = auth.uid() 
        AND pdr.doctor_id = users.id
      )
    )
  );

-- Fix patient_doctor_relationships policies
-- Drop existing policies
DROP POLICY IF EXISTS "View own relationships" ON public.patient_doctor_relationships;

-- Add comprehensive policies for patient_doctor_relationships
CREATE POLICY "View own relationships" ON public.patient_doctor_relationships
  FOR SELECT USING (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Doctors can add patients" ON public.patient_doctor_relationships
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can remove patients" ON public.patient_doctor_relationships
  FOR DELETE USING (doctor_id = auth.uid());

CREATE POLICY "Update own relationships" ON public.patient_doctor_relationships
  FOR UPDATE USING (patient_id = auth.uid() OR doctor_id = auth.uid());