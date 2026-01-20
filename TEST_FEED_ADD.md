# Testing Feed Addition - Debug Guide

The edge function is working correctly and requires authentication. Let's debug why it's failing in the browser.

## Step 1: Check Browser Console

1. Open https://google-reader-clone.vercel.app
2. Log in
3. Open Browser Console (F12 → Console tab)
4. Try to add a feed
5. Look for errors in the console

## Step 2: Check Network Tab

1. Open Browser DevTools (F12)
2. Go to Network tab
3. Try to add a feed
4. Find the request to `fetch-feeds`
5. Click on it and check:
   - Request Headers (look for `Authorization`)
   - Response (what error message?)
   - Status code

## Step 3: Manual Test in Console

Paste this into the browser console after logging in:

```javascript
// Get current session
const { data: sessionData } = await supabase.auth.getSession();
console.log('Session:', sessionData.session ? 'Active' : 'None');
console.log('User:', sessionData.session?.user?.email);
console.log('Token:', sessionData.session?.access_token?.substring(0, 20) + '...');

// Try to call edge function
const { data, error } = await supabase.functions.invoke('fetch-feeds', {
  body: { feed_url: 'https://hnrss.org/frontpage', user_id: sessionData.session.user.id },
  headers: {
    Authorization: `Bearer ${sessionData.session.access_token}`,
  },
});

console.log('Result:', data);
console.log('Error:', error);
```

## Step 4: Check What Error You're Getting

The error message "Edge Function returned a non-2xx status code" is generic. We need the specific error.

**Possible issues:**

### Issue A: Session Expired
- **Symptom:** No auth token available
- **Solution:** Log out and log back in

### Issue B: CORS Error
- **Symptom:** Network error, blocked by CORS
- **Check:** Browser console for CORS errors
- **Solution:** Verify ALLOWED_ORIGINS is set correctly

### Issue C: Function Timeout
- **Symptom:** Takes long time, then fails
- **Solution:** Try a different feed URL

### Issue D: Invalid Token Format
- **Symptom:** 401 Unauthorized
- **Solution:** Check if token is being passed correctly

## Step 5: Get Detailed Error

Run this in console to see the actual error:

```javascript
try {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch('https://xdbctgzeqvdnzbbharoj.supabase.co/functions/v1/fetch-feeds', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': 'sb_publishable_DHuRxWWwAbKeJyEAkaVo4A_ejMx8uMw'
    },
    body: JSON.stringify({
      feed_url: 'https://hnrss.org/frontpage',
      user_id: session.user.id
    })
  });

  const result = await response.json();
  console.log('Status:', response.status);
  console.log('Result:', result);
} catch (err) {
  console.error('Error:', err);
}
```

## Step 6: Common Solutions

### Solution 1: Clear Browser Cache
```
Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

### Solution 2: Log Out and Log Back In
Fresh session token

### Solution 3: Check Supabase Function Logs
https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/logs/edge-functions

Look for recent errors from fetch-feeds function

## What to Check in Network Tab

When you try to add a feed, check the request to `fetch-feeds`:

**Request Headers should include:**
- `Authorization: Bearer eyJ...`
- `Content-Type: application/json`
- `apikey: sb_publishable_DHu...`

**Request Body should have:**
```json
{
  "feed_url": "https://example.com/feed",
  "user_id": "uuid-here"
}
```

**If missing Authorization header:**
- Session might be expired
- Try logging out and back in

**If you see 401 Unauthorized:**
- Check the response body for specific error
- Might be "Missing authorization header" or "Unauthorized"

**If you see 429:**
- Rate limited (30 requests/min)
- Wait a minute and try again

## Need More Help?

Run the Step 5 code in your browser console and send me:
1. The status code
2. The result object
3. Any error messages

This will tell us exactly what's failing!
