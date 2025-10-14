-- Run these queries in Supabase SQL Editor to verify the migration

-- 1. Check if the new columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('monthly_searches_used', 'search_quota_reset_date')
ORDER BY column_name;

-- Expected output: 2 rows showing both columns
-- If you see 0 rows, the columns weren't created


-- 2. Check if the functions were created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'increment_monthly_searches',
    'get_remaining_monthly_searches',
    'reset_monthly_search_quota'
  )
ORDER BY routine_name;

-- Expected output: 3 rows showing all 3 functions
-- If you see fewer rows, some functions weren't created


-- 3. View the profiles table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- This shows ALL columns in profiles table
-- Look for monthly_searches_used and search_quota_reset_date


-- 4. Check if any data was initialized
SELECT
  email,
  subscription_status,
  monthly_searches_used,
  search_quota_reset_date
FROM profiles
LIMIT 10;

-- This shows actual data in the profiles table
