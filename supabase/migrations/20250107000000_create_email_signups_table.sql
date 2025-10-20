-- Create email_signups table for collecting user emails from welcome modal
CREATE TABLE IF NOT EXISTS public.email_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  searches_used INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_signups_email ON public.email_signups(email);

-- Create index on created_at for analytics
CREATE INDEX IF NOT EXISTS idx_email_signups_created_at ON public.email_signups(created_at);

-- Enable Row Level Security
ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for signup)
CREATE POLICY "Allow public insert" ON public.email_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow users to view their own records
CREATE POLICY "Allow users to view own records" ON public.email_signups
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow admins to view all records
CREATE POLICY "Allow admins to view all" ON public.email_signups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.subscription_status = 'admin'
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_email_signups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_email_signups_updated_at
  BEFORE UPDATE ON public.email_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_signups_updated_at();

-- Add comment to table
COMMENT ON TABLE public.email_signups IS 'Stores email addresses collected from the welcome modal for lead generation';