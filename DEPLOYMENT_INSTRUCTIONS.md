# Edge Function Deployment Instructions

## Problem
The frontend changes have been deployed to Vercel, but the Supabase edge function changes haven't been deployed yet. This is why the refresh functionality isn't working.

## What Needs to Be Deployed
The file `supabase/functions/fetch-feeds/index.ts` was updated to support refreshing feeds by `feed_id` (not just `feed_url`). This change is critical for the refresh functionality to work.

## Deployment Options

### Option 1: Using Supabase CLI (Recommended)

1. **Login to Supabase CLI** (if not already logged in):
   ```bash
   supabase login
   ```

2. **Navigate to project directory**:
   ```bash
   cd /workspace/google-reader-clone
   ```

3. **Link your project** (if not already linked):
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

   You can find your project ref in the Supabase dashboard URL:
   `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

4. **Deploy the edge function**:
   ```bash
   supabase functions deploy fetch-feeds
   ```

   Or use the provided script:
   ```bash
   ./deploy-edge-function.sh
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the left sidebar
3. Find the `fetch-feeds` function
4. Click **Edit** or **Deploy**
5. Copy the entire contents of `supabase/functions/fetch-feeds/index.ts`
6. Paste it into the editor
7. Click **Deploy** or **Save**

## Key Changes in the Edge Function

The updated edge function now accepts both `feed_url` AND `feed_id`:

**Before** (lines 108):
```typescript
const { feed_url, user_id } = await req.json();
if (!feed_url) throw new Error("feed_url is required");
```

**After** (lines 108-124):
```typescript
const { feed_url, feed_id, user_id } = await req.json();

// If feed_id is provided, fetch the feed URL from the database
let feedUrl = feed_url;
if (feed_id && !feed_url) {
  const { data: feedData, error: fetchError } = await supabase
    .from('feeds')
    .select('url')
    .eq('id', feed_id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch feed URL: ${fetchError.message}`);
  if (!feedData) throw new Error(`Feed not found with id: ${feed_id}`);
  feedUrl = feedData.url;
}

if (!feedUrl) throw new Error("feed_url or feed_id is required");
```

This allows the frontend's `refreshAllFeeds` function to pass `feed_id` when refreshing all subscribed feeds.

## Verification

After deploying, the refresh functionality should work:

1. Open your app in the browser
2. Click the refresh button in the header (spinning icon)
3. You should see:
   - Button animates and starts spinning
   - Toast notification: "Refreshing feeds..."
   - Toast notification: "All feeds refreshed successfully!"
   - Feed counts update with new articles

## Troubleshooting

If refresh still doesn't work after deployment:

1. **Check browser console** for errors
2. **Check Supabase Edge Function logs**:
   - Go to Edge Functions → fetch-feeds → Logs
   - Look for any errors when the refresh is triggered
3. **Verify environment variables** are set correctly in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Need Help?

If you encounter any issues during deployment, please share:
- The error message from the CLI or dashboard
- Screenshots of the Supabase Edge Function logs
- Any console errors from the browser
