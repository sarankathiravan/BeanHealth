-- Remove patient invitations system
-- Run this in your Supabase SQL editor to undo the invitation table

-- Drop triggers first
DROP TRIGGER IF EXISTS update_patient_invitations_updated_at ON public.patient_invitations;
DROP TRIGGER IF EXISTS set_patient_invitation_token ON public.patient_invitations;

-- Drop functions
DROP FUNCTION IF EXISTS set_invitation_token();
DROP FUNCTION IF EXISTS generate_invitation_token();

-- Drop the table (this will also drop the indexes and policies)
DROP TABLE IF EXISTS public.patient_invitations;

-- Note: The existing patient_doctor_relationships table remains unchanged
-- and is used by the new direct patient addition system