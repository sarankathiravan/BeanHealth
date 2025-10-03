-- Add missing INSERT policy for users table to allow Google OAuth users to create profiles

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);