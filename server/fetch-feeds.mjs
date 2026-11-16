// The fetch-feeds function on the VPS (Supabase ran it as an Edge Function;
// supabase/functions/fetch-feeds/index.ts is that version). Same request and
// answer: POST /functions/v1/fetch-feeds with {feed_url, user_id} or {feed_id}.
//
// Differences from the Edge Function, on purpose:
//   - It needs a signed-in user's token (Supabase's gateway accepted any key).
//   - It subscribes the signed-in user, whatever user_id the body names.
//   - It won't fetch addresses on the server's own network (localhost, private
//     ranges), so a feed URL can't be used to reach the database stack.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FOOGLE_JWT_SECRET, HOST, PORT.
import http from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import net from 'node:net';
import { createClient } from '@supabase/supabase-js';
import { XMLParser } from 'fast-xml-parser';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FOOGLE_JWT_SECRET } = process.env;
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 4417);
const MAX_BYTES = 10 * 1024 * 1024;
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ---- auth ------------------------------------------------------------------
export function verifyJwt(token, secret = FOOGLE_JWT_SECRET) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3 || !secret) return null;
  const [h, p, sig] = parts;
  let header, payload;
  try {
    header = JSON.parse(Buffer.from(h, 'base64url').toString());
    payload = JSON.parse(Buffer.from(p, 'base64url').toString());
  } catch { return null; }
  if (header.alg !== 'HS256') return null;
  const want = createHmac('sha256', secret).update(`${h}.${p}`).digest();
  const got = Buffer.from(sig, 'base64url');
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  if (payload.exp && payload.exp < Date.now() / 1000) return null;
  return payload;
}

// ---- only public addresses -------------------------------------------------
function isPrivate(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return isPrivate(v.slice(7));
  return v === '::' || v === '::1' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe8') || v.startsWith('fe9') ||
    v.startsWith('fea') || v.startsWith('feb') || v.startsWith('ff');
}

export async function assertPublicUrl(raw) {
  let url;
  try { url = new URL(raw); } catch { throw new Error('Invalid feed URL'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Feed URL must be http or https');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addrs = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivate(a.address))) throw new Error('Feed URL points at a private address');
  return url;
}

// One retry, a second apart, for failures that are usually brief: a dropped
// connection, a timeout, a 429 or a 5xx. Bad URLs, private addresses, 4xx
// answers and oversized feeds fail straight away.
export async function fetchFeed(start, { attempts = 2, pauseMs = 1000 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetchFeedOnce(start);
    } catch (err) {
      if (attempt >= attempts || !err.transient) throw err;
      await new Promise((resolve) => setTimeout(resolve, pauseMs));
    }
  }
}

const transient = (err) => Object.assign(err, { transient: true });

async function fetchFeedOnce(start) {
  let url = start;
  for (let hop = 0; hop < 5; hop++) {
    await assertPublicUrl(url);
    let res;
    try {
      res = await fetch(url, {
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(20_000),
      });
    } catch (err) {
      throw transient(new Error(err?.name === 'TimeoutError' ? 'Feed took too long to answer' : `Couldn't reach the feed: ${err?.message || err}`));
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      url = new URL(res.headers.get('location'), url).toString();
      continue;
    }
    if (!res.ok) {
      const err = new Error(`Fetch error: ${res.status}`);
      throw res.status === 429 || res.status >= 500 ? transient(err) : err;
    }
    const text = await res.text();
    if (text.length > MAX_BYTES) throw new Error('Feed is too large');
    return { xml: text, finalUrl: url };
  }
  throw new Error('Too many redirects');
}

// ---- parsing (same as the Edge Function) -----------------------------------
function getText(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && '#text' in val) return String(val['#text']);
  return String(val);
}
const iso = (v) => { if (!v) return null; const d = new Date(v); return isNaN(d) ? null : d.toISOString(); };

export function parseRSS(xml, feedUrl) {
  const doc = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' }).parse(xml);
  if (doc.rss?.channel) {
    const channel = doc.rss.channel;
    const list = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];
    const items = list.map((item) => {
      const link = getText(item.link) || '';
      return {
        guid: getText(item.guid) || link || `${feedUrl}-${getText(item.title)}`,
        title: getText(item.title) || 'Untitled',
        url: link,
        author: getText(item.author) || getText(item['dc:creator']),
        content: getText(item['content:encoded']) || getText(item.description),
        summary: getText(item.description),
        published_at: iso(getText(item.pubDate)),
      };
    });
    return { title: getText(channel.title) || 'Untitled Feed', description: getText(channel.description), site_url: getText(channel.link), items };
  }
  if (doc.feed) {
    const feed = doc.feed;
    const links = Array.isArray(feed.link) ? feed.link : feed.link ? [feed.link] : [];
    const alt = links.find((l) => l['@_rel'] === 'alternate') || links[0];
    const entries = Array.isArray(feed.entry) ? feed.entry : feed.entry ? [feed.entry] : [];
    const items = entries.map((entry) => {
      const el = Array.isArray(entry.link) ? entry.link : entry.link ? [entry.link] : [];
      const link = (el.find((l) => l['@_rel'] === 'alternate') || el[0])?.['@_href'] || '';
      return {
        guid: getText(entry.id) || link || `${feedUrl}-${getText(entry.title)}`,
        title: getText(entry.title) || 'Untitled',
        url: link,
        author: entry.author ? getText(entry.author.name) : null,
        content: getText(entry.content) || getText(entry.summary),
        summary: getText(entry.summary),
        published_at: iso(getText(entry.published) || getText(entry.updated)),
      };
    });
    return { title: getText(feed.title) || 'Untitled Feed', description: getText(feed.subtitle), site_url: alt?.['@_href'] || null, items };
  }
  throw new Error('Unable to parse feed format');
}

// ---- the function ----------------------------------------------------------
async function handle(body, claims) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { feed_url, feed_id } = body;
  const userId = claims.role === 'authenticated' ? claims.sub : body.user_id;

  let feedUrl = feed_url;
  if (feed_id && !feed_url) {
    const { data, error } = await supabase.from('feeds').select('url').eq('id', feed_id).single();
    if (error) throw new Error(`Failed to fetch feed URL: ${error.message}`);
    if (!data) throw new Error(`Feed not found with id: ${feed_id}`);
    feedUrl = data.url;
  }
  if (!feedUrl) throw new Error('feed_url or feed_id is required');

  const { xml, finalUrl } = await fetchFeed(feedUrl);
  const parsed = parseRSS(xml, finalUrl);
  const { data: feed, error: feedError } = await supabase.from('feeds').upsert({
    url: finalUrl,
    title: parsed.title,
    description: parsed.description,
    site_url: parsed.site_url,
    favicon_url: parsed.site_url ? `https://www.google.com/s2/favicons?domain=${new URL(parsed.site_url).hostname}&sz=32` : null,
    last_fetched_at: new Date().toISOString(),
  }, { onConflict: 'url' }).select().single();
  if (feedError) throw feedError;

  if (parsed.items.length > 0) {
    await supabase.from('articles').upsert(parsed.items.map((item) => ({ feed_id: feed.id, ...item })), { onConflict: 'feed_id,guid' });
  }
  // Only a new subscription carries user_id (useFeeds addFeed), as before.
  if (feed_url && userId) {
    await supabase.from('user_feeds').upsert({ user_id: userId, feed_id: feed.id }, { onConflict: 'user_id,feed_id' });
  }
  return { success: true, feed };
}

function send(res, status, body) {
  res.writeHead(status, { ...corsHeaders, 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

export const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(200, corsHeaders); return res.end('ok'); }
  if (req.method !== 'POST' || !/^\/(functions\/v1\/)?fetch-feeds\/?$/.test(req.url.split('?')[0])) return send(res, 404, { error: 'Not found' });
  const claims = verifyJwt((req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
  if (!claims || !['authenticated', 'service_role'].includes(claims.role)) return send(res, 401, { error: 'Sign in first' });
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 100_000) return send(res, 413, { error: 'Request too large' }); }
  try {
    send(res, 200, await handle(JSON.parse(raw || '{}'), claims));
  } catch (err) {
    send(res, 400, { error: err?.message || String(err) });
  }
});

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(PORT, HOST, () => console.log(`fetch-feeds on http://${HOST}:${PORT}`));
}
