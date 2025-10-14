# Credit Pack System Setup Guide

## Overview
This guide explains how to set up the $4.99 credit pack system that gives users 10 one-time searches with Starter tier platform access (Reddit, YouTube, Twitter).

## 1. Database Migration

Run the migration to add credit tracking:

```bash
# The migration is already created at:
# supabase/migrations/20250101000000_add_credits_system.sql

# Apply it with:
supabase db push
```

This adds:
- `search_credits` column to `profiles` table
- `credit_purchases` table to track purchases
- Updates subscription_status constraint to include new tiers

## 2. Deploy Stripe Webhook Function

The webhook handler is at: `supabase/functions/stripe-webhook/index.ts`

Deploy it:

```bash
supabase functions deploy stripe-webhook
```

## 3. Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/stripe-webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add to Supabase secrets:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## 4. Verify Environment Variables

Ensure these are set in Supabase:

```bash
supabase secrets list

# Should show:
# STRIPE_SECRET_KEY
# STRIPE_WEBHOOK_SECRET
# SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
```

## 5. How It Works

### Purchase Flow:
1. User clicks "Buy Credit Pack" on pricing page
2. Frontend calls `create-checkout` function with `mode: 'payment'`
3. Stripe checkout session created for one-time payment ($4.99)
4. User completes payment
5. Stripe sends `checkout.session.completed` webhook
6. Webhook handler adds 10 credits to user's `search_credits`
7. Records purchase in `credit_purchases` table

### Platform Access:
- Credit pack users get **Starter tier** access
- Platforms: Reddit, YouTube, Twitter
- Each search decrements 1 credit
- When credits reach 0, user becomes free tier (3 daily searches, no platforms)

### Code Changes:
- `AuthProvider.tsx` - Tracks `searchCredits` and provides `decrementCredit()`
- `useUsageLimit.ts` - Checks credits before allowing search
- `platforms.tsx` - Maps `hasCredits` to Starter tier platforms
- `PlatformSelector.tsx` - Shows locked platforms for users without access

## 6. Testing

### Test Credit Pack Purchase:
1. Use Stripe test mode
2. Test card: `4242 4242 4242 4242`
3. Purchase credit pack
4. Verify webhook received in Supabase logs
5. Check database: `SELECT search_credits FROM profiles WHERE id = 'user_id';`
6. Try searching - should decrement credits

### Test Platform Access:
1. User with 0 credits: No platforms unlocked
2. User with credits: Reddit, YouTube, Twitter unlocked
3. Starter subscriber: Same 3 platforms
4. Professional subscriber: 6 platforms
5. Agency subscriber: All 11 platforms

## 7. Price IDs Reference

```typescript
CREDIT_PACK: 'price_1SDS5MGbEY7eE6Cc6Dgd3ovB'  // $4.99 one-time
STARTER:     'price_1SDS1pGbEY7eE6CcwMAsIKOH'  // $9.99/month
PROFESSIONAL:'price_1SDS49GbEY7eE6Ccl7s1I9s7'  // $19.99/month
AGENCY:      'price_1SDS4KGbEY7eE6Cc4tJxYbcj'  // $29.99/month
```

## 8. Monitoring

Check webhook logs:
```bash
supabase functions logs stripe-webhook
```

Check database:
```sql
-- See all credit purchases
SELECT * FROM credit_purchases ORDER BY created_at DESC;

-- See users with credits
SELECT id, email, search_credits FROM profiles WHERE search_credits > 0;
```

## 9. Troubleshooting

**Credits not added after purchase:**
- Check webhook logs for errors
- Verify webhook secret is correct
- Ensure price_id matches in webhook handler
- Check Supabase function logs

**Platform access not working:**
- Verify `hasCredits` is being passed to PlatformSelector
- Check `getAllowedPlatforms()` logic
- Ensure profile is being fetched correctly

**Credits not decrementing:**
- Check `decrementCredit()` function in AuthProvider
- Verify `incrementSearchCount()` is calling it
- Check for database update errors in logs
