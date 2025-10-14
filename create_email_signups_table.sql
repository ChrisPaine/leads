-- Simple script to create email_signups table
-- Copy and paste this entire script into Supabase Dashboard > SQL Editor > New Query

CREATE TABLE IF NOT EXISTS public.email_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  searches_used INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_signups_email ON public.email_signups(email);
CREATE INDEX IF NOT EXISTS idx_email_signups_created_at ON public.email_signups(created_at);

ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.email_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to view own records" ON public.email_signups
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON TABLE public.email_signups IS 'Stores email addresses collected from the welcome modal';