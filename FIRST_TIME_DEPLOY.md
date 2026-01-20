# 🚀 First Time Deployment to Vercel

Since the project isn't in your Vercel dashboard yet, let's set it up from scratch!

## Step 1: Login to Vercel

```bash
vercel login
```

This will open a browser window to authenticate.

## Step 2: Deploy (First Time)

```bash
vercel
```

When prompted, answer:
- **Set up and deploy?** → Yes
- **Which scope?** → Choose your account/team
- **Link to existing project?** → No
- **What's your project's name?** → `google-reader-clone` (or any name you prefer)
- **In which directory is your code located?** → `./` (press Enter)
- **Want to modify settings?** → No

This will:
1. Create a new project in Vercel
2. Deploy a preview version
3. Give you a preview URL

## Step 3: Set Environment Variables

After the preview deploys, you need to add environment variables:

**Option A: Via Command Line**
```bash
vercel env add VITE_SUPABASE_URL production
# When prompted, enter: https://xdbctgzeqvdnzbbharoj.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# When prompted, enter: sb_publishable_DHuRxWWwAbKeJyEAkaVo4A_ejMx8uMw
```

**Option B: Via Dashboard** (Easier)
1. Go to https://vercel.com/dashboard
2. Find your new `google-reader-clone` project
3. Click on it
4. Go to Settings → Environment Variables
5. Add these two variables:
   - Name: `VITE_SUPABASE_URL`
     Value: `https://xdbctgzeqvdnzbbharoj.supabase.co`
     Environment: Production ✓

   - Name: `VITE_SUPABASE_ANON_KEY`
     Value: `sb_publishable_DHuRxWWwAbKeJyEAkaVo4A_ejMx8uMw`
     Environment: Production ✓

## Step 4: Deploy to Production

Now deploy to production with the environment variables:

```bash
vercel --prod
```

This will deploy to your production URL (e.g., `https://google-reader-clone.vercel.app`)

## Step 5: Configure CORS (CRITICAL!)

After getting your production URL, configure CORS:

```bash
# Replace YOUR_URL with your actual Vercel URL
npx supabase secrets set ALLOWED_ORIGINS=https://google-reader-clone.vercel.app
```

## Step 6: Deploy Edge Function

```bash
# Login to Supabase (if not already)
npx supabase login

# Link to project (if not already)
npx supabase link --project-ref xdbctgzeqvdnzbbharoj

# Deploy the edge function
npx supabase functions deploy fetch-feeds
```

## ✅ Done!

Visit your production URL and test:
- ✅ Login page should appear (no blank screen!)
- ✅ Can sign up
- ✅ Can login
- ✅ Can add feeds
- ✅ Articles load

---

## 🔄 Future Deployments

After the first deployment, it's much simpler:

```bash
# Just run this to redeploy
vercel --prod
```

Or if you connected to GitHub, push to main and it auto-deploys!

---

## 🆘 Troubleshooting

**"Command not found: vercel"**
```bash
npm install -g vercel
```

**Login issues?**
Make sure pop-ups aren't blocked in your browser.

**Environment variables not working?**
- Make sure you set them for "Production" environment
- Redeploy after adding them: `vercel --prod`

**Still blank screen?**
- Clear browser cache (Ctrl+Shift+R)
- Check browser console (F12) for errors
- Verify environment variables are set correctly

---

## 📝 Your Deployment Info

Once deployed, save these:
- **Production URL:** `https://your-project.vercel.app`
- **Project Name:** `google-reader-clone`
- **CORS Setting:** Must match your production URL

Ready? Run `vercel login` to get started! 🚀
