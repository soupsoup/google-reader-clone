#!/bin/bash

echo "🔍 Supabase Project Status Checker"
echo "===================================="
echo ""
echo "Your Supabase Project: https://xdbctgzeqvdnzbbharoj.supabase.co"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not installed"
    echo ""
    echo "To install:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI installed"
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Not logged in to Supabase"
    echo ""
    echo "To login:"
    echo "  supabase login"
    echo ""
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Project not linked"
    echo ""
    echo "To link project:"
    echo "  supabase link --project-ref xdbctgzeqvdnzbbharoj"
    echo ""
    exit 1
fi

echo "✅ Project linked"
echo ""

# Check edge functions
echo "📋 Checking Edge Functions..."
supabase functions list

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Update .env file with your anon key"
echo "2. Deploy edge function (if not shown above):"
echo "   supabase functions deploy fetch-feeds"
echo "3. Test locally: npm run dev"
echo "4. Deploy to platform: vercel --prod"
echo "5. Set CORS: supabase secrets set ALLOWED_ORIGINS=https://your-domain.com"
echo ""
