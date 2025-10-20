-- Create RPC function to increment email searches
-- This bypasses PostgREST schema cache issues

CREATE OR REPLACE FUNCTION public.increment_email_searches(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.email_signups
  SET searches_used = searches_used + 1,
      updated_at = timezone('utc'::text, now())
  WHERE email = LOWER(user_email);
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.increment_email_searches(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_email_searches(TEXT) TO authenticated;

COMMENT ON FUNCTION public.increment_email_searches IS 'Increments the search count for an email signup user';
