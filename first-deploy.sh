#!/bin/bash

echo "🚀 First Time Deployment to Vercel"
echo "===================================="
echo ""

# Check if build works first
echo "Step 1: Verifying build..."
npm run build > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Running build to show errors..."
    npm run build
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Login to Vercel
echo "Step 2: Login to Vercel"
echo "This will open a browser window..."
echo ""
vercel login

if [ $? -ne 0 ]; then
    echo "❌ Login failed. Please try again."
    exit 1
fi

echo ""
echo "✅ Logged in to Vercel!"
echo ""

# Initial deployment
echo "Step 3: Creating project and deploying preview"
echo ""
echo "When prompted:"
echo "  - Set up and deploy? → Yes"
echo "  - Which scope? → Choose your account"
echo "  - Link to existing project? → No"
echo "  - Project name? → google-reader-clone (or your choice)"
echo "  - Directory? → ./ (press Enter)"
echo "  - Modify settings? → No"
echo ""
read -p "Press Enter to continue..."

vercel

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed."
    exit 1
fi

echo ""
echo "✅ Preview deployed!"
echo ""

# Set environment variables
echo "Step 4: Setting environment variables"
echo ""
echo "You need to set two environment variables:"
echo "  1. VITE_SUPABASE_URL"
echo "  2. VITE_SUPABASE_ANON_KEY"
echo ""
echo "Choose how to add them:"
echo "  1) Via command line (automated)"
echo "  2) Via Vercel dashboard (I'll do it manually)"
echo ""
read -p "Enter choice (1 or 2): " env_choice

if [ "$env_choice" = "1" ]; then
    echo ""
    echo "Adding VITE_SUPABASE_URL..."
    echo "https://xdbctgzeqvdnzbbharoj.supabase.co" | vercel env add VITE_SUPABASE_URL production

    echo ""
    echo "Adding VITE_SUPABASE_ANON_KEY..."
    echo "sb_publishable_DHuRxWWwAbKeJyEAkaVo4A_ejMx8uMw" | vercel env add VITE_SUPABASE_ANON_KEY production

    echo ""
    echo "✅ Environment variables set!"
else
    echo ""
    echo "Please add these environment variables in Vercel dashboard:"
    echo ""
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Click on 'google-reader-clone' project"
    echo "3. Go to Settings → Environment Variables"
    echo "4. Add:"
    echo "   Name: VITE_SUPABASE_URL"
    echo "   Value: https://xdbctgzeqvdnzbbharoj.supabase.co"
    echo "   Environment: Production ✓"
    echo ""
    echo "   Name: VITE_SUPABASE_ANON_KEY"
    echo "   Value: sb_publishable_DHuRxWWwAbKeJyEAkaVo4A_ejMx8uMw"
    echo "   Environment: Production ✓"
    echo ""
    read -p "Press Enter after you've added the variables..."
fi

echo ""
echo "Step 5: Deploying to production"
echo ""
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Production deployment failed."
    exit 1
fi

echo ""
echo "✅ Deployed to production!"
echo ""

# Get the production URL
PROD_URL=$(vercel ls 2>/dev/null | grep "Production" | awk '{print $2}' | head -1)

if [ -z "$PROD_URL" ]; then
    echo "⚠️  Could not auto-detect your production URL."
    echo ""
    read -p "Please enter your production URL (e.g., https://your-app.vercel.app): " PROD_URL
fi

echo ""
echo "Your production URL: $PROD_URL"
echo ""

# Configure CORS
echo "Step 6: Configuring CORS in Supabase"
echo ""
echo "This is CRITICAL for the app to work!"
echo ""
read -p "Deploy edge function and configure CORS now? (y/n): " deploy_edge

if [ "$deploy_edge" = "y" ] || [ "$deploy_edge" = "Y" ]; then
    echo ""
    echo "Logging in to Supabase..."
    npx supabase login

    echo ""
    echo "Linking to project..."
    npx supabase link --project-ref xdbctgzeqvdnzbbharoj

    echo ""
    echo "Deploying edge function..."
    npx supabase functions deploy fetch-feeds

    echo ""
    echo "Setting CORS..."
    npx supabase secrets set ALLOWED_ORIGINS=$PROD_URL

    echo ""
    echo "✅ Edge function deployed and CORS configured!"
else
    echo ""
    echo "⚠️  Remember to run these commands later:"
    echo ""
    echo "  npx supabase login"
    echo "  npx supabase link --project-ref xdbctgzeqvdnzbbharoj"
    echo "  npx supabase functions deploy fetch-feeds"
    echo "  npx supabase secrets set ALLOWED_ORIGINS=$PROD_URL"
fi

echo ""
echo "===================================="
echo "🎉 Deployment Complete!"
echo "===================================="
echo ""
echo "Your app is live at: $PROD_URL"
echo ""
echo "Test checklist:"
echo "  ✓ Visit your URL"
echo "  ✓ Sign up with test account"
echo "  ✓ Login"
echo "  ✓ Add feed: https://hnrss.org/frontpage"
echo "  ✓ Verify articles load"
echo ""
echo "🚀 Happy reading!"
