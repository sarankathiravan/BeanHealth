-- Chat Files Storage Bucket Setup
-- This SQL should be run in your Supabase SQL editor to set up the chat-files bucket

-- Create the chat-files bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload chat files to their conversations" ON storage.objects;
DROP POLICY IF EXISTS "Users can view chat files from their conversations" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chat files" ON storage.objects;
DROP POLICY IF EXISTS "Restrict file types and sizes for chat files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view chat files" ON storage.objects;

-- Set up RLS policies for the chat-files bucket
-- Allow authenticated users to upload files (we'll handle permissions in the application layer)
CREATE POLICY "Authenticated users can upload chat files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-files' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to view files (we'll handle permissions in the application layer)
CREATE POLICY "Authenticated users can view chat files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-files' AND
  auth.role() = 'authenticated'
);

-- Users can delete their own uploaded files
CREATE POLICY "Users can delete their own chat files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-files' AND
  auth.role() = 'authenticated' AND
  owner = auth.uid()
);

-- Set up file size and type restrictions
CREATE POLICY "Restrict file types and sizes for chat files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-files' AND
  -- Restrict file size to 25MB max (metadata->>'size' returns string, convert to integer)
  (metadata->>'size')::bigint <= 26214400 AND
  -- Allow only specific file types
  (
    -- PDF files (max 10MB)
    (metadata->>'mimetype' = 'application/pdf' AND (metadata->>'size')::bigint <= 10485760) OR
    -- Image files (max 5MB)
    (metadata->>'mimetype' IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp') AND (metadata->>'size')::bigint <= 5242880) OR
    -- Audio files (max 25MB)
    (metadata->>'mimetype' IN ('audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm') AND (metadata->>'size')::bigint <= 26214400)
  )
);