-- Add monthly search tracking to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS monthly_searches_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS search_quota_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to reset monthly search quota
CREATE OR REPLACE FUNCTION reset_monthly_search_quota()
RETURNS void AS $$
BEGIN
  -- Reset searches for users whose reset date has passed
  UPDATE profiles
  SET monthly_searches_used = 0,
      search_quota_reset_date = NOW() + INTERVAL '1 month'
  WHERE search_quota_reset_date < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment monthly search count
CREATE OR REPLACE FUNCTION increment_monthly_searches(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription_status TEXT;
  v_current_count INTEGER;
  v_reset_date TIMESTAMP WITH TIME ZONE;
  v_monthly_limit INTEGER;
BEGIN
  -- Get user's subscription status and current search count
  SELECT subscription_status, monthly_searches_used, search_quota_reset_date
  INTO v_subscription_status, v_current_count, v_reset_date
  FROM profiles
  WHERE id = p_user_id;

  -- If user not found, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if quota needs to be reset (monthly period has passed)
  IF v_reset_date < NOW() THEN
    v_current_count := 0;
    v_reset_date := NOW() + INTERVAL '1 month';

    UPDATE profiles
    SET monthly_searches_used = 0,
        search_quota_reset_date = v_reset_date
    WHERE id = p_user_id;
  END IF;

  -- Determine monthly limit based on subscription tier
  CASE v_subscription_status
    WHEN 'starter' THEN v_monthly_limit := 100;
    WHEN 'professional' THEN v_monthly_limit := 500;
    WHEN 'premium' THEN v_monthly_limit := 500; -- Legacy professional
    WHEN 'agency', 'pro', 'enterprise', 'admin' THEN v_monthly_limit := 999999; -- Unlimited
    ELSE v_monthly_limit := 0; -- Free tier (use daily limits instead)
  END CASE;

  -- Check if user has exceeded their monthly limit
  IF v_current_count >= v_monthly_limit AND v_monthly_limit < 999999 THEN
    RETURN FALSE; -- User has hit their limit
  END IF;

  -- Increment the search count
  UPDATE profiles
  SET monthly_searches_used = monthly_searches_used + 1,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get remaining monthly searches
CREATE OR REPLACE FUNCTION get_remaining_monthly_searches(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_subscription_status TEXT;
  v_current_count INTEGER;
  v_reset_date TIMESTAMP WITH TIME ZONE;
  v_monthly_limit INTEGER;
BEGIN
  -- Get user's subscription status and current search count
  SELECT subscription_status, monthly_searches_used, search_quota_reset_date
  INTO v_subscription_status, v_current_count, v_reset_date
  FROM profiles
  WHERE id = p_user_id;

  -- If user not found, return 0
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Check if quota needs to be reset (monthly period has passed)
  IF v_reset_date < NOW() THEN
    v_current_count := 0;
  END IF;

  -- Determine monthly limit based on subscription tier
  CASE v_subscription_status
    WHEN 'starter' THEN v_monthly_limit := 100;
    WHEN 'professional' THEN v_monthly_limit := 500;
    WHEN 'premium' THEN v_monthly_limit := 500; -- Legacy professional
    WHEN 'agency', 'pro', 'enterprise', 'admin' THEN RETURN 999999; -- Unlimited
    ELSE RETURN 0; -- Free tier (use daily limits instead)
  END CASE;

  RETURN GREATEST(0, v_monthly_limit - v_current_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for efficient quota reset queries
CREATE INDEX IF NOT EXISTS idx_profiles_quota_reset ON profiles(search_quota_reset_date)
WHERE subscription_status IN ('starter', 'professional', 'premium');

-- Initialize reset dates for existing subscribers
UPDATE profiles
SET search_quota_reset_date = NOW() + INTERVAL '1 month'
WHERE search_quota_reset_date IS NULL
  AND subscription_status IN ('starter', 'professional', 'premium', 'agency', 'pro');

COMMENT ON COLUMN profiles.monthly_searches_used IS 'Number of searches used in the current monthly period';
COMMENT ON COLUMN profiles.search_quota_reset_date IS 'Date when the monthly search quota will reset';
COMMENT ON FUNCTION increment_monthly_searches IS 'Increments monthly search count and enforces limits. Returns FALSE if limit exceeded.';
COMMENT ON FUNCTION get_remaining_monthly_searches IS 'Returns the number of searches remaining in the current monthly period';
COMMENT ON FUNCTION reset_monthly_search_quota IS 'Resets monthly quotas for users whose reset date has passed. Run via cron job.';
