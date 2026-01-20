# 🚀 Quick Reference Card

## Essential Commands

### Supabase
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy edge function
supabase functions deploy fetch-feeds

# Set CORS (IMPORTANT!)
supabase secrets set ALLOWED_ORIGINS=https://your-domain.com

# View function logs
supabase functions logs fetch-feeds
```

### Vercel
```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod

# Set env vars
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Netlify
```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Set env vars
netlify env:set VITE_SUPABASE_URL "your-url"
netlify env:set VITE_SUPABASE_ANON_KEY "your-key"

# Deploy
netlify deploy --prod
```

### Docker
```bash
# Build image
docker build -t google-reader-clone .

# Run with compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Access
http://localhost:8080
```

### Local Development
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Important URLs

### Your Credentials
- Supabase Project: `https://app.supabase.com/project/YOUR_PROJECT_ID`
- Supabase URL: `https://YOUR_PROJECT_ID.supabase.co`
- Anon Key: `(from Supabase Dashboard → Settings → API)`

### Test Feeds
- Hacker News: `https://hnrss.org/frontpage`
- TechCrunch: `https://techcrunch.com/feed/`
- The Verge: `https://www.theverge.com/rss/index.xml`
- Ars Technica: `https://feeds.arstechnica.com/arstechnica/index`

## Security Checklist

- [x] Authentication required on all API endpoints ✅
- [x] Rate limiting (30 req/min per user) ✅
- [x] SSRF protection ✅
- [x] CSP headers ✅
- [ ] ALLOWED_ORIGINS configured (DO THIS!)
- [ ] Email confirmation enabled
- [ ] SSL/HTTPS working
- [ ] Backups enabled

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | `supabase secrets set ALLOWED_ORIGINS=https://your-domain.com` |
| Auth error | Check if edge function is deployed |
| Rate limit | Wait 1 minute or adjust in edge function code |
| Build fails | `rm -rf node_modules && npm install` |
| No feeds load | Check edge function logs in Supabase |

## File Locations

- Database migration: `supabase/migrations/001_initial_schema.sql`
- Edge function: `supabase/functions/fetch-feeds/index.ts`
- Environment vars: `.env` (local), platform dashboard (prod)
- Deployment configs: `vercel.json`, `netlify.toml`, `Dockerfile`

## Need Help?

1. Check `DEPLOYMENT_CHECKLIST.md` for step-by-step guide
2. Read `DEPLOYMENT.md` for detailed instructions
3. See `SECURITY.md` for security best practices
4. Review `QUICKSTART.md` for 15-minute deploy guide

## Environment Variables

Required in all environments:
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

Edge function secrets:
```bash
ALLOWED_ORIGINS=https://your-domain.com
```

## Health Checks

- Local: `http://localhost:5173`
- Docker: `http://localhost:8080/health`
- Production: `https://your-domain.com`

## Support

- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- Docker: https://docs.docker.com
