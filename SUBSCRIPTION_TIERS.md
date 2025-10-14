# Subscription Tiers & Platform Access

## Current Tier Structure

### Database Values
The `profiles.subscription_status` column accepts these values:
- `free` - Free tier (default)
- `starter` - $9.99/month subscription
- `professional` - $19.99/month subscription
- `agency` - $29.99/month subscription
- `pro` - Legacy (maps to agency-level access)
- `premium` - Legacy (maps to professional-level access)
- `enterprise` - Special tier (agency-level access)
- `admin` - Special tier (agency-level access)

### Stripe Price IDs
```typescript
CREDIT_PACK:   'price_1SDS5MGbEY7eE6Cc6Dgd3ovB'  // $4.99 one-time (10 credits)
STARTER:       'price_1SDS1pGbEY7eE6CcwMAsIKOH'  // $9.99/month
PROFESSIONAL:  'price_1SDS49GbEY7eE6Ccl7s1I9s7'  // $19.99/month
AGENCY:        'price_1SDS4KGbEY7eE6Cc4tJxYbcj'  // $29.99/month
```

## Platform Access by Tier

### Free Tier
- **Platforms:** None (all locked)
- **Searches:** 3 per day
- **Cost:** $0

### Credit Pack ($4.99 one-time)
- **Platforms:** Reddit, YouTube, Twitter (Starter tier access)
- **Searches:** 10 total (not daily)
- **Cost:** $4.99 one-time
- **After credits run out:** Downgrade to Free tier

### Starter ($9.99/month)
- **Platforms:** Reddit, YouTube, Twitter
- **Searches:** 100 per month
- **Cost:** $9.99/month

### Professional ($19.99/month)
- **Platforms:** Reddit, YouTube, Twitter, LinkedIn, Facebook, TikTok
- **Searches:** 500 per month
- **Cost:** $19.99/month

### Agency ($29.99/month)
- **Platforms:** All 11 platforms
  - Reddit, YouTube, Twitter
  - LinkedIn, Facebook, TikTok
  - Discord, Industry Forums, Instagram, Nextdoor, Google Trends
- **Searches:** Unlimited
- **Cost:** $29.99/month

### Enterprise / Admin
- **Platforms:** All 11 platforms (same as Agency)
- **Searches:** Unlimited
- **Cost:** Custom/Internal

## Code Mapping

### AuthProvider Logic
```typescript
// Tier determination priority:
1. Stripe product_id (from active subscription)
2. profiles.subscription_status (from database)

// Access level calculation:
- isAdmin: tier === 'admin' → Agency access
- isEnterprise: tier === 'enterprise' → Agency access
- isPro: subscriptionTier === 'agency' || tier === 'pro' → Agency access
- isPremium: subscriptionTier === 'professional' || tier === 'premium' → Professional access
- hasCredits: search_credits > 0 → Starter access
```

### Platform Access Helper
```typescript
getAllowedPlatforms(isPro, isPremium, isEnterprise, isAdmin, subscriptionTier, hasCredits)

Returns:
- Admin/Enterprise: AGENCY platforms (11 total)
- Agency/Pro: AGENCY platforms (11 total)
- Professional/Premium: PROFESSIONAL platforms (6 total)
- Starter: STARTER platforms (3 total)
- hasCredits: STARTER platforms (3 total)
- Free: Empty array (0 platforms)
```

## Migration Order

Run migrations in this order:

1. **20250913162246** - Initial profiles table
2. **20250917004401** - Add enterprise/admin to constraint
3. **20250101000000** - Add credits system (search_credits column)
4. **20250102000000** - Fix subscription tiers constraint (all 8 values)

## Webhook Event Handling

### Credit Pack Purchase
```
Event: checkout.session.completed (mode: payment)
Price: price_1SDS5MGbEY7eE6Cc6Dgd3ovB
Action: Add 10 to search_credits
```

### Subscription Created/Updated
```
Event: customer.subscription.created/updated
Action: Map price_id to tier → Update subscription_status
- price_1SDS1pGbEY7eE6CcwMAsIKOH → 'starter'
- price_1SDS49GbEY7eE6Ccl7s1I9s7 → 'professional'
- price_1SDS4KGbEY7eE6Cc4tJxYbcj → 'agency'
```

### Subscription Deleted
```
Event: customer.subscription.deleted
Action: Set subscription_status = 'free'
```

## Testing Access Levels

```sql
-- Set user to Free
UPDATE profiles SET subscription_status = 'free', search_credits = 0 WHERE email = 'test@example.com';

-- Set user to Credit Pack user
UPDATE profiles SET subscription_status = 'free', search_credits = 10 WHERE email = 'test@example.com';

-- Set user to Starter
UPDATE profiles SET subscription_status = 'starter', search_credits = 0 WHERE email = 'test@example.com';

-- Set user to Professional
UPDATE profiles SET subscription_status = 'professional', search_credits = 0 WHERE email = 'test@example.com';

-- Set user to Agency
UPDATE profiles SET subscription_status = 'agency', search_credits = 0 WHERE email = 'test@example.com';

-- Set user to Enterprise
UPDATE profiles SET subscription_status = 'enterprise', search_credits = 0 WHERE email = 'test@example.com';
```

## Frontend Display

Users see their access level based on:
- **Free:** "3 free searches remaining today"
- **Credit Pack:** "X credits remaining" (shows X out of 10)
- **Starter:** "100 searches per month"
- **Professional:** "500 searches per month"
- **Agency/Enterprise/Admin:** "Unlimited searches"

Platform cards show:
- ✅ Unlocked platforms (can select)
- 🔒 Locked platforms (grayed out, click shows paywall)
