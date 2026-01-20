# 🚀 Deploy from GitHub Codespaces

You're running in GitHub Codespaces! Here's how to deploy:

## ✅ Current Status

- ✅ All code is up to date
- ✅ Build works perfectly
- ✅ TypeScript errors fixed
- ✅ Branch pushed to GitHub

## 🚀 Deployment Options

### Option 1: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

When prompted:
- Link to existing project or create new one
- Set environment variables when asked:
  - `VITE_SUPABASE_URL` = `https://xdbctgzeqvdnzbbharoj.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_DHuRxWWwAbKeJyEAkaVo4A_ejMx8uMw`

**OR set env vars via Vercel dashboard:**
1. Go to your project on vercel.com
2. Settings → Environment Variables
3. Add both variables
4. Redeploy: `vercel --prod`

---

### Option 2: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize (if first time)
netlify init

# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://xdbctgzeqvdnzbbharoj.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "sb_publishable_DHuRxWWwAbKeJyEAkaVo4A_ejMx8uMw"

# Deploy
netlify deploy --prod
```

---

### Option 3: Auto-Deploy via GitHub (If configured)

If you have GitHub Actions or Vercel/Netlify GitHub integration:

1. Merge this branch to main:
```bash
git checkout main
git merge enable-remote-execution-with-security-measures-for-the-application-w6TzzNmNMhwr
git push origin main
```

2. Auto-deployment will trigger!

---

## 🔧 After Deployment

### 1. Deploy Edge Function (REQUIRED)

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref xdbctgzeqvdnzbbharoj

# Deploy the edge function
npx supabase functions deploy fetch-feeds
```

### 2. Configure CORS (REQUIRED)

Replace `YOUR_DEPLOYMENT_URL` with your actual URL:

```bash
npx supabase secrets set ALLOWED_ORIGINS=https://YOUR_DEPLOYMENT_URL.vercel.app
```

For example:
```bash
npx supabase secrets set ALLOWED_ORIGINS=https://google-reader-clone-abc123.vercel.app
```

---

## 🧪 Test Your Deployment

1. Visit your deployment URL
2. Should see login/signup page (not blank!)
3. Sign up with a test account
4. After edge function is deployed, try adding feed: `https://hnrss.org/frontpage`

---

## 🆘 Quick Troubleshooting

**Command not found errors?**
The Codespace might need to restart after installing global packages.

**Authentication issues with vercel/netlify?**
Make sure you complete the browser-based login when prompted.

**Still blank screen after deploy?**
- Clear browser cache (Ctrl+Shift+R)
- Check if environment variables are set
- Check browser console (F12) for errors

---

## 📝 Quick Commands

```bash
# Build locally
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod

# Deploy edge function
npx supabase functions deploy fetch-feeds

# Set CORS
npx supabase secrets set ALLOWED_ORIGINS=https://your-url.com
```

---

## ✅ Checklist

- [ ] Choose deployment platform
- [ ] Deploy application
- [ ] Get deployment URL
- [ ] Deploy edge function
- [ ] Configure CORS with deployment URL
- [ ] Test login
- [ ] Test adding feed

Ready to deploy! Pick a platform above and follow the steps! 🚀
