-- Test query to check if the patient search is working
-- Run this in your Supabase SQL editor to verify the patient exists and can be found

-- 1. Check if the user exists
SELECT id, email, name, role, avatar_url, condition 
FROM public.users 
WHERE email = 'jnanismart143@gmail.com';

-- 2. Check if the user has the correct role
SELECT id, email, name, role 
FROM public.users 
WHERE email = 'jnanismart143@gmail.com' 
AND role = 'patient';

-- 3. Test the search query (similar to what the app uses)
SELECT id, email, name, role, avatar_url, condition 
FROM public.users 
WHERE role = 'patient' 
AND email ILIKE '%jnanismart143@gmail.com%';

-- 4. Check RLS policies for users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users';