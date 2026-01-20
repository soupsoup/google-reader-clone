#!/bin/bash

echo "🚀 Vercel Deployment Script"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with your Supabase credentials first."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI installed"
echo ""
echo "📝 Next steps:"
echo "1. Run: vercel login"
echo "2. Run: vercel"
echo "3. Follow the prompts to link/create project"
echo "4. Set environment variables in Vercel dashboard:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "5. Run: vercel --prod"
echo ""
echo "After deployment, update CORS in Supabase:"
echo "supabase secrets set ALLOWED_ORIGINS=https://your-domain.vercel.app"
echo ""

read -p "Press Enter to start Vercel login..."
vercel login
