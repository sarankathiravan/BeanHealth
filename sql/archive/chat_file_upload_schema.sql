-- File Upload Support for Chat Messages
-- Add new columns to chat_messages table to support file uploads

-- Add file-related columns to chat_messages table
ALTER TABLE public.chat_messages ADD COLUMN file_url TEXT;
ALTER TABLE public.chat_messages ADD COLUMN file_name TEXT;
ALTER TABLE public.chat_messages ADD COLUMN file_type TEXT; -- 'pdf', 'image', 'audio'
ALTER TABLE public.chat_messages ADD COLUMN file_size INTEGER; -- file size in bytes
ALTER TABLE public.chat_messages ADD COLUMN mime_type TEXT; -- actual MIME type

-- Add check constraint for file types
ALTER TABLE public.chat_messages ADD CONSTRAINT valid_file_type 
  CHECK (file_type IS NULL OR file_type IN ('pdf', 'image', 'audio'));

-- Create indexes for file-related queries
CREATE INDEX idx_chat_messages_file_type ON public.chat_messages(file_type);

-- Update the existing audio_url column to be consistent with new file system
-- Note: We'll keep audio_url for backward compatibility but new audio files will use file_url

-- Add constraint to ensure either text, audio_url, or file_url is present
ALTER TABLE public.chat_messages ADD CONSTRAINT message_content_check 
  CHECK (
    text IS NOT NULL OR 
    audio_url IS NOT NULL OR 
    file_url IS NOT NULL
  );