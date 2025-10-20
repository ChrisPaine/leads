# Multi-Platform Community Search Engine - Deployment Guide

## Overview

This application searches 11 community platforms and generates AI-powered reports from user-selected results.

**Key Features:**
- SerpAPI integration for search results (no tab opening)
- Result cards with selection (max 10)
- Two report types: Summary Report & MVP Builder
- Credit system for paid users
- Email gate (3 free searches)

---

## Prerequisites

1. **Supabase Account** - https://supabase.com
2. **SerpAPI Account** - https://serpapi.com
3. **OpenAI Account** - https://platform.openai.com
4. **Stripe Account** (for payments) - https://stripe.com

---

## Step 1: Database Setup

### 1.1 Run Migrations

In your Supabase project dashboard:

1. Go to **SQL Editor**
2. Run migrations in order:
   - `supabase/migrations/20250107000000_create_email_signups_table.sql`
   - `supabase/migrations/20250107000001_create_increment_email_searches_function.sql`
   - `supabase/migrations/20250107000002_create_search_system_tables.sql`

### 1.2 Verify Tables Created

Check that these tables exist:
- `email_signups`
- `profiles`
- `saved_queries`
- `search_results`
- `reports`
- `user_credits`
- `credit_transactions`

---

## Step 2: Configure API Keys

### 2.1 Get API Keys

**SerpAPI:**
1. Sign up at https://serpapi.com
2. Go to Dashboard → API Key
3. Copy your API key

**OpenAI:**
1. Sign up at https://platform.openai.com
2. Go to API Keys → Create new key
3. Copy your API key
4. Ensure you have GPT-4 access

**Stripe** (if not already configured):
1. Get keys from https://dashboard.stripe.com/apikeys
2. Use test keys for development, live keys for production

### 2.2 Set Supabase Edge Function Secrets

In your Supabase dashboard:

1. Go to **Edge Functions** → **Manage Secrets**
2. Add these secrets:
   ```
   SERP_API_KEY=your_serpapi_key
   OPENAI_API_KEY=your_openai_api_key
   ```

### 2.3 Set Local Environment Variables

Create `.env.local` in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Step 3: Deploy Edge Functions

### 3.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 3.2 Login to Supabase

```bash
supabase login
```

### 3.3 Link Your Project

```bash
supabase link --project-ref your-project-ref
```

### 3.4 Deploy Functions

```bash
# Deploy search function
supabase functions deploy search-serp

# Deploy report generation function
supabase functions deploy generate-report
```

### 3.5 Verify Deployment

In Supabase dashboard → Edge Functions, you should see:
- `search-serp` (active)
- `generate-report` (active)

---

## Step 4: Test the Application Locally

### 4.1 Install Dependencies

```bash
npm install
```

### 4.2 Run Development Server

```bash
npm run dev
```

### 4.3 Test Complete Flow

1. **Search Flow:**
   - Enter a topic (e.g., "heating oil Maine")
   - Select platforms (e.g., Facebook, Reddit)
   - Click "Search"
   - Should navigate to `/search-results`
   - Results should appear as cards

2. **Report Generation (Paid Users Only):**
   - Select up to 10 result cards
   - Click "Generate Report"
   - Choose "Summary Report" or "MVP Builder"
   - Wait 30-60 seconds
   - Report should appear with markdown formatting

3. **Free User Limits:**
   - Email users: 3 searches, then upgrade prompt
   - Anonymous users: Daily limit, then auth dialog

---

## Step 5: Deploy to Production

### 5.1 Build the Application

```bash
npm run build
```

### 5.2 Deploy to Hosting

**Option A: Netlify**
1. Connect your GitHub repo
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

**Option B: Vercel**
1. Import project from GitHub
2. Set framework preset: Vite
3. Add environment variables in Vercel dashboard

**Option C: Cloudflare Pages**
1. Connect GitHub repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variables

### 5.3 Update CORS in Edge Functions

If you encounter CORS issues, update the `corsHeaders` in your Edge Functions to include your production domain.

---

