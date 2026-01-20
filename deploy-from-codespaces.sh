#!/bin/bash

echo "🚀 Google Reader Clone - Deployment from Codespaces"
echo "===================================================="
echo ""

# Check if build works
echo "Step 1: Testing build..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

# Ask which platform
echo "Which platform do you want to deploy to?"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) Cancel"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📦 Deploying to Vercel..."
        echo ""

        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi

        echo ""
        echo "🔐 Logging in to Vercel..."
        vercel login

        echo ""
        echo "🚀 Deploying to production..."
        vercel --prod

        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "⚠️  IMPORTANT: Don't forget to:"
        echo "1. Set environment variables in Vercel dashboard:"
        echo "   - VITE_SUPABASE_URL = https://xdbctgzeqvdnzbbharoj.supabase.co"
        echo "   - VITE_SUPABASE_ANON_KEY = sb_publishable_DHuRxWWwAbKeJyEAkaVo4A_ejMx8uMw"
        echo "2. Deploy edge function: npx supabase functions deploy fetch-feeds"
        echo "3. Set CORS: npx supabase secrets set ALLOWED_ORIGINS=https://your-url.vercel.app"
        ;;

    2)
        echo ""
        echo "📦 Deploying to Netlify..."
        echo ""

        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi

        echo ""
        echo "🔐 Logging in to Netlify..."
        netlify login

        echo ""
        echo "Setting environment variables..."
        netlify env:set VITE_SUPABASE_URL "https://xdbctgzeqvdnzbbharoj.supabase.co"
        netlify env:set VITE_SUPABASE_ANON_KEY "sb_publishable_DHuRxWWwAbKeJyEAkaVo4A_ejMx8uMw"

        echo ""
        echo "🚀 Deploying to production..."
        netlify deploy --prod

        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "⚠️  IMPORTANT: Don't forget to:"
        echo "1. Deploy edge function: npx supabase functions deploy fetch-feeds"
        echo "2. Set CORS: npx supabase secrets set ALLOWED_ORIGINS=https://your-url.netlify.app"
        ;;

    3)
        echo ""
        echo "Deployment cancelled."
        exit 0
        ;;

    *)
        echo ""
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "=================================================="
echo "🎉 Done! Now deploy the edge function and set CORS"
echo "=================================================="
