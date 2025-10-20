# Monthly Search Limits Implementation

## Overview

This document explains the complete implementation of monthly search limits for Starter and Professional tiers, addressing the previous gap where monthly limits were not being tracked or enforced.

## Problem Statement

**Before this implementation:**
- ❌ Starter tier ($14.99/mo) - Supposed to have 100 searches/month - **NOT TRACKED**
- ❌ Professional tier ($29.99/mo) - Supposed to have 500 searches/month - **NOT TRACKED**
- ✅ Free tier - 3 searches/day (tracked in localStorage)
- ✅ One-time purchase - 10 searches total (tracked in `search_credits`)
- ✅ Agency tier - Unlimited (no tracking needed)

## Solution Implemented

### 1. Database Changes

**New Migration:** `20250115000000_add_monthly_search_tracking.sql`

Added two new columns to the `profiles` table:
```sql
- monthly_searches_used INTEGER DEFAULT 0
- search_quota_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**New Database Functions:**

1. **`increment_monthly_searches(p_user_id UUID)`** - Returns BOOLEAN
   - Checks if the user has exceeded their monthly limit
   - Auto-resets quota if the month has passed
   - Increments the search count
   - Returns `FALSE` if limit exceeded, `TRUE` if allowed

2. **`get_remaining_monthly_searches(p_user_id UUID)`** - Returns INTEGER
   - Returns how many searches the user has left this month
   - Handles quota reset automatically

3. **`reset_monthly_search_quota()`** - Returns VOID
   - Resets all expired quotas
   - Should be run as a cron job (daily recommended)

### 2. Backend Changes

**File:** `supabase/functions/serp-search/index.ts`

Added limit checking **before** performing the search:

```typescript
// Check and increment monthly search limit
const { data: canSearchData, error: limitError } = await supabaseClient
  .rpc('increment_monthly_searches', { p_user_id: user.id })

if (canSearchData === false) {
  // User has hit their monthly limit
  return 429 error with message
}
```

**Behavior:**
- ✅ Checks limit before every search
- ✅ Returns HTTP 429 (Too Many Requests) if limit exceeded
- ✅ Auto-resets monthly quota when period expires
- ✅ No impact on Agency/Pro/Enterprise/Admin users (they get unlimited)
- ✅ No impact on free users (they use daily limits)

### 3. Frontend Changes

**File:** `src/components/auth/AuthProvider.tsx`

Added monthly search tracking to the auth context:

**New Interface Properties:**
```typescript
monthlySearchesUsed: number
monthlySearchLimit: number
monthlySearchesRemaining: number
searchQuotaResetDate: string | null
```

**Monthly Limits by Tier:**
- Starter: 100 searches/month
- Professional: 500 searches/month
- Agency/Pro/Enterprise/Admin: 999,999 (unlimited)
- Free: 0 (uses daily limits instead)

## How It Works

### Search Flow:

1. **User initiates search** → Frontend calls `serp-search` function

2. **Backend checks limit:**
   ```
   Call increment_monthly_searches(user_id)
   ↓
   Is quota reset date in past? → YES → Reset to 0, set new date
   ↓
   What's their tier limit?
   - Starter → 100/month
   - Professional → 500/month
   - Agency+ → Unlimited
   ↓
   Have they hit limit? → YES → Return 429 error
   ↓
   NO → Increment counter, proceed with search
   ```

3. **Search proceeds** or **error returned**

### Monthly Reset:

**Automatic (Per-User):**
- When a user makes a search, system checks if their reset date has passed
- If yes, automatically resets their count to 0 and sets new reset date (+1 month)

**Bulk Reset (Cron Job):**
- Run `SELECT reset_monthly_search_quota()` daily
- Resets all users whose reset dates have passed
- Recommended: Run at midnight UTC

## Tier-Specific Behavior

### Free Tier
- **Limit:** 3 searches/day (tracked in localStorage)
- **Monthly tracking:** Not used (monthly_searches_used stays at 0)
- **Reset:** Daily, automatic

### Starter ($14.99/mo)
- **Limit:** 100 searches/month
- **Tracking:** `monthly_searches_used` increments with each search
- **Reset:** Monthly, from subscription start date
- **Enforcement:** Backend blocks searches when limit reached

### Professional ($29.99/mo)
- **Limit:** 500 searches/month
- **Tracking:** `monthly_searches_used` increments with each search
- **Reset:** Monthly, from subscription start date
- **Enforcement:** Backend blocks searches when limit reached

### Agency ($49.99/mo)
- **Limit:** Unlimited (999,999 in code)
- **Tracking:** Counter increments but never blocks
- **Reset:** Not needed
- **Enforcement:** None

### One-Time Purchase ($4.99)
- **Limit:** 10 searches total (not monthly)
- **Tracking:** Uses `search_credits` field (separate system)
- **Reset:** Never (one-time use)
- **Enforcement:** Decrements credits

## Database Schema

### profiles Table (Updated)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  subscription_status TEXT CHECK (subscription_status IN
    ('free', 'starter', 'professional', 'agency', 'pro', 'premium', 'enterprise', 'admin')),
  search_credits INTEGER DEFAULT 0,  -- For one-time purchases
  monthly_searches_used INTEGER DEFAULT 0,  -- NEW
  search_quota_reset_date TIMESTAMP WITH TIME ZONE,  -- NEW
  ...
);
```

