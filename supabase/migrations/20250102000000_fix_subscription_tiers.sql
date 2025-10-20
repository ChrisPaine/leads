-- Fix subscription status constraint to match pricing tiers
-- Current tiers: free, starter ($9.99), professional ($19.99), agency ($29.99)
-- Legacy tiers to support: pro (maps to agency), premium (maps to professional)
-- Special tiers: enterprise, admin (both get agency-level access)

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_status_check
CHECK (subscription_status IN ('free', 'starter', 'professional', 'agency', 'pro', 'premium', 'enterprise', 'admin'));

-- Optional: Migrate legacy 'pro' users to 'agency' (comment out if you want to keep 'pro' as-is)
-- UPDATE public.profiles SET subscription_status = 'agency' WHERE subscription_status = 'pro';

-- Optional: Migrate legacy 'premium' users to 'professional' (comment out if you want to keep 'premium' as-is)
-- UPDATE public.profiles SET subscription_status = 'professional' WHERE subscription_status = 'premium';
