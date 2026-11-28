import { Link } from 'react-router-dom';
import { Rss, Star, ChevronDown } from 'lucide-react';

// Splash page for signed-out visitors. It leans on the memory of Google Reader (2005 to 2013),
// using plain words and the classic layout, never Google's logo or brand colors.

const SAMPLE = [
  { feed: 'The Verge', title: 'The quiet comeback of RSS', snippet: 'Feed readers are back, and the people who used them never really left.', time: '9:41 AM', starred: false },
  { feed: 'Ars Technica', title: 'What the new chip rules mean for laptops', snippet: 'Prices, battery life and the parts that are suddenly hard to get.', time: '9:12 AM', starred: true },
  { feed: 'Kottke', title: 'Things I still miss from the 2000s internet', snippet: 'Blogrolls, permalinks, and a reader that showed you everything.', time: '8:55 AM', starred: false },
  { feed: 'Local News', title: 'Town meeting moves to Thursday night', snippet: 'The budget vote and the school building plan are both on the agenda.', time: 'Nov 27', starred: false },
  { feed: 'Hacker News', title: 'Show HN: a reader that respects your time', snippet: 'No ranking, no feed tuning, just the posts in the order they came out.', time: 'Nov 27', starred: false },
];

const REMEMBER = [
  ['j / k', 'Next item, previous item. Muscle memory included.'],
  ['All items (1000+)', 'The unread count that taunted you every Monday morning. Still here.'],
  ['Mark all as read', 'The most satisfying button on the internet, back where it belongs.'],
  ['Starred items', 'Press s to save a story for later, the way you always did.'],
  ['Folders', 'Tech, News, Friends, "Read eventually". Organize feeds however you like.'],
  ['subscriptions.xml', 'Still have your Google Takeout export? Import it as OPML and pick up where you left off.'],
];

const KEYS = [
  ['j', 'next item'],
  ['k', 'previous item'],
  ['s', 'star item'],
  ['m', 'mark as read / unread'],
  ['o', 'open item'],
  ['shift + a', 'mark all as read'],
  ['/', 'search'],
];

const btn = 'rounded-sm border border-[#ccc] bg-gradient-to-b from-white to-[#f1f1f1]';

function ClassicReaderPreview() {
  return (
    <div className="rounded border border-[#c3d9ff] bg-white shadow-2xl overflow-hidden text-left font-[Arial,sans-serif] text-[13px] text-[#222]" aria-hidden="true">
      <div className="flex items-center gap-3 px-3 py-2 bg-[#f5f5f5] border-b border-[#ccc]">
        <span className="font-bold text-[#222] text-[15px]">Reader</span>
        <div className="flex-1 h-6 rounded-sm border border-[#ccc] bg-white px-2 text-[12px] leading-6 text-[#999]">Search all items</div>
      </div>
      <div className="flex">
        <div className="hidden sm:block w-44 flex-shrink-0 whitespace-nowrap border-r border-[#ebebeb] bg-white py-2">
          <div className={`mx-3 mb-3 inline-block px-3 py-1 text-[12px] font-bold text-[#222] ${btn}`}>Add a subscription</div>
          <div className="px-3 py-1">Home</div>
          <div className="px-3 py-1 font-bold bg-[#e0ecff]">All items (1000+)</div>
          <div className="px-3 py-1">Starred items</div>
          <div className="px-3 pt-3 pb-1 text-[11px] font-bold text-[#777] flex items-center gap-1"><ChevronDown className="h-3 w-3" />Subscriptions</div>
          <div className="pl-6 pr-3 py-0.5 font-bold">Tech (312)</div>
          <div className="pl-9 pr-3 py-0.5">The Verge (128)</div>
          <div className="pl-9 pr-3 py-0.5">Ars Technica (96)</div>
          <div className="pl-6 pr-3 py-0.5 font-bold">Blogs (41)</div>
          <div className="pl-6 pr-3 py-0.5">Local News (3)</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#ebebeb] text-[12px]">
            <span className="font-bold text-[15px] mr-2">All items</span>
            <span className={`px-2 py-0.5 ${btn}`}>Mark all as read</span>
            <span className={`px-2 py-0.5 ${btn}`}>Refresh</span>
            <span className="ml-auto text-[#777] hidden md:inline">Expanded · <span className="text-[#15c] underline">List</span></span>
          </div>
          <ul>
            {SAMPLE.map((s, i) => (
              <li
                key={s.title}
                className={`flex items-center gap-2 px-3 py-1.5 border-b border-[#ebebeb] ${i === 0 ? 'outline outline-2 outline-[#6688ee] -outline-offset-2' : i === 3 ? 'bg-[#f3f5fc]' : ''}`}
              >
                <Star className={`h-3.5 w-3.5 flex-shrink-0 ${s.starred ? 'text-[#e8b600] fill-[#e8b600]' : 'text-[#bbb]'}`} />
                <span className="w-24 flex-shrink-0 truncate text-[#555]">{s.feed}</span>
                <span className="min-w-0 truncate">
                  <span className={i === 3 ? 'text-[#555]' : 'font-bold'}>{s.title}</span>
                  <span className="text-[#777]"> - {s.snippet}</span>
                </span>
                <span className="ml-auto pl-2 flex-shrink-0 text-[#777]">{s.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Rss className="h-7 w-7" />
          <span className="text-xl font-bold">Foogle Reader</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/auth" className="hidden sm:inline text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">
            Sign in
          </Link>
          <Link to="/auth?mode=signup" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2">
            Create account
          </Link>
        </nav>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16 grid lg:grid-cols-[1fr_1.15fr] gap-12 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">For everyone who never got over July 1, 2013</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight">You still miss Google Reader. So do we.</h1>
            <p className="mt-5 text-lg text-gray-600 dark:text-gray-300 max-w-xl">
              Remember starting every morning with <em>All items (1000+)</em>, pressing j until it hit zero, and
              actually seeing everything your favorite sites posted? Foogle Reader brings that back. Same idea, same
              keys, same quiet list of stories in the order they were published.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth?mode=signup" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3">
                Bring back my reader
              </Link>
              <Link to="/auth" className="rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium px-6 py-3">
                Sign in
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No ads, no algorithm, no "For You" tab. Just your subscriptions.</p>
          </div>
          <ClassicReaderPreview />
        </section>

        <section className="bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-2xl sm:text-3xl font-bold">Everything you remember</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl">The parts of Reader people still bring up more than a decade later, rebuilt for today's web.</p>
            <dl className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
              {REMEMBER.map(([term, body]) => (
                <div key={term}>
                  <dt>
                    <span className="inline-block rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-0.5 font-mono text-[14px] font-semibold">{term}</span>
                  </dt>
                  <dd className="mt-2 text-gray-600 dark:text-gray-300 text-[15px] leading-relaxed">{body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Your fingers already know how to use it</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              The keyboard shortcuts work the way they always did. Read a hundred stories without touching the mouse,
              then switch between list, side-by-side and one-at-a-time views when you feel like it.
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              It also does a few things Reader never got around to: dark mode, a layout built for your phone, and search
              across every story you follow.
            </p>
          </div>
          <div className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-bold text-[14px] bg-[#f5f5f5] dark:bg-gray-900">Keyboard shortcuts</div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 px-5 py-4 text-[14px]">
              {KEYS.map(([key, what]) => (
                <div key={key} className="contents">
                  <dt>
                    <kbd className="inline-block min-w-[1.75rem] text-center rounded border border-gray-300 dark:border-gray-600 border-b-2 bg-gray-50 dark:bg-gray-900 px-1.5 py-0.5 font-mono font-semibold">{key}</kbd>
                  </dt>
                  <dd className="text-gray-700 dark:text-gray-300 self-center">{what}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="rounded-lg bg-blue-600 text-white px-6 py-8 sm:px-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-xl font-semibold">Thirteen years is long enough to wait.</p>
              <p className="mt-1 text-blue-100">Create an account, import your old subscriptions.xml or paste in a few feeds, and press j.</p>
            </div>
            <Link to="/auth?mode=signup" className="flex-shrink-0 rounded-md bg-white text-blue-700 hover:bg-blue-50 font-medium px-6 py-3 text-center">
              Bring back my reader
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-6 gap-y-2 justify-between">
          <span>Foogle Reader is an open-source tribute to Google Reader. It is not made by or affiliated with Google.</span>
          <a href="https://github.com/soupsoup/google-reader-clone" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
