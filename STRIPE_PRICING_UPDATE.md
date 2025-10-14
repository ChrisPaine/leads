# Stripe Pricing Update Guide

The pricing page has been updated with new prices. You need to update the Stripe Price IDs in the code to match your Stripe dashboard configuration.

## New Pricing Structure

| Plan | Old Price | New Price | Current Price ID (needs update) |
|------|-----------|-----------|--------------------------------|
| Starter | $9.99/mo | **$14.99/mo** | `price_1SDS1pGbEY7eE6CcwMAsIKOH` |
| Professional | $19.99/mo | **$29.99/mo** | `price_1SDS49GbEY7eE6Ccl7s1I9s7` |
| Agency | $29.99/mo | **$49.99/mo** | `price_1SDS4KGbEY7eE6Cc4tJxYbcj` |
| One-Time | $4.99 | **$4.99** (no change) | `price_1SDS5MGbEY7eE6Cc6Dgd3ovB` |

## Steps to Update Stripe Prices

### Option 1: Create New Products in Stripe (Recommended)

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/products

2. **Create New Products for Each Plan**
   - Click "Add Product" for each plan
   - Set the new pricing:
     - Starter: $14.99/month recurring
     - Professional: $29.99/month recurring
     - Agency: $49.99/month recurring
   - Copy the new Price IDs (they start with `price_`)

3. **Update the Code**
   - Open: `src/components/pricing/PricingPage.tsx`
   - Replace the price IDs in the `PRICE_IDS` object (lines 18-23):
     ```typescript
     const PRICE_IDS = {
       starter: 'price_YOUR_NEW_STARTER_PRICE_ID',
       professional: 'price_YOUR_NEW_PROFESSIONAL_PRICE_ID',
       agency: 'price_YOUR_NEW_AGENCY_PRICE_ID',
       creditPack: 'price_1SDS5MGbEY7eE6Cc6Dgd3ovB' // Keep existing or update
     }
     ```

### Option 2: Update Existing Products in Stripe

1. **Go to Each Product in Stripe Dashboard**
   - Find your existing products

2. **Add New Prices to Each Product**
   - Click on the product
   - In the "Pricing" section, click "Add another price"
   - Set the new price
   - Set it as default (optional)
   - Copy the new Price ID

3. **Update the Code** (same as Option 1, step 3)

## Updated Plan Features

Make sure your Stripe product descriptions match these features:

### Starter Plan - $14.99/month
- Access to 3 platforms (Reddit, YouTube, Twitter)
- 100 searches per month
- Basic query builder
- Pain point phrase presets
- Email support

### Professional Plan - $29.99/month
- Access to 6 platforms (+LinkedIn, Facebook, TikTok)
- 500 searches per month
- Advanced filters & operators
- Save & organize queries
- Search history access
- Report functionality
- Priority support

### Agency Plan - $49.99/month
- All 11 platforms included
- Unlimited searches
- Save & organize queries
- Advanced platform operators
- Report functionality
- MVP creation
- Landing page creation
- Priority email support
- Cancel anytime

### One-Time Purchase - $4.99
- 10 one-time searches
- Basic query builder
- Pain point phrase presets
- Email support

## Testing

After updating:

1. Test each pricing tier checkout flow
2. Verify the correct prices appear in Stripe checkout
3. Check that subscriptions are created correctly
4. Test the one-time purchase flow

## Rollback Plan

If you need to rollback to old pricing:
- The old Price IDs are documented in this file
- Simply replace the new IDs with the old ones in the code
- Redeploy the application
