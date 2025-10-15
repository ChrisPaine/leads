# Create Checkout Email Function

This Supabase Edge Function creates Stripe checkout sessions for users who have submitted their email via the welcome modal but haven't authenticated yet.

## Purpose

When users complete their 3 free searches (tracked via email_signups table), they see an upgrade modal. This function allows them to purchase a subscription without signing up/logging in first - their email is pre-filled from the email_signups table.

## Deployment

Deploy this function to Supabase:

```bash
supabase functions deploy create-checkout-email
```

## Environment Variables Required

Make sure these are set in your Supabase project:

- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `SUPABASE_URL` - Automatically available
- `SUPABASE_ANON_KEY` - Automatically available

## How It Works

1. User submits email in welcome modal → stored in `email_signups` table
2. User performs 3 searches → `searches_used` incremented each time
3. On 4th search attempt → upgrade modal shows
4. User clicks "Upgrade Now" → this function is called
5. Function verifies email exists in `email_signups` table
6. Creates/finds Stripe customer with that email
7. Creates Stripe checkout session
8. Returns checkout URL to redirect user

## Request Format

```json
{
  "priceId": "price_xxx",
  "customerEmail": "user@example.com"
}
```

## Response Format

Success:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

Error:
```json
{
  "error": "Error message"
}
```

## Security

- Function verifies email exists in `email_signups` table before creating checkout
- No authentication required (users haven't signed up yet)
- Email must match a record in the database
- Stripe handles payment security
