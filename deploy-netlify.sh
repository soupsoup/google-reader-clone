#!/bin/bash

echo "🚀 Netlify Deployment Script"
echo "============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with your Supabase credentials first."
    exit 1
fi

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

echo "✅ Netlify CLI installed"
echo ""
echo "📝 Next steps:"
echo "1. Run: netlify login"
echo "2. Run: netlify init"
echo "3. Set environment variables:"
echo "   netlify env:set VITE_SUPABASE_URL 'your-url'"
echo "   netlify env:set VITE_SUPABASE_ANON_KEY 'your-key'"
echo "4. Run: netlify deploy --prod"
echo ""
echo "After deployment, update CORS in Supabase:"
echo "supabase secrets set ALLOWED_ORIGINS=https://your-domain.netlify.app"
echo ""

read -p "Press Enter to start Netlify login..."
netlify login
