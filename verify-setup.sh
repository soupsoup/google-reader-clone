#!/bin/bash

echo "🔍 Verifying Setup for Deployment"
echo "===================================="
echo ""

ERRORS=0

# Check .env file
echo "1. Checking .env file..."
if [ ! -f ".env" ]; then
    echo "   ❌ .env file not found"
    ((ERRORS++))
else
    if grep -q "your-anon-key-here" .env; then
        echo "   ⚠️  .env file needs your actual anon key"
        echo "      Get it from: https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/settings/api"
        ((ERRORS++))
    else
        echo "   ✅ .env file configured"
    fi
fi
echo ""

# Check if node_modules exists
echo "2. Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  Dependencies not installed"
    echo "      Run: npm install"
    ((ERRORS++))
else
    echo "   ✅ Dependencies installed"
fi
echo ""

# Check Supabase CLI
echo "3. Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo "   ⚠️  Supabase CLI not installed"
    echo "      Run: npm install -g supabase"
    ((ERRORS++))
else
    echo "   ✅ Supabase CLI installed ($(supabase --version))"
fi
echo ""

# Check deployment CLIs
echo "4. Checking deployment tools..."
HAS_DEPLOY_TOOL=false

if command -v vercel &> /dev/null; then
    echo "   ✅ Vercel CLI installed"
    HAS_DEPLOY_TOOL=true
fi

if command -v netlify &> /dev/null; then
    echo "   ✅ Netlify CLI installed"
    HAS_DEPLOY_TOOL=true
fi

if command -v docker &> /dev/null; then
    echo "   ✅ Docker installed"
    HAS_DEPLOY_TOOL=true
fi

if [ "$HAS_DEPLOY_TOOL" = false ]; then
    echo "   ⚠️  No deployment tools installed"
    echo "      Install one of:"
    echo "      - Vercel: npm install -g vercel"
    echo "      - Netlify: npm install -g netlify-cli"
    echo "      - Docker: https://docs.docker.com/get-docker/"
    ((ERRORS++))
fi
echo ""

# Summary
echo "===================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ All checks passed! You're ready to deploy."
    echo ""
    echo "Next steps:"
    echo "1. Deploy edge function: supabase functions deploy fetch-feeds"
    echo "2. Test locally: npm run dev"
    echo "3. Deploy to platform: vercel --prod (or netlify deploy --prod)"
    echo "4. Set CORS: supabase secrets set ALLOWED_ORIGINS=https://your-domain.com"
else
    echo "⚠️  Found $ERRORS issue(s). Please fix them before deploying."
    echo ""
    echo "See YOUR_DEPLOYMENT_STEPS.md for detailed instructions."
fi
echo ""
