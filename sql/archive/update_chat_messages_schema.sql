-- Update chat_messages table to support file attachments
-- Run this in your Supabase SQL editor

-- Add file attachment columns if they don't exist
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT CHECK (file_type IN ('pdf', 'image', 'audio')),
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON public.chat_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_urgent ON public.chat_messages(is_urgent);
CREATE INDEX IF NOT EXISTS idx_chat_messages_file_type ON public.chat_messages(file_type);

-- Enable realtime for chat_messages if not already enabled
-- If you get an error that the table is already in the publication, that's good!
-- It means realtime is already enabled. You can skip this line or comment it out.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Table chat_messages is already in publication supabase_realtime - skipping';
END $$;

-- Create a function to notify about new messages (optional, for advanced use)
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_message',
    json_build_object(
      'id', NEW.id,
      'sender_id', NEW.sender_id,
      'recipient_id', NEW.recipient_id,
      'is_urgent', NEW.is_urgent,
      'timestamp', NEW.timestamp
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new message notifications (optional)
DROP TRIGGER IF EXISTS trigger_notify_new_message ON public.chat_messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Update RLS policies to allow file access
-- (The existing policies should cover this, but let's be explicit)

-- Grant permissions for storage bucket access
-- Note: You'll need to set up a 'chat-files' bucket in Supabase Storage
-- and configure its policies separately through the Supabase dashboard
