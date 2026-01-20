# Quick Start Guide - Production Deployment

Get your Google Reader Clone running in production in under 15 minutes.

## Prerequisites

- Node.js 20+ installed
- Git installed
- Supabase account
- Deployment platform account (Vercel, Netlify, or Docker host)

## Step 1: Supabase Setup (5 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and set project name
   - Note your Project URL and anon key

2. **Run Database Migration**
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run the SQL

3. **Deploy Edge Function**
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy fetch-feeds
   ```

4. **Configure Edge Function Security**
   ```bash
   # Set this AFTER deploying your app (Step 3)
   supabase secrets set ALLOWED_ORIGINS=https://your-domain.com
   ```

## Step 2: Configure Application (2 minutes)

1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd google-reader-clone
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env**
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Step 3: Deploy (5 minutes)

Choose your deployment platform:

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set environment variables when prompted

# Deploy to production
vercel --prod
```

**Set Environment Variables:**
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify init
netlify deploy --prod
```

**Set Environment Variables:**
```bash
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
```

### Option C: Docker

```bash
# Build and run
docker-compose up -d

# Access at http://localhost:8080
```

For production, use a reverse proxy (nginx/Caddy) with SSL.

## Step 4: Post-Deployment Security (3 minutes)

1. **Update Edge Function CORS**
   ```bash
   # Use your actual domain
   supabase secrets set ALLOWED_ORIGINS=https://your-actual-domain.com
   ```

2. **Enable Email Confirmation** (Recommended)
   - Supabase Dashboard → Authentication → Settings
   - Enable "Email Confirmations"

3. **Test Security**
   - Visit your deployed app
   - Create an account
   - Add a test feed
   - Verify everything works

## Step 5: Verify Deployment

**Check Security Headers:**
```bash
curl -I https://your-domain.com
```

Look for:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security`

**Test Authentication:**
1. Visit your app
2. Sign up with a test account
3. Add a feed (try: https://hnrss.org/frontpage)
4. Verify feeds load correctly

**Test Rate Limiting:**
- Try adding 30+ feeds rapidly
- Should see rate limit error after 30 requests

## Troubleshooting

### "Missing authorization header" Error
**Solution:** Make sure you're logged in. The app requires authentication for all feed operations.

### CORS Error
**Solution:**
```bash
# Set allowed origins in edge function
supabase secrets set ALLOWED_ORIGINS=https://your-domain.com
```

### Feeds Not Loading
**Solution:**
1. Check edge function is deployed: `supabase functions list`
2. Check function logs: Supabase Dashboard → Edge Functions → Logs
3. Verify feed URL is accessible

### Build Fails
**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Next Steps

### Recommended Configurations

1. **Set Up Monitoring**
   - Enable Supabase email alerts
   - Set up uptime monitoring (UptimeRobot)
   - Configure error tracking (Sentry)

2. **Configure Backups**
   - Supabase Dashboard → Database → Backups
   - Verify backups are enabled (default: yes)

3. **Review Security**
   - Read [SECURITY.md](SECURITY.md)
   - Complete security checklist
   - Test authentication flows

4. **Optimize Performance**
   - Enable CDN caching
   - Configure custom domain
   - Add analytics (optional)

### Custom Domain Setup

**Vercel:**
```bash
vercel domains add your-domain.com
# Follow DNS configuration prompts
```

**Netlify:**
```bash
netlify domains:add your-domain.com
# Follow DNS configuration prompts
```

**Docker:**
- Configure your DNS to point to your server
- Set up nginx/Caddy with SSL (Let's Encrypt)

### Additional Features

Want to add more features? Check out:
- [Full Deployment Guide](DEPLOYMENT.md) - Advanced configurations
- [Security Documentation](SECURITY.md) - Security best practices
- [README.md](README.md) - Complete feature list and usage

## Support

- **Documentation:** See DEPLOYMENT.md and SECURITY.md
- **Issues:** Check existing issues or create new one
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

## Summary Checklist

- [ ] Supabase project created
- [ ] Database migration run
- [ ] Edge function deployed
- [ ] App deployed to platform
- [ ] Environment variables set
- [ ] ALLOWED_ORIGINS configured
- [ ] Email confirmation enabled
- [ ] Security headers verified
- [ ] Test account created
- [ ] Feed functionality tested
- [ ] Rate limiting tested
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up (optional)

Congratulations! Your Google Reader Clone is now running in production with full security measures! 🎉
