-- Update chat_messages table to support file attachments
-- Run this in your Supabase SQL editor
-- This is the SAFE version that handles already-enabled realtime

-- Step 1: Add file attachment columns if they don't exist
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT CHECK (file_type IN ('pdf', 'image', 'audio')),
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Step 2: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON public.chat_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_urgent ON public.chat_messages(is_urgent);
CREATE INDEX IF NOT EXISTS idx_chat_messages_file_type ON public.chat_messages(file_type);

-- Step 3: Realtime is ALREADY ENABLED ✅
-- You got the error because it's already configured - that's perfect!
-- No need to run the ALTER PUBLICATION command.

-- Step 4: Create a function to notify about new messages (optional, for advanced use)
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

-- Step 5: Create trigger for new message notifications (optional)
DROP TRIGGER IF EXISTS trigger_notify_new_message ON public.chat_messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- ✅ DONE! Your database is now ready for:
-- • File attachments (PDF, images, audio)
-- • Better query performance with indexes
-- • Real-time notifications (already enabled)
-- • New message notifications (optional trigger)

-- Next Steps:
-- 1. Create 'chat-files' bucket in Supabase Storage (if not exists)
-- 2. Configure bucket policies for file access
-- 3. Run your app: npm run dev
-- 4. Test file uploads and real-time chat!
