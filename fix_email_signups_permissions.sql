-- Fix permissions for email_signups table
-- Run this in Supabase SQL Editor if you're getting errors

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public insert" ON public.email_signups;
DROP POLICY IF EXISTS "Allow users to view own records" ON public.email_signups;

-- Create more permissive policy for inserting
CREATE POLICY "Enable insert for everyone" ON public.email_signups
  FOR INSERT
  WITH CHECK (true);

-- Create policy for selecting (viewing records)
CREATE POLICY "Enable select for everyone" ON public.email_signups
  FOR SELECT
  USING (true);

-- Make sure anon role has access
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.email_signups TO anon;
GRANT SELECT ON public.email_signups TO anon;

-- Also grant to authenticated users
GRANT INSERT ON public.email_signups TO authenticated;
GRANT SELECT ON public.email_signups TO authenticated;