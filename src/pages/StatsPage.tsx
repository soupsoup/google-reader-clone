import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Owner-only usage stats. The numbers come from the admin_stats() database function,
// which refuses anyone not listed in app_admins and returns totals only.

interface Stats {
  generated_at: string;
  accounts: {
    total: number; confirmed: number; new_7d: number; new_30d: number;
    signed_in_7d: number; signed_in_30d: number; reading_7d: number; reading_30d: number;
    with_no_feeds: number; signups_by_week: { week: string; count: number }[];
  };
  subscriptions: {
    total: number; distinct_feeds: number; new_7d: number; avg_per_account: number | null;
    median_per_account: number | null; max_per_account: number; folders: number; accounts_using_folders: number;
  };
  top_feeds: { title: string; url: string; host: string | null; subscribers: number }[];
  top_sites: { host: string; subscribers: number; feeds: number }[];
  most_read_feeds_30d: { title: string; host: string | null; reads: number; readers: number }[];
  recently_added_feeds: { title: string; host: string | null; first_added: string; subscribers: number }[];
  reading: {
    read_7d: number; read_30d: number; starred_total: number; starred_30d: number;
    reads_by_day: { day: string; count: number }[];
  };
  content: { feeds: number; articles: number; articles_7d: number };
}

const fmt = (n: number | null | undefined) => (n ?? 0).toLocaleString('en-US');
const shortDate = (d: string) => new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{value}</div>
      {note && <div className="mt-1 text-[12px] text-gray-500">{note}</div>}
    </div>
  );
}

function Bars({ data, label }: { data: { key: string; count: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div>
      <div className="flex items-end gap-1 h-32" role="img" aria-label={label}>
        {data.map((d) => (
          <div key={d.key} className="flex-1 flex flex-col justify-end h-full" title={`${shortDate(d.key)}: ${d.count}`}>
            <div className="bg-[#4d90fe] rounded-t-sm min-h-[2px]" style={{ height: `${(d.count / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-gray-500">
        <span>{data.length ? shortDate(data[0].key) : ''}</span>
        <span>{data.length ? shortDate(data[data.length - 1].key) : ''}</span>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-gray-200 bg-white">
      <h2 className="px-4 py-2 border-b border-gray-200 bg-[#f5f5f5] font-bold text-[14px] text-gray-900">{title}</h2>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  if (!rows.length) return <p className="text-[14px] text-gray-500">Nothing yet.</p>;
  return (
    <table className="w-full text-[14px]">
      <thead>
        <tr className="text-left text-[12px] uppercase tracking-wide text-gray-500">
          {head.map((h, i) => <th key={h} className={`pb-2 font-semibold ${i > 0 ? 'text-right whitespace-nowrap pl-4' : ''}`}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-gray-100">
            {r.map((c, j) => (
              <td key={j} className={`py-1.5 ${j > 0 ? 'text-right tabular-nums text-gray-700 whitespace-nowrap pl-4' : 'text-gray-900 truncate max-w-0 w-full'}`}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function StatsPage() {
  const { data, error, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_stats');
      if (error) throw error;
      return data as Stats;
    },
    staleTime: 60_000,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1 text-[14px] text-[#15c] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Reader
          </Link>
          <h1 className="text-xl font-normal text-gray-900">Usage stats</h1>
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-auto flex items-center gap-1 text-[13px] text-gray-600 hover:text-gray-900"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {isLoading && <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>}
        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
            {(error as { message?: string }).message === 'not allowed'
              ? 'Stats are only available to the site owner.'
              : `Couldn't load stats: ${(error as { message?: string }).message || 'unknown error'}`}
          </p>
        )}
        {data && (
          <>
            <p className="text-[12px] text-gray-500">As of {new Date(data.generated_at).toLocaleString('en-US')}. Totals only; no individual reading history.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Tile label="Accounts" value={fmt(data.accounts.total)} note={`${fmt(data.accounts.confirmed)} confirmed`} />
              <Tile label="New accounts" value={fmt(data.accounts.new_7d)} note={`last 7 days · ${fmt(data.accounts.new_30d)} in 30`} />
              <Tile label="Active readers" value={fmt(data.accounts.reading_7d)} note={`read something in 7 days · ${fmt(data.accounts.reading_30d)} in 30`} />
              <Tile label="Signed in" value={fmt(data.accounts.signed_in_7d)} note={`last 7 days · ${fmt(data.accounts.signed_in_30d)} in 30`} />
              <Tile label="Subscriptions" value={fmt(data.subscriptions.total)} note={`${fmt(data.subscriptions.distinct_feeds)} different feeds`} />
              <Tile label="Feeds per account" value={String(data.subscriptions.avg_per_account ?? 0)} note={`median ${data.subscriptions.median_per_account ?? 0} · most ${fmt(data.subscriptions.max_per_account)}`} />
              <Tile label="Stories read" value={fmt(data.reading.read_7d)} note={`last 7 days · ${fmt(data.reading.read_30d)} in 30`} />
              <Tile label="Starred" value={fmt(data.reading.starred_total)} note={`${fmt(data.reading.starred_30d)} in the last 30 days`} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Section title="New accounts per week (12 weeks)">
                <Bars label="New accounts per week" data={data.accounts.signups_by_week.map((w) => ({ key: w.week, count: w.count }))} />
              </Section>
              <Section title="Stories read per day (30 days)">
                <Bars label="Stories read per day" data={data.reading.reads_by_day.map((d) => ({ key: d.day, count: d.count }))} />
              </Section>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Section title="Most subscribed feeds">
                <Table head={['Feed', 'Subscribers']} rows={data.top_feeds.map((f) => [f.host ? `${f.title} · ${f.host}` : f.title, fmt(f.subscribers)])} />
              </Section>
              <Section title="Most subscribed sites">
                <Table head={['Site', 'Subscribers', 'Feeds']} rows={data.top_sites.map((s) => [s.host, fmt(s.subscribers), fmt(s.feeds)])} />
              </Section>
              <Section title="Most read feeds (30 days)">
                <Table head={['Feed', 'Reads', 'Readers']} rows={data.most_read_feeds_30d.map((f) => [f.title, fmt(f.reads), fmt(f.readers)])} />
              </Section>
              <Section title="Newest feeds added">
                <Table head={['Feed', 'First added', 'Subscribers']} rows={data.recently_added_feeds.map((f) => [f.host ? `${f.title} · ${f.host}` : f.title, shortDate(f.first_added), fmt(f.subscribers)])} />
              </Section>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Tile label="Accounts with no feeds" value={fmt(data.accounts.with_no_feeds)} note="signed up but never subscribed" />
              <Tile label="Accounts using folders" value={fmt(data.subscriptions.accounts_using_folders)} note={`${fmt(data.subscriptions.folders)} ${data.subscriptions.folders === 1 ? 'folder' : 'folders'} in total`} />
              <Tile label="Feeds fetched" value={fmt(data.content.feeds)} note="across everyone" />
              <Tile label="Stories stored" value={fmt(data.content.articles)} note={`${fmt(data.content.articles_7d)} added this week`} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
