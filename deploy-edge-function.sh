#!/bin/bash

# Script to deploy the updated fetch-feeds edge function to Supabase

echo "========================================="
echo "Supabase Edge Function Deployment Script"
echo "========================================="
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo ""
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo "  or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✓ Supabase CLI found"
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ You're not logged in to Supabase."
    echo ""
    echo "Please run: supabase login"
    exit 1
fi

echo "✓ Logged in to Supabase"
echo ""

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Project is not linked yet."
    echo ""
    echo "Available projects:"
    supabase projects list
    echo ""
    read -p "Enter your project reference (from above list): " PROJECT_REF
    echo ""
    echo "Linking project..."
    supabase link --project-ref "$PROJECT_REF"
    if [ $? -ne 0 ]; then
        echo "❌ Failed to link project"
        exit 1
    fi
fi

echo "✓ Project linked"
echo ""

# Deploy the edge function
echo "Deploying fetch-feeds edge function..."
echo ""
supabase functions deploy fetch-feeds

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ Edge function deployed successfully!"
    echo "========================================="
    echo ""
    echo "The refresh functionality should now work properly."
else
    echo ""
    echo "❌ Deployment failed. Please check the error above."
    exit 1
fi
