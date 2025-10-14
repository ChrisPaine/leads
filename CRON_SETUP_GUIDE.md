# Cron Job Setup Guide for Monthly Search Quota Reset

Since Supabase doesn't have built-in cron jobs in the dashboard, here are your options:

## Option 1: GitHub Actions (Recommended - It's Free!)

### Setup Steps:

1. **Add Secrets to Your GitHub Repository:**
   - Go to your GitHub repository
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret** and add:
     - Name: `SUPABASE_URL` → Value: Your Supabase project URL
     - Name: `SUPABASE_ANON_KEY` → Value: Your anon/public key
     - Name: `SUPABASE_SERVICE_ROLE_KEY` → Value: Your service role key (from Supabase Dashboard → Settings → API)

2. **The GitHub Action file is already created:**
   - Location: `.github/workflows/reset-search-quotas.yml`
   - It will run automatically every day at midnight UTC
   - You can also trigger it manually from GitHub Actions tab

3. **Enable GitHub Actions:**
   - Go to your repo → **Actions** tab
   - If disabled, click to enable workflows
   - The cron job will start running automatically

**Pros:**
- ✅ Free forever
- ✅ Reliable
- ✅ No external dependencies
- ✅ Easy to monitor (see runs in Actions tab)
- ✅ Can trigger manually for testing

**Cons:**
- ❌ Requires GitHub repository
- ❌ Runs in GitHub's timezone (UTC)

---

## Option 2: EasyCron (Free Tier Available)

### Setup Steps:

1. **Deploy the reset-quotas Edge Function:**
   ```bash
   npx supabase functions deploy reset-quotas
   ```

2. **Add CRON_SECRET to Supabase:**
   - Go to Supabase Dashboard
   - Project Settings → Edge Functions → Secrets
   - Add: `CRON_SECRET` = (generate a random string, like: `sk_cron_abc123xyz789`)

3. **Sign up for EasyCron:**
   - Go to: https://www.easycron.com/
   - Free plan: 1 cron job
   - Create account

4. **Create Cron Job:**
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/reset-quotas`
   - Method: POST
   - Headers:
     - `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: Daily at 00:00

**Pros:**
- ✅ Easy to set up
- ✅ Free tier available
- ✅ Web interface for monitoring

**Cons:**
- ❌ External dependency
- ❌ Free tier limited to 1 cron job

---

## Option 3: Cron-job.org (Free)

### Setup Steps:

Same as EasyCron but use https://cron-job.org/

1. **Deploy reset-quotas function** (see Option 2, step 1-2)

2. **Sign up for cron-job.org:**
   - Go to: https://cron-job.org/
   - Completely free
   - Create account

3. **Create Cron Job:**
   - Click "Create cronjob"
   - Title: "Reset Monthly Search Quotas"
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/reset-quotas`
   - Schedule: Daily at 00:00
   - Advanced → Headers:
     - `Authorization: Bearer YOUR_CRON_SECRET`

**Pros:**
- ✅ Completely free
- ✅ Unlimited cron jobs
- ✅ Easy monitoring

**Cons:**
- ❌ External dependency
- ❌ Less reliable than paid services

---

## Option 4: Vercel Cron Jobs (If You Deploy on Vercel)

If your frontend is deployed on Vercel:

### Setup Steps:

1. **Create API Route:**
   Create `pages/api/reset-quotas.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js'

   export default async function handler(req, res) {
     // Verify cron secret
     if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
       return res.status(401).json({ error: 'Unauthorized' })
     }

     const supabase = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL,
       process.env.SUPABASE_SERVICE_ROLE_KEY
     )

     const { error } = await supabase.rpc('reset_monthly_search_quota')

     if (error) {
       return res.status(500).json({ error: error.message })
     }

     return res.status(200).json({ success: true })
   }
   ```

2. **Add to vercel.json:**
   ```json
   {
     "crons": [{
       "path": "/api/reset-quotas",
       "schedule": "0 0 * * *"
     }]
   }
   ```

**Pros:**
- ✅ Built into Vercel
- ✅ Free on Hobby plan
- ✅ Reliable

**Cons:**
- ❌ Only works if deployed on Vercel
- ❌ Free tier limited

---

## Option 5: Manual SQL Query (Not Recommended)

You can manually run this in Supabase SQL Editor monthly:

```sql
SELECT reset_monthly_search_quota();
```

**Location in Supabase:**
1. Go to Supabase Dashboard
2. Click **SQL Editor** in left sidebar
3. Click **New query**
4. Paste: `SELECT reset_monthly_search_quota();`
5. Click **Run**

**Pros:**
- ✅ No setup required
- ✅ Free

**Cons:**
- ❌ Manual process (you have to remember!)
- ❌ Not automated
- ❌ Easy to forget

---

## Recommended Setup: GitHub Actions

For most users, **GitHub Actions** is the best choice because:

1. ✅ **Already created** - The file is in your repo at `.github/workflows/reset-search-quotas.yml`
2. ✅ **Free** - GitHub Actions is free for public repos and has generous limits for private repos
3. ✅ **Reliable** - GitHub's infrastructure is very stable
4. ✅ **Easy to monitor** - See all runs in your repo's Actions tab
5. ✅ **No external accounts** - You're already using GitHub

### Quick Start with GitHub Actions:

**Step 1:** Get your Supabase credentials
- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
- Copy:
  - URL (e.g., `https://xxxxx.supabase.co`)
  - anon public key (starts with `eyJ...`)
  - service_role key (starts with `eyJ...`) - **Keep this secret!**

