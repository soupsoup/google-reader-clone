# 🚀 Deployment Checklist

Use this checklist to track your deployment progress.

## Phase 1: Supabase Setup ⚙️

- [ ] **Create Supabase Project**
  - Go to https://supabase.com
  - Click "New Project"
  - Save Project URL: `_________________________`
  - Save Anon Key: `_________________________`

- [ ] **Run Database Migration**
  - Go to Supabase Dashboard → SQL Editor
  - Copy contents of `supabase/migrations/001_initial_schema.sql`
  - Paste and run in SQL Editor
  - Verify all tables created (feeds, folders, articles, user_feeds, user_articles)

- [ ] **Install Supabase CLI** (on your local machine)
  ```bash
  npm install -g supabase
  ```

- [ ] **Login to Supabase**
  ```bash
  supabase login
  ```

- [ ] **Get Project Reference**
  - Supabase Dashboard → Settings → General
  - Copy "Reference ID": `_________________________`

- [ ] **Link Project**
  ```bash
  supabase link --project-ref YOUR_PROJECT_REF
  ```

- [ ] **Deploy Edge Function**
  ```bash
  cd /workspace/google-reader-clone
  supabase functions deploy fetch-feeds
  ```

## Phase 2: Local Configuration 🔧

- [ ] **Update .env file**
  - Edit `/workspace/google-reader-clone/.env`
  - Replace `VITE_SUPABASE_URL` with your project URL
  - Replace `VITE_SUPABASE_ANON_KEY` with your anon key

- [ ] **Test Locally**
  ```bash
  npm install
  npm run dev
  ```
  - Open http://localhost:5173
  - Create test account
  - Try adding a feed

## Phase 3: Choose Deployment Platform 🌐

Pick ONE platform and follow its checklist:

### Option A: Vercel (Recommended) ✨

- [ ] **Install Vercel CLI**
  ```bash
  npm install -g vercel
  ```

- [ ] **Login to Vercel**
  ```bash
  vercel login
  ```

- [ ] **Initial Deploy**
  ```bash
  cd /workspace/google-reader-clone
  vercel
  ```
  - Follow prompts to create/link project
  - Note preview URL: `_________________________`

- [ ] **Set Environment Variables**
  - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
  - Add `VITE_SUPABASE_URL` = your Supabase URL
  - Add `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
  - Apply to: Production, Preview, Development

- [ ] **Production Deploy**
  ```bash
  vercel --prod
  ```
  - Note production URL: `_________________________`

- [ ] **Update CORS in Supabase**
  ```bash
  supabase secrets set ALLOWED_ORIGINS=https://your-domain.vercel.app
  ```

### Option B: Netlify 🎯

- [ ] **Install Netlify CLI**
  ```bash
  npm install -g netlify-cli
  ```

- [ ] **Login to Netlify**
  ```bash
  netlify login
  ```

- [ ] **Initialize Project**
  ```bash
  cd /workspace/google-reader-clone
  netlify init
  ```

- [ ] **Set Environment Variables**
  ```bash
  netlify env:set VITE_SUPABASE_URL "your-url"
  netlify env:set VITE_SUPABASE_ANON_KEY "your-key"
  ```

- [ ] **Deploy to Production**
  ```bash
  netlify deploy --prod
  ```
  - Note production URL: `_________________________`

- [ ] **Update CORS in Supabase**
  ```bash
  supabase secrets set ALLOWED_ORIGINS=https://your-domain.netlify.app
  ```

### Option C: Docker 🐳

- [ ] **Install Docker**
  - Download from https://docs.docker.com/get-docker/
  - Verify: `docker --version`

- [ ] **Build and Run**
  ```bash
  cd /workspace/google-reader-clone
  ./deploy-docker.sh
  ```
  - OR manually:
  ```bash
  docker-compose up -d
  ```

- [ ] **Test Application**
  - Open http://localhost:8080
  - Check health: http://localhost:8080/health

- [ ] **Setup Reverse Proxy** (for production)
  - Install nginx or Caddy
  - Configure SSL certificate (Let's Encrypt)
  - Point to localhost:8080

- [ ] **Update CORS in Supabase**
  ```bash
  supabase secrets set ALLOWED_ORIGINS=https://your-domain.com
  ```

## Phase 4: Post-Deployment Security 🔒

- [ ] **Enable Email Confirmation**
  - Supabase Dashboard → Authentication → Settings
  - Enable "Email Confirmations"
  - Configure email templates (optional)

- [ ] **Test Authentication**
  - Visit your deployed app
  - Sign up with test account
  - Verify email confirmation works (if enabled)
  - Log in successfully

- [ ] **Test Feed Addition**
  - Add test feed: `https://hnrss.org/frontpage`
  - Verify feed loads
  - Verify articles display

- [ ] **Test Rate Limiting**
  - Try adding 30+ feeds rapidly
  - Should see rate limit error after 30 requests

- [ ] **Verify Security Headers**
  ```bash
  curl -I https://your-domain.com
  ```
  - Look for: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security

- [ ] **Test CORS**
  - Verify app works in browser
  - Check browser console for CORS errors (should be none)

## Phase 5: Monitoring & Optimization 📊

- [ ] **Set Up Error Tracking** (optional)
  - Consider: Sentry, Rollbar, or similar
  - Configure error reporting

- [ ] **Set Up Uptime Monitoring** (optional)
  - Consider: UptimeRobot, Pingdom
  - Monitor your app URL

- [ ] **Enable Database Backups**
  - Supabase Dashboard → Database → Backups
  - Verify automatic backups enabled (default: yes)

- [ ] **Review Logs**
  - Supabase Dashboard → Logs
  - Check for any errors or warnings

- [ ] **Performance Check**
  - Run Lighthouse audit in Chrome DevTools
  - Address any critical issues

## Phase 6: Optional Enhancements 🎨

- [ ] **Custom Domain**
  - Purchase domain (if needed)
  - Configure DNS
  - Add to Vercel/Netlify
  - Update ALLOWED_ORIGINS

- [ ] **CI/CD Setup**
  - GitHub Actions workflow already created
  - Add GitHub secrets:
    - `VERCEL_TOKEN` (or `NETLIFY_AUTH_TOKEN`)
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - `SUPABASE_ACCESS_TOKEN`
    - `SUPABASE_PROJECT_REF`

- [ ] **Analytics** (optional)
  - Add Google Analytics, Plausible, or similar
  - Update CSP headers if needed

## Troubleshooting 🔧

### Common Issues

**"Missing authorization header" error:**
- Make sure you're logged in
- Check if edge function is deployed
- Verify CORS is configured

**CORS errors:**
- Set ALLOWED_ORIGINS: `supabase secrets set ALLOWED_ORIGINS=https://your-domain.com`
- Don't use wildcards (*) in production

**Feeds not loading:**
- Check edge function logs in Supabase Dashboard
- Verify feed URL is accessible
- Check for SSRF protection blocking

**Build fails:**
- Clear cache: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Try again: `npm run build`

## Support Resources 📚

- **Documentation**: See DEPLOYMENT.md, SECURITY.md, QUICKSTART.md
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com

## Deployment Status

**Started:** _______________
**Completed:** _______________
**Production URL:** _________________________
**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
