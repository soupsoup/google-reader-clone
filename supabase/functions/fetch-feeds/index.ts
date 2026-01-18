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

  // Try RSS 2.0 first
  if (doc.rss?.channel) {
    const channel = doc.rss.channel;
    const title = getText(channel.title) || 'Untitled Feed';
    const description = getText(channel.description);
    const link = getText(channel.link);

    const items: FeedItem[] = [];
    const itemElements = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];

    for (const item of itemElements) {
      const itemTitle = getText(item.title) || 'Untitled';
      const itemLink = getText(item.link) || '';
      const guid = getText(item.guid) || itemLink || `${feedUrl}-${itemTitle}`;
      const author = getText(item.author) || getText(item['dc:creator']);
      const content = getText(item['content:encoded']) || getText(item.description);
      const summary = getText(item.description);
      const pubDate = getText(item.pubDate);

      items.push({
        guid,
        title: itemTitle,
        url: itemLink,
        author,
        content,
        summary: content !== summary ? summary : null,
        published_at: pubDate ? new Date(pubDate).toISOString() : null,
      });
    }

    return { title, description, site_url: link, items };
  }

  // Try Atom
  if (doc.feed) {
    const feed = doc.feed;
    const title = getText(feed.title) || 'Untitled Feed';
    const subtitle = getText(feed.subtitle);
    const links = Array.isArray(feed.link) ? feed.link : feed.link ? [feed.link] : [];
    const altLink = links.find((l: Record<string, unknown>) => l['@_rel'] === 'alternate') || links[0];
    const link = altLink?.['@_href'] || null;

    const items: FeedItem[] = [];
    const entries = Array.isArray(feed.entry) ? feed.entry : feed.entry ? [feed.entry] : [];

    for (const entry of entries) {
      const entryTitle = getText(entry.title) || 'Untitled';
      const entryLinks = Array.isArray(entry.link) ? entry.link : entry.link ? [entry.link] : [];
      const entryAltLink = entryLinks.find((l: Record<string, unknown>) => l['@_rel'] === 'alternate') || entryLinks[0];
      const entryLink = entryAltLink?.['@_href'] || '';
      const id = getText(entry.id) || entryLink || `${feedUrl}-${entryTitle}`;
      const author = entry.author ? getText(entry.author.name) : null;
      const content = getText(entry.content) || getText(entry.summary);
      const summary = getText(entry.summary);
      const published = getText(entry.published) || getText(entry.updated);

      items.push({
        guid: id,
        title: entryTitle,
        url: entryLink,
        author,
        content,
        summary: content !== summary ? summary : null,
        published_at: published ? new Date(published).toISOString() : null,
      });
    }

    return { title, description: subtitle, site_url: link, items };
  }

  throw new Error('Unable to parse feed: Unknown format');
}

async function fetchFeed(url: string): Promise<{ xml: string; finalUrl: string }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'GoogleReaderClone/1.0',
      'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status}`);
  }

  const xml = await response.text();
  return { xml, finalUrl: response.url };
}

function extractFavicon(siteUrl: string | null): string | null {
  if (!siteUrl) return null;
  try {
    const url = new URL(siteUrl);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { feed_url, feed_id, user_id } = await req.json();

    // If feed_url is provided, this is a new subscription
    if (feed_url) {
      // Fetch and parse the feed
      const { xml, finalUrl } = await fetchFeed(feed_url);
      const parsed = parseRSS(xml, finalUrl);

      // Check if feed already exists
      let { data: existingFeed } = await supabase
        .from('feeds')
        .select('id')
        .eq('url', finalUrl)
        .single();

      let feedId: string;

      if (existingFeed) {
        feedId = existingFeed.id;
        // Update feed metadata
        await supabase
          .from('feeds')
          .update({
            title: parsed.title,
            description: parsed.description,
            site_url: parsed.site_url,
            favicon_url: extractFavicon(parsed.site_url),
            last_fetched_at: new Date().toISOString(),
          })
          .eq('id', feedId);
      } else {
        // Insert new feed
        const { data: newFeed, error: feedError } = await supabase
          .from('feeds')
          .insert({
            url: finalUrl,
            title: parsed.title,
            description: parsed.description,
            site_url: parsed.site_url,
            favicon_url: extractFavicon(parsed.site_url),
            last_fetched_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (feedError) throw feedError;
        feedId = newFeed.id;
      }

      // Insert articles
      if (parsed.items.length > 0) {
        const articles = parsed.items.map(item => ({
          feed_id: feedId,
          guid: item.guid,
          title: item.title,
          url: item.url,
          author: item.author,
          content: item.content,
          summary: item.summary,
          published_at: item.published_at,
        }));

        await supabase
          .from('articles')
          .upsert(articles, { onConflict: 'feed_id,guid', ignoreDuplicates: true });
      }

      // Subscribe user to feed if user_id provided
      if (user_id) {
        await supabase
          .from('user_feeds')
          .upsert({
            user_id,
            feed_id: feedId,
          }, { onConflict: 'user_id,feed_id' });
      }

      // Return the feed data
      const { data: feed } = await supabase
        .from('feeds')
        .select('*')
        .eq('id', feedId)
        .single();

      return new Response(
        JSON.stringify({ success: true, feed, article_count: parsed.items.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If feed_id is provided, refresh that specific feed
    if (feed_id) {
      const { data: feed } = await supabase
        .from('feeds')
        .select('url')
        .eq('id', feed_id)
        .single();

      if (!feed) {
        throw new Error('Feed not found');
      }

      const { xml } = await fetchFeed(feed.url);
      const parsed = parseRSS(xml, feed.url);

      // Update feed metadata
      await supabase
        .from('feeds')
        .update({
          title: parsed.title,
          description: parsed.description,
          site_url: parsed.site_url,
          favicon_url: extractFavicon(parsed.site_url),
          last_fetched_at: new Date().toISOString(),
        })
        .eq('id', feed_id);

      // Insert new articles
      if (parsed.items.length > 0) {
        const articles = parsed.items.map(item => ({
          feed_id: feed_id,
          guid: item.guid,
          title: item.title,
          url: item.url,
          author: item.author,
          content: item.content,
          summary: item.summary,
          published_at: item.published_at,
        }));

        await supabase
          .from('articles')
          .upsert(articles, { onConflict: 'feed_id,guid', ignoreDuplicates: true });
      }

      return new Response(
        JSON.stringify({ success: true, article_count: parsed.items.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No feed_url or feed_id - refresh all feeds
    const { data: feeds } = await supabase
      .from('feeds')
      .select('id, url')
      .or(`last_fetched_at.is.null,last_fetched_at.lt.${new Date(Date.now() - 15 * 60 * 1000).toISOString()}`);

    const results = [];
    for (const feed of feeds || []) {
      try {
        const { xml } = await fetchFeed(feed.url);
        const parsed = parseRSS(xml, feed.url);

        await supabase
          .from('feeds')
          .update({
            title: parsed.title,
            description: parsed.description,
            site_url: parsed.site_url,
            favicon_url: extractFavicon(parsed.site_url),
            last_fetched_at: new Date().toISOString(),
          })
          .eq('id', feed.id);

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

          await supabase
            .from('articles')
            .upsert(articles, { onConflict: 'feed_id,guid', ignoreDuplicates: true });
        }

        results.push({ feed_id: feed.id, success: true, article_count: parsed.items.length });
      } catch (error) {
        results.push({ feed_id: feed.id, success: false, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
