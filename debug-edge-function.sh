#!/bin/bash

echo "🔍 Edge Function Debug Helper"
echo "=============================="
echo ""

# Get the production URL
PROD_URL="https://google-reader-clone.vercel.app"
SUPABASE_URL="https://xdbctgzeqvdnzbbharoj.supabase.co"
SUPABASE_KEY="sb_publishable_DHuRxWWwAbKeJyEAkaVo4A_ejMx8uMw"

echo "Testing edge function endpoint..."
echo ""

# Test OPTIONS request (CORS preflight)
echo "1. Testing CORS preflight (OPTIONS)..."
curl -X OPTIONS \
  "${SUPABASE_URL}/functions/v1/fetch-feeds" \
  -H "Origin: ${PROD_URL}" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  -v 2>&1 | grep -E "< HTTP|< Access-Control"

echo ""
echo ""

# Test without auth (should get 401)
echo "2. Testing without authentication (should return 401)..."
curl -X POST \
  "${SUPABASE_URL}/functions/v1/fetch-feeds" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_KEY}" \
  -d '{"feed_url":"https://hnrss.org/frontpage"}' \
  2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Response not JSON"

echo ""
echo ""

echo "3. Check edge function status in dashboard:"
echo "   https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/functions"
echo ""
echo "4. Check edge function logs:"
echo "   https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/logs/edge-functions"
echo ""
echo "To test with authentication, you need a valid JWT token from your app."
echo "You can get this from the browser console after logging in:"
echo ""
echo "  1. Open https://google-reader-clone.vercel.app"
echo "  2. Open browser console (F12)"
echo "  3. Run: supabase.auth.getSession().then(d => console.log(d.data.session.access_token))"
echo "  4. Copy the token"
echo "  5. Run: curl -X POST \"${SUPABASE_URL}/functions/v1/fetch-feeds\" \\"
echo "            -H \"Content-Type: application/json\" \\"
echo "            -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "            -H \"apikey: ${SUPABASE_KEY}\" \\"
echo "            -d '{\"feed_url\":\"https://hnrss.org/frontpage\"}'"
