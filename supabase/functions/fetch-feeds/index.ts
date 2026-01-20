import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedItem {
  guid: string;
  title: string;
  url: string;
  author: string | null;
  content: string | null;
  summary: string | null;
  published_at: string | null;
}

interface ParsedFeed {
  title: string;
  description: string | null;
  site_url: string | null;
  items: FeedItem[];
}

function getText(val: unknown): string | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && '#text' in val) return String((val as Record<string, unknown>)['#text']);
  return String(val);
}

function parseRSS(xml: string, feedUrl: string): ParsedFeed {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  const doc = parser.parse(xml);

  // RSS 2.0
  if (doc.rss?.channel) {
    const channel = doc.rss.channel;
    const title = getText(channel.title) || 'Untitled Feed';
    const items: FeedItem[] = [];
    const itemElements = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];

    for (const item of itemElements) {
      const itemLink = getText(item.link) || '';
      items.push({
        guid: getText(item.guid) || itemLink || `${feedUrl}-${getText(item.title)}`,
        title: getText(item.title) || 'Untitled',
        url: itemLink,
        author: getText(item.author) || getText(item['dc:creator']),
        content: getText(item['content:encoded']) || getText(item.description),
        summary: getText(item.description),
        published_at: getText(item.pubDate) ? new Date(getText(item.pubDate)!).toISOString() : null,
      });
    }
    return { title, description: getText(channel.description), site_url: getText(channel.link), items };
  }

  // Atom
  if (doc.feed) {
    const feed = doc.feed;
    const links = Array.isArray(feed.link) ? feed.link : feed.link ? [feed.link] : [];
    const altLink = links.find((l: any) => l['@_rel'] === 'alternate') || links[0];
    
    const items: FeedItem[] = [];
    const entries = Array.isArray(feed.entry) ? feed.entry : feed.entry ? [feed.entry] : [];

    for (const entry of entries) {
      const entryLinks = Array.isArray(entry.link) ? entry.link : entry.link ? [entry.link] : [];
      const entryAltLink = entryLinks.find((l: any) => l['@_rel'] === 'alternate') || entryLinks[0];
      const entryLink = entryAltLink?.['@_href'] || '';
      items.push({
        guid: getText(entry.id) || entryLink || `${feedUrl}-${getText(entry.title)}`,
        title: getText(entry.title) || 'Untitled',
        url: entryLink,
        author: entry.author ? getText(entry.author.name) : null,
        content: getText(entry.content) || getText(entry.summary),
        summary: getText(entry.summary),
        published_at: (getText(entry.published) || getText(entry.updated)) ? new Date((getText(entry.published) || getText(entry.updated))!).toISOString() : null,
      });
    }
    return { title: getText(feed.title) || 'Untitled Feed', description: getText(feed.subtitle), site_url: altLink?.['@_href'] || null, items };
  }

  throw new Error('Unable to parse feed format');
}

async function fetchFeed(url: string) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
  return { xml: await res.text(), finalUrl: res.url };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { feed_url, user_id } = await req.json();
    if (!feed_url) throw new Error("feed_url is required");

    const { xml, finalUrl } = await fetchFeed(feed_url);
    const parsed = parseRSS(xml, finalUrl);

    const { data: feed, error: feedError } = await supabase
      .from('feeds')
      .upsert({
        url: finalUrl,
        title: parsed.title,
        description: parsed.description,
        site_url: parsed.site_url,
        favicon_url: parsed.site_url ? `https://www.google.com/s2/favicons?domain=${new URL(parsed.site_url).hostname}&sz=32` : null,
        last_fetched_at: new Date().toISOString(),
      }, { onConflict: 'url' })
      .select().single();

    if (feedError) throw feedError;

    if (parsed.items.length > 0) {
      const articles = parsed.items.map(item => ({
        feed_id: feed.id,
        guid: item.guid,
        title: item.title,
        url: item.url,
        author: item.author,
        content: item.content,
        summary: item.summary,
        published_at: item.published_at,
      }));
      await supabase.from('articles').upsert(articles, { onConflict: 'feed_id,guid' });
    }

    if (user_id) {
      await supabase.from('user_feeds').upsert({ user_id, feed_id: feed.id }, { onConflict: 'user_id,feed_id' });
    }

    return new Response(JSON.stringify({ success: true, feed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});