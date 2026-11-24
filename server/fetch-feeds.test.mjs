// Run with: node --test server/fetch-feeds.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchFeed, verifyJwt, assertPublicUrl } from './fetch-feeds.mjs';

const URL = 'http://93.184.215.14/feed.xml'; // a public IP literal, so no DNS lookup
const ok = () => new Response('<rss></rss>', { status: 200 });

function stubFetch(answers) {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    const next = answers.shift();
    if (next instanceof Error) throw next;
    return next();
  };
  return calls;
}

test('retries once after a dropped connection', async () => {
  const calls = stubFetch([new TypeError('fetch failed'), ok]);
  const { xml } = await fetchFeed(URL, { pauseMs: 0 });
  assert.equal(xml, '<rss></rss>');
  assert.equal(calls.length, 2);
});

test('retries once after a 503, then gives up', async () => {
  const calls = stubFetch([() => new Response('', { status: 503 }), () => new Response('', { status: 502 })]);
  await assert.rejects(fetchFeed(URL, { pauseMs: 0 }), /Fetch error: 502/);
  assert.equal(calls.length, 2);
});

test('does not retry a 404', async () => {
  const calls = stubFetch([() => new Response('', { status: 404 }), ok]);
  await assert.rejects(fetchFeed(URL, { pauseMs: 0 }), /Fetch error: 404/);
  assert.equal(calls.length, 1);
});

test('does not retry a private address', async () => {
  const calls = stubFetch([ok]);
  await assert.rejects(fetchFeed('http://127.0.0.1/feed', { pauseMs: 0 }), /private address/);
  assert.equal(calls.length, 0);
});

test('a timeout counts as brief and is retried', async () => {
  const timeout = Object.assign(new Error('timed out'), { name: 'TimeoutError' });
  const calls = stubFetch([timeout, ok]);
  await fetchFeed(URL, { pauseMs: 0 });
  assert.equal(calls.length, 2);
});

test('rejects a token whose header or payload is JSON null instead of throwing', () => {
  // bnVsbA is base64url for "null", e30 for "{}".
  assert.equal(verifyJwt('bnVsbA.e30.eA', 'secret'), null);
  assert.equal(verifyJwt('e30.bnVsbA.eA', 'secret'), null);
  assert.equal(verifyJwt('MQ.MQ.eA', 'secret'), null);
});

test('blocks IPv4-mapped IPv6 addresses that point at private ranges', async () => {
  for (const u of ['http://[::ffff:127.0.0.1]/', 'http://[::ffff:7f00:1]/', 'http://[0:0:0:0:0:ffff:a00:1]/', 'http://[::ffff:192.168.1.1]/']) {
    await assert.rejects(assertPublicUrl(u), /private address/, u);
  }
  await assertPublicUrl('http://[::ffff:93.184.215.14]/');
});