## Step 6: Configure Stripe (If Not Already Done)

### 6.1 Create Products in Stripe

Create these products with monthly billing:
- **Pro Plan**: $X/month
- **Premium Plan**: $Y/month
- **Enterprise Plan**: $Z/month

### 6.2 Update Supabase Edge Function

Ensure `create-checkout` function has correct price IDs from Stripe.

---

## Step 7: Post-Deployment Checklist

### 7.1 Verify All Features

- ✅ Email signup works (stores in `email_signups` table)
- ✅ Search returns results (check `search_results` table)
- ✅ Result cards display correctly
- ✅ Report generation works (check `reports` table)
- ✅ Paid users can generate reports
- ✅ Free users see upgrade prompts
- ✅ Credit system tracks usage (check `credit_transactions` table)

### 7.2 Monitor API Usage

**SerpAPI:**
- Free tier: 100 searches/month
- Paid plans available at https://serpapi.com/pricing

**OpenAI:**
- GPT-4o costs ~$0.005 per 1K tokens
- Estimate: ~500-1000 tokens per report
- Monitor usage in OpenAI dashboard

### 7.3 Set Up Monitoring

1. **Supabase Logs:**
   - Monitor Edge Function logs for errors
   - Check database activity

2. **Error Tracking:**
   - Consider adding Sentry or similar
   - Track failed searches and reports

3. **Usage Analytics:**
   - Monitor searches per day
   - Track report generation rates
   - Analyze conversion from free to paid

---

## Troubleshooting

### Issue: "Unauthorized" error on search

**Solution:**
- Verify user is logged in
- Check `Authorization` header is passed to Edge Function
- Ensure RLS policies are correct on `search_results` table

### Issue: No search results returned

**Solution:**
- Check SerpAPI key is set correctly in Edge Function secrets
- Verify SerpAPI account has remaining credits
- Check Supabase logs for API errors

### Issue: Report generation fails

**Solution:**
- Verify OpenAI API key is set correctly
- Check OpenAI account has GPT-4 access
- Ensure user has `pro`, `premium`, or `enterprise` subscription
- Check Supabase logs for detailed error messages

### Issue: CORS errors

**Solution:**
- Update `corsHeaders` in Edge Functions to include your domain
- Redeploy Edge Functions after changes

---

## Maintenance

### Regular Tasks

1. **Clean up expired search results:**
   ```sql
   SELECT cleanup_expired_search_results();
   ```
   (Run daily via Supabase cron job)

2. **Monitor API costs:**
   - SerpAPI usage
   - OpenAI token usage
   - Adjust pricing if needed

3. **Update dependencies:**
   ```bash
   npm update
   ```

### Scaling Considerations

1. **Search Result Caching:**
   - Currently 1 hour cache
   - Increase for popular queries
   - Decrease for time-sensitive searches

2. **Concurrent Requests:**
   - SerpAPI handles parallel platform searches
   - Current limit: 10 results per platform
   - Adjust `num` parameter if needed

3. **Report Generation:**
   - Currently using GPT-4o
   - Can switch to GPT-4o-mini for cost savings
   - Adjust `max_tokens` based on report length needs

---

## Cost Estimates

### Monthly Costs (1000 active users)

**SerpAPI:**
- Searches: ~5000/month (5 searches per user avg)
- Cost: $50-100/month (depending on plan)

**OpenAI:**
- Reports: ~1000/month (1 report per user avg)
- Tokens: ~1M tokens
- Cost: $5-10/month

**Supabase:**
- Free tier covers most usage
- May need Pro plan ($25/month) for higher limits

**Total estimated monthly cost: $80-135**

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **SerpAPI Docs:** https://serpapi.com/docs
- **OpenAI Docs:** https://platform.openai.com/docs
- **Stripe Docs:** https://stripe.com/docs

---

## Next Steps

1. Set up monitoring and alerts
2. Create admin dashboard for usage analytics
3. Add more platforms (Instagram, Pinterest, etc.)
4. Implement credit purchase system
5. Add saved reports feature
6. Create API for enterprise customers