## Frontend Display

Users can see their usage in multiple places:

1. **Account Page** - Full breakdown of usage
2. **Search Interface** - Remaining searches indicator
3. **Error Message** - When limit reached

**Example displays:**

- Starter: "45 of 100 searches remaining this month"
- Professional: "127 of 500 searches remaining this month"
- Agency: "Unlimited searches"

## Error Handling

### When User Hits Limit:

**Backend Response:**
```json
{
  "error": "Monthly search limit exceeded",
  "message": "You have reached your monthly search limit. Please upgrade your plan or wait until next month.",
  "remaining": 0
}
```

**HTTP Status:** 429 Too Many Requests

**Frontend Handling:**
- Show error toast with upgrade CTA
- Display "Upgrade Plan" button
- Show reset date

## Testing

### Test Scenarios:

1. **Starter User - 100 searches:**
   ```sql
   UPDATE profiles SET subscription_status = 'starter',
     monthly_searches_used = 99 WHERE email = 'test@example.com';
   ```
   - Next search should succeed
   - Search after that should fail with 429

2. **Professional User - 500 searches:**
   ```sql
   UPDATE profiles SET subscription_status = 'professional',
     monthly_searches_used = 499 WHERE email = 'test@example.com';
   ```
   - Next search should succeed
   - Search after that should fail with 429

3. **Reset Date Passed:**
   ```sql
   UPDATE profiles SET monthly_searches_used = 100,
     search_quota_reset_date = NOW() - INTERVAL '1 day'
     WHERE email = 'test@example.com';
   ```
   - Next search should auto-reset count to 0 and succeed

4. **Agency User:**
   ```sql
   UPDATE profiles SET subscription_status = 'agency',
     monthly_searches_used = 999 WHERE email = 'test@example.com';
   ```
   - All searches should succeed (unlimited)

## Migration Steps

1. **Run Database Migration:**
   ```bash
   npx supabase db push
   ```
   Or manually run: `20250115000000_add_monthly_search_tracking.sql`

2. **Deploy Backend:**
   ```bash
   npx supabase functions deploy serp-search
   ```

3. **Deploy Frontend:**
   ```bash
   npm run build
   # Deploy to your hosting platform
   ```

4. **Set Up Cron Job (Optional but Recommended):**
   - In Supabase Dashboard → Database → Cron Jobs
   - Add daily job: `SELECT reset_monthly_search_quota()`
   - Schedule: Daily at 00:00 UTC

5. **Test:**
   - Test each tier's limits
   - Verify reset functionality
   - Check error messages

## Monitoring

### Queries to Monitor Usage:

**Users near their limits:**
```sql
SELECT email, subscription_status, monthly_searches_used,
       search_quota_reset_date
FROM profiles
WHERE subscription_status IN ('starter', 'professional')
  AND monthly_searches_used > (
    CASE subscription_status
      WHEN 'starter' THEN 90
      WHEN 'professional' THEN 450
    END
  )
ORDER BY monthly_searches_used DESC;
```

**Users who hit limits this month:**
```sql
SELECT email, subscription_status, monthly_searches_used
FROM profiles
WHERE subscription_status = 'starter' AND monthly_searches_used >= 100
   OR subscription_status = 'professional' AND monthly_searches_used >= 500;
```

**Average searches per tier:**
```sql
SELECT subscription_status,
       AVG(monthly_searches_used) as avg_searches,
       MAX(monthly_searches_used) as max_searches
FROM profiles
WHERE subscription_status IN ('starter', 'professional', 'agency')
GROUP BY subscription_status;
```

## Rollback Plan

If you need to rollback:

1. **Remove backend limit check:**
   - Comment out the `increment_monthly_searches` call in `serp-search/index.ts`
   - Redeploy function

2. **Database:**
   - The new columns don't hurt anything if not used
   - Optionally drop them:
     ```sql
     ALTER TABLE profiles DROP COLUMN monthly_searches_used;
     ALTER TABLE profiles DROP COLUMN search_quota_reset_date;
     ```

## Future Enhancements

1. **Usage Analytics Dashboard** - Show users their search history
2. **Warning Notifications** - Email when 80% of quota used
3. **Rollover Credits** - Allow unused searches to rollover (up to 50%)
4. **Burst Allowance** - Allow temporary overage (pay per search over limit)
5. **Team Plans** - Shared quota across team members

## Summary

✅ **Now Tracking:**
- Starter: 100 searches/month
- Professional: 500 searches/month
- Agency: Unlimited (no limits)
- One-time: 10 searches total
- Free: 3 searches/day

✅ **Enforcement:** Backend blocks searches when monthly limit reached

✅ **Auto-Reset:** Monthly quotas reset automatically after 30 days

✅ **User Visibility:** Users can see their usage and limits

✅ **Scalable:** System can handle future tier changes easily
