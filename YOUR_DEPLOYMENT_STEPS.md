# 🚀 Your Deployment Steps

Your Supabase Project: **https://xdbctgzeqvdnzbbharoj.supabase.co**

## Step 1: Get Your Anon Key ⚙️

1. Go to: https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/settings/api
2. Copy the **anon/public** key (starts with `eyJ...`)
3. Update `.env` file:
   ```bash
   # Replace line 3 in .env with your actual key
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 2: Check/Run Database Migration 🗄️

### Check if migration is already done:
1. Go to: https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/editor
2. Look for these tables in the left sidebar:
   - `feeds`
   - `folders`
   - `user_feeds`
   - `articles`
   - `user_articles`

### If tables DON'T exist, run migration:
1. Go to: https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/sql/new
2. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Paste into the SQL editor
4. Click "Run" button

## Step 3: Deploy Edge Function 🔧

The edge function needs to be deployed to handle feed fetching with security.

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref xdbctgzeqvdnzbbharoj

# Deploy the edge function
supabase functions deploy fetch-feeds
```

### Option B: Manual Deployment via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/functions
2. Click "Create a new function"
3. Name: `fetch-feeds`
4. Copy contents from `supabase/functions/fetch-feeds/index.ts`
5. Deploy

## Step 4: Test Locally First 🧪

Before deploying to production, test locally:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Then:
1. Open http://localhost:5173
2. Sign up with a test account
3. Try adding a test feed: `https://hnrss.org/frontpage`
4. Verify it works

## Step 5: Deploy to Platform 🌐

### Choose your platform:

#### Option A: Vercel (Easiest) ⭐

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview first
vercel

# Once verified, deploy to production
vercel --prod
```

**After deployment:**
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - `VITE_SUPABASE_URL` = `https://xdbctgzeqvdnzbbharoj.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (your anon key)
4. Redeploy: `vercel --prod`

**Your deployment URL will be:** `https://your-project-name.vercel.app`

#### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://xdbctgzeqvdnzbbharoj.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"

# Deploy
netlify deploy --prod
```

**Your deployment URL will be:** `https://your-project-name.netlify.app`

#### Option C: Docker

```bash
# Make sure Docker is installed
docker --version

# Build and run
./deploy-docker.sh

# Or manually:
docker-compose up -d
```

**Your app runs at:** `http://localhost:8080`

## Step 6: Configure CORS (CRITICAL!) 🔒

After deploying, you MUST configure CORS in your edge function:

```bash
# Replace with your actual deployment URL
supabase secrets set ALLOWED_ORIGINS=https://your-app.vercel.app

# For multiple domains (comma-separated):
supabase secrets set ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app.netlify.app
```

**Example for Vercel:**
```bash
supabase secrets set ALLOWED_ORIGINS=https://google-reader-clone.vercel.app
```

**Example for Netlify:**
```bash
supabase secrets set ALLOWED_ORIGINS=https://google-reader-clone.netlify.app
```

**Example for Docker with domain:**
```bash
supabase secrets set ALLOWED_ORIGINS=https://reader.yourdomain.com
```

## Step 7: Enable Email Confirmation (Recommended) 📧

1. Go to: https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/auth/settings
2. Scroll to "Email Auth"
3. Enable "Email Confirmations"
4. Optionally customize email templates

## Step 8: Test Your Deployment ✅

1. Visit your deployed URL
2. Sign up with a test account
3. Add a test feed: `https://hnrss.org/frontpage`
4. Verify articles load
5. Test reading/starring articles

### Test Security Features:

**Test Rate Limiting:**
- Try adding 35+ feeds rapidly
- Should see error after 30 requests

**Test SSRF Protection:**
- Try adding: `http://localhost:8080`
- Should be blocked with error

## Troubleshooting 🔧

### Issue: "Missing authorization header"
**Solution:** Edge function not deployed or not linked correctly
```bash
supabase functions deploy fetch-feeds
```

### Issue: CORS errors in browser
**Solution:** Set ALLOWED_ORIGINS
```bash
supabase secrets set ALLOWED_ORIGINS=https://your-domain.com
```

### Issue: Feeds not loading
**Check:**
1. Edge function logs: https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/functions
2. Make sure you're logged in to the app
3. Check browser console for errors

### Issue: "Unauthorized" errors
**Check:**
1. Anon key is correct in environment variables
2. RLS policies are enabled (from migration)
3. User is logged in

## Quick Reference Links 🔗

- **Supabase Dashboard:** https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj
- **Database Editor:** https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/editor
- **SQL Editor:** https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/sql
- **Edge Functions:** https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/functions
- **Authentication:** https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/auth/users
- **API Settings:** https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/settings/api
- **Logs:** https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/logs

## Summary Checklist

- [ ] Get anon key from Supabase dashboard
- [ ] Update `.env` file with anon key
- [ ] Verify/run database migration
- [ ] Deploy edge function: `supabase functions deploy fetch-feeds`
- [ ] Test locally: `npm run dev`
- [ ] Deploy to platform (Vercel/Netlify/Docker)
- [ ] Set ALLOWED_ORIGINS in Supabase: `supabase secrets set ALLOWED_ORIGINS=https://your-domain.com`
- [ ] Enable email confirmation (optional)
- [ ] Test deployed app
- [ ] Verify security features working

## Need Help?

See these files for more details:
- `DEPLOYMENT_CHECKLIST.md` - Complete checklist
- `QUICK_REFERENCE.md` - Command reference
- `DEPLOYMENT.md` - Full documentation
- `SECURITY.md` - Security details

---

**Next Step:** Get your anon key and update the `.env` file!