**Step 2:** Add secrets to GitHub
- Go to your GitHub repo → Settings → Secrets and variables → Actions
- Click "New repository secret" three times to add:
  1. `SUPABASE_URL` = your URL
  2. `SUPABASE_ANON_KEY` = your anon key
  3. `SUPABASE_SERVICE_ROLE_KEY` = your service role key

**Step 3:** Push the workflow file
```bash
git add .github/workflows/reset-search-quotas.yml
git commit -m "Add cron job for monthly quota reset"
git push
```

**Step 4:** Verify it's working
- Go to your repo → Actions tab
- You should see "Reset Monthly Search Quotas" workflow
- Click "Run workflow" to test it manually
- Check the logs to confirm it ran successfully

**Done!** It will now run automatically every day at midnight UTC.

---

## Testing Your Cron Job

After setting up, test it:

1. **Check current state:**
   ```sql
   SELECT id, email, monthly_searches_used, search_quota_reset_date
   FROM profiles
   WHERE subscription_status IN ('starter', 'professional')
   LIMIT 5;
   ```

2. **Set some quotas to expired:**
   ```sql
   UPDATE profiles
   SET monthly_searches_used = 50,
       search_quota_reset_date = NOW() - INTERVAL '1 day'
   WHERE subscription_status = 'starter'
   LIMIT 1;
   ```

3. **Trigger your cron job** (manually)

4. **Verify reset happened:**
   ```sql
   SELECT id, email, monthly_searches_used, search_quota_reset_date
   FROM profiles
   WHERE subscription_status IN ('starter', 'professional')
   LIMIT 5;
   ```

   You should see `monthly_searches_used = 0` for the user you updated.

---

## Important Note

**The monthly reset actually happens automatically per-user when they make a search**, so the cron job is optional but recommended for keeping the database clean. The `increment_monthly_searches()` function checks and resets quotas automatically.

However, running a daily cron job is still beneficial because:
- ✅ Keeps database tidy
- ✅ Makes analytics queries faster
- ✅ Allows you to send "quota reset" emails
- ✅ Ensures consistency

---

## Monitoring Your Cron Job

### GitHub Actions:
- Go to repo → Actions → Select the workflow
- See all runs with timestamps and logs

### EasyCron/Cron-job.org:
- Login to their dashboard
- View execution history

### Supabase Logs:
- Go to Supabase Dashboard → Logs
- Filter by "reset_monthly_search_quota"
- See execution timestamps

---

## Troubleshooting

**Cron job not running?**
- Check your cron service is active
- Verify secrets/environment variables are set correctly
- Check service logs for errors

**Quotas not resetting?**
- Run the SQL function manually to test:
  ```sql
  SELECT reset_monthly_search_quota();
  ```
- Check function logs in Supabase

**Need help?**
- Check GitHub Actions logs
- Check Supabase function logs
- Verify database permissions on the function
