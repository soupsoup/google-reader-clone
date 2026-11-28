-- Owner-only usage stats for Foogle Reader.
-- Apply on the VPS (deploy/vps/README.md, "Usage stats"):
--   sudo -u postgres psql -X -v ON_ERROR_STOP=1 -d foogle -f supabase/migrations/002_admin_stats.sql
-- Every number is a total or a count across users. No email address or per-person
-- reading history ever leaves the database through these functions.

-- Who may see the stats. Not exposed through the API (RLS on, no policies).
CREATE TABLE IF NOT EXISTS public.app_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_admins FROM PUBLIC, anon, authenticated;

-- Lets the app decide whether to show the Stats link.
CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (SELECT 1 FROM public.app_admins WHERE user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

  WITH
  u AS (SELECT id, created_at, email_confirmed_at, last_sign_in_at FROM auth.users WHERE deleted_at IS NULL),
  subs AS (SELECT user_id, feed_id, created_at FROM user_feeds),
  per_user AS (SELECT u.id, COUNT(s.feed_id) AS n FROM u LEFT JOIN subs s ON s.user_id = u.id GROUP BY u.id),
  feed_host AS (
    SELECT f.id, f.title, f.url, f.site_url,
           lower(substring(coalesce(nullif(f.site_url, ''), f.url) FROM '^[A-Za-z]+://(?:www\.)?([^/:?#]+)')) AS host
    FROM feeds f
  ),
  reads AS (SELECT user_id, article_id, read_at FROM user_articles WHERE is_read AND read_at IS NOT NULL)
  SELECT jsonb_build_object(
    'generated_at', NOW(),
    'accounts', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM u),
      'confirmed', (SELECT COUNT(*) FROM u WHERE email_confirmed_at IS NOT NULL),
      'new_7d', (SELECT COUNT(*) FROM u WHERE created_at >= NOW() - INTERVAL '7 days'),
      'new_30d', (SELECT COUNT(*) FROM u WHERE created_at >= NOW() - INTERVAL '30 days'),
      'signed_in_7d', (SELECT COUNT(*) FROM u WHERE last_sign_in_at >= NOW() - INTERVAL '7 days'),
      'signed_in_30d', (SELECT COUNT(*) FROM u WHERE last_sign_in_at >= NOW() - INTERVAL '30 days'),
      'reading_7d', (SELECT COUNT(DISTINCT user_id) FROM reads WHERE read_at >= NOW() - INTERVAL '7 days'),
      'reading_30d', (SELECT COUNT(DISTINCT user_id) FROM reads WHERE read_at >= NOW() - INTERVAL '30 days'),
      'with_no_feeds', (SELECT COUNT(*) FROM per_user WHERE n = 0),
      'signups_by_week', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('week', w.week, 'count', w.n) ORDER BY w.week)
        FROM (
          SELECT gs::date AS week, (SELECT COUNT(*) FROM u WHERE date_trunc('week', u.created_at) = gs) AS n
          FROM generate_series(date_trunc('week', NOW()) - INTERVAL '11 weeks', date_trunc('week', NOW()), INTERVAL '1 week') gs
        ) w
      ), '[]'::jsonb)
    ),
    'subscriptions', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM subs),
      'distinct_feeds', (SELECT COUNT(DISTINCT feed_id) FROM subs),
      'new_7d', (SELECT COUNT(*) FROM subs WHERE created_at >= NOW() - INTERVAL '7 days'),
      'avg_per_account', (SELECT ROUND(AVG(n)::numeric, 1) FROM per_user),
      'median_per_account', (SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY n) FROM per_user),
      'max_per_account', (SELECT COALESCE(MAX(n), 0) FROM per_user),
      'folders', (SELECT COUNT(*) FROM folders),
      'accounts_using_folders', (SELECT COUNT(DISTINCT user_id) FROM folders)
    ),
    'top_feeds', COALESCE((
      SELECT jsonb_agg(t ORDER BY t.subscribers DESC, t.title)
      FROM (
        SELECT fh.title, fh.url, fh.host, COUNT(*) AS subscribers
        FROM subs s JOIN feed_host fh ON fh.id = s.feed_id
        GROUP BY fh.id, fh.title, fh.url, fh.host
        ORDER BY COUNT(*) DESC, fh.title
        LIMIT 25
      ) t
    ), '[]'::jsonb),
    'top_sites', COALESCE((
      SELECT jsonb_agg(t ORDER BY t.subscribers DESC, t.host)
      FROM (
        SELECT fh.host, COUNT(DISTINCT s.user_id) AS subscribers, COUNT(DISTINCT fh.id) AS feeds
        FROM subs s JOIN feed_host fh ON fh.id = s.feed_id
        WHERE fh.host IS NOT NULL
        GROUP BY fh.host
        ORDER BY COUNT(DISTINCT s.user_id) DESC, fh.host
        LIMIT 25
      ) t
    ), '[]'::jsonb),
    'most_read_feeds_30d', COALESCE((
      SELECT jsonb_agg(t ORDER BY t.reads DESC, t.title)
      FROM (
        SELECT fh.title, fh.host, COUNT(*) AS reads, COUNT(DISTINCT r.user_id) AS readers
        FROM reads r JOIN articles a ON a.id = r.article_id JOIN feed_host fh ON fh.id = a.feed_id
        WHERE r.read_at >= NOW() - INTERVAL '30 days'
        GROUP BY fh.id, fh.title, fh.host
        ORDER BY COUNT(*) DESC, fh.title
        LIMIT 15
      ) t
    ), '[]'::jsonb),
    'recently_added_feeds', COALESCE((
      SELECT jsonb_agg(t ORDER BY t.first_added DESC)
      FROM (
        SELECT fh.title, fh.host, MIN(s.created_at) AS first_added, COUNT(*) AS subscribers
        FROM subs s JOIN feed_host fh ON fh.id = s.feed_id
        GROUP BY fh.id, fh.title, fh.host
        ORDER BY MIN(s.created_at) DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb),
    'reading', jsonb_build_object(
      'read_7d', (SELECT COUNT(*) FROM reads WHERE read_at >= NOW() - INTERVAL '7 days'),
      'read_30d', (SELECT COUNT(*) FROM reads WHERE read_at >= NOW() - INTERVAL '30 days'),
      'starred_total', (SELECT COUNT(*) FROM user_articles WHERE is_starred),
      'starred_30d', (SELECT COUNT(*) FROM user_articles WHERE is_starred AND starred_at >= NOW() - INTERVAL '30 days'),
      'reads_by_day', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('day', d.day, 'count', d.n) ORDER BY d.day)
        FROM (
          SELECT gs::date AS day, (SELECT COUNT(*) FROM reads WHERE read_at >= gs AND read_at < gs + INTERVAL '1 day') AS n
          FROM generate_series(date_trunc('day', NOW()) - INTERVAL '29 days', date_trunc('day', NOW()), INTERVAL '1 day') gs
        ) d
      ), '[]'::jsonb)
    ),
    'content', jsonb_build_object(
      'feeds', (SELECT COUNT(*) FROM feeds),
      'articles', (SELECT COUNT(*) FROM articles),
      'articles_7d', (SELECT COUNT(*) FROM articles WHERE created_at >= NOW() - INTERVAL '7 days')
    )
  )
  INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.is_app_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_app_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;

-- PostgREST picks up the new functions without a restart.
NOTIFY pgrst, 'reload schema';
