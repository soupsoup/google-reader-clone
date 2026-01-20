# 🎯 Your Next Steps - Ready to Deploy!

## ✅ What's Already Done

- [x] Supabase project configured
- [x] Environment variables set
- [x] Database migration completed (all tables exist)
- [x] Dependencies installed
- [x] Supabase CLI installed locally

## 🚀 What You Need to Do Now

### Step 1: Deploy the Edge Function (REQUIRED)

The edge function handles feed fetching with security features. You need to deploy it.

**From your local machine (where you can authenticate):**

```bash
# Navigate to your project
cd /path/to/google-reader-clone

# Login to Supabase (opens browser)
npx supabase login

# Link to your project
npx supabase link --project-ref xdbctgzeqvdnzbbharoj

# Deploy the edge function
npx supabase functions deploy fetch-feeds
```

**Alternative: Deploy via Supabase Dashboard**

If CLI doesn't work, you can deploy manually:

1. Go to: https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/functions
2. Click "Create a new function"
3. Name it: `fetch-feeds`
4. Copy the entire contents of `supabase/functions/fetch-feeds/index.ts`
5. Paste into the code editor
6. Click "Deploy"

---

### Step 2: Test Locally (2 minutes)

Make sure everything works before deploying to production:

```bash
npm run dev
```

Then:
1. Open http://localhost:5173
2. Sign up with a test email
3. Add a test feed: `https://hnrss.org/frontpage`
4. Verify articles load correctly

**Expected behavior:**
- Sign up/login works
- Feed can be added
- Articles appear in the list
- You can read articles

---

### Step 3: Deploy to Platform (Choose One)

#### Option A: Vercel (Recommended) ⭐

**Why Vercel?**
- Easiest setup
- Free tier generous
- Automatic SSL
- Global CDN
- Great for React apps

**Steps:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login (opens browser)
vercel login

# Deploy to preview first
vercel

# Check the preview URL works
# Then deploy to production
vercel --prod
```

**After deployment:**
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add these variables:
   - `VITE_SUPABASE_URL` = `https://xdbctgzeqvdnzbbharoj.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_DHuRxWWwAbKeJyEAkaVo4A_ejMx8uMw`
4. Select: Production, Preview, Development
5. Redeploy: `vercel --prod`

**Your URL will be:** `https://google-reader-clone-[random].vercel.app`

---

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
netlify env:set VITE_SUPABASE_ANON_KEY "sb_publishable_DHuRxWWwAbKeJyEAkaVo4A_ejMx8uMw"

# Deploy
netlify deploy --prod
```

**Your URL will be:** `https://google-reader-clone-[random].netlify.app`

---

#### Option C: Docker (Self-Hosted)

**Requirements:**
- Docker installed on your server
- Domain name (optional but recommended)
- SSL certificate (use Let's Encrypt)

```bash
# Build and run
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Access:** `http://localhost:8080` (or your domain)

For production, set up nginx/Caddy reverse proxy with SSL.

---

### Step 4: Configure CORS (CRITICAL!) 🔒

**This is the most important security step!**

After deploying, you MUST configure CORS in your edge function:

```bash
# Replace with your actual deployment URL
npx supabase secrets set ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Examples:**

For Vercel:
```bash
npx supabase secrets set ALLOWED_ORIGINS=https://google-reader-clone-abc123.vercel.app
```

For Netlify:
```bash
npx supabase secrets set ALLOWED_ORIGINS=https://google-reader-clone-abc123.netlify.app
```

For multiple domains:
```bash
npx supabase secrets set ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

**⚠️ Without this step, your app won't be able to fetch feeds!**

---

### Step 5: Enable Email Confirmation (Recommended)

1. Go to: https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/auth/settings
2. Scroll to "Email Auth"
3. Toggle ON: "Email Confirmations"
4. Optionally customize email templates

**Benefits:**
- Prevents spam accounts
- Validates real email addresses
- Professional user experience

---

### Step 6: Test Your Deployment

Visit your deployed URL and test:

**Authentication:**
- [ ] Sign up works
- [ ] Email confirmation received (if enabled)
- [ ] Login works
- [ ] Logout works

**Feeds:**
- [ ] Can add feed: `https://hnrss.org/frontpage`
- [ ] Articles load
- [ ] Can mark as read
- [ ] Can star articles
- [ ] Can create folders

**Security:**
- [ ] Try adding 35 feeds quickly → should see rate limit
- [ ] Check browser console → no CORS errors

---

## 🧪 Test Feeds

Use these to test your app:

```
https://hnrss.org/frontpage
https://techcrunch.com/feed/
https://www.theverge.com/rss/index.xml
https://feeds.arstechnica.com/arstechnica/index
```

---

## 📊 Deployment Summary

**What's deployed:**
- Frontend: Your chosen platform (Vercel/Netlify/Docker)
- Backend: Supabase (database + edge functions)
- Database: PostgreSQL with RLS
- Auth: Supabase Auth

**Security features active:**
- ✅ Authentication required on all endpoints
- ✅ Rate limiting (30 requests/min per user)
- ✅ SSRF protection (blocks internal IPs)
- ✅ Input validation
- ✅ Size limits (10MB max)
- ✅ Security headers (CSP, HSTS, etc.)
- ⏳ CORS (configure after deployment)

---

## 🆘 Troubleshooting

### "Missing authorization header" error
**Cause:** Edge function not deployed or not accessible
**Fix:** Deploy the edge function (Step 1)

### CORS errors in browser console
**Cause:** ALLOWED_ORIGINS not set
**Fix:** Run `npx supabase secrets set ALLOWED_ORIGINS=https://your-url.com`

### Feeds not loading
**Cause:** Could be multiple issues
**Check:**
1. Edge function deployed?
2. CORS configured?
3. Logged into the app?
4. Check edge function logs: https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/functions

### Rate limit errors immediately
**Cause:** Making too many requests
**Fix:** Wait 1 minute, or adjust rate limit in `supabase/functions/fetch-feeds/index.ts`

---

## 🎯 Quick Command Reference

```bash
# Test locally
npm run dev

# Deploy edge function
npx supabase functions deploy fetch-feeds

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod

# Deploy with Docker
docker-compose up -d

# Set CORS
npx supabase secrets set ALLOWED_ORIGINS=https://your-url.com

# View edge function logs
npx supabase functions logs fetch-feeds
```

---

## 📚 Additional Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj
- **Edge Functions:** https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/functions
- **Database:** https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/editor
- **Auth Settings:** https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/auth/settings
- **Logs:** https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/logs

---

## ✅ Checklist

Print this and check off as you go:

- [ ] Edge function deployed
- [ ] Tested locally (works correctly)
- [ ] Platform chosen (Vercel/Netlify/Docker)
- [ ] App deployed to platform
- [ ] Environment variables set
- [ ] CORS configured in Supabase
- [ ] Email confirmation enabled (optional)
- [ ] Tested on production URL
- [ ] All features work correctly
- [ ] Security features verified

---

## 🎉 You're Almost There!

You've completed most of the setup:
- Database ✅
- Configuration ✅
- Environment ✅

Just need to:
1. Deploy edge function (5 min)
2. Deploy to platform (5 min)
3. Configure CORS (1 min)

**Total remaining time: ~10 minutes** ⏱️

Good luck! 🚀
