-- Advanced Chat Files Storage Security Setup
-- Use this after basic functionality is working if you want stricter security

-- Drop the basic policies first if they exist
DROP POLICY IF EXISTS "Authenticated users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view chat files" ON storage.objects;

-- More secure policies that check conversation participation
-- This requires checking against the patient_doctor_relationships table

-- Users can upload files to conversations where they are participants
CREATE POLICY "Users can upload to their conversations only" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-files' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    -- Check if current user has a relationship with the other user in the conversation
    SELECT 1 FROM patient_doctor_relationships pdr
    WHERE (
      -- User is patient and conversation includes their doctor
      (pdr.patient_id = auth.uid() AND name LIKE '%' || pdr.doctor_id::text || '%') OR
      -- User is doctor and conversation includes their patient  
      (pdr.doctor_id = auth.uid() AND name LIKE '%' || pdr.patient_id::text || '%')
    )
  )
);

-- Users can view files from conversations where they are participants
CREATE POLICY "Users can view their conversation files only" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-files' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    -- Check if current user has a relationship with the other user in the conversation
    SELECT 1 FROM patient_doctor_relationships pdr
    WHERE (
      -- User is patient and conversation includes their doctor
      (pdr.patient_id = auth.uid() AND name LIKE '%' || pdr.doctor_id::text || '%') OR
      -- User is doctor and conversation includes their patient
      (pdr.doctor_id = auth.uid() AND name LIKE '%' || pdr.patient_id::text || '%')
    )
  )
);

-- Users can delete their own uploaded files
CREATE POLICY "Users can delete their own chat files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-files' AND
  auth.role() = 'authenticated' AND
  owner = auth.uid()
);