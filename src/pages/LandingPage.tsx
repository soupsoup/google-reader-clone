import { Link } from 'react-router-dom';
import { Rss, FolderTree, Star, Search, Keyboard, Columns, FileUp, Moon } from 'lucide-react';

const FEATURES = [
  { icon: FolderTree, title: 'Folders for your feeds', body: 'Group sources the way you think about them, then read one feed, one folder or everything at once.' },
  { icon: Keyboard, title: 'Keyboard first', body: 'j and k move through stories, s stars, m marks read, o opens the original. Your hands never leave the keys.' },
  { icon: Star, title: 'Stars and unread counts', body: 'Star what you want to come back to. Unread counts show what is new since you last looked.' },
  { icon: Search, title: 'Search everything', body: 'Find a story by words in its title or text across every feed you follow.' },
  { icon: Columns, title: 'Three ways to read', body: 'Side by side, top and bottom, or one story at a time. Pick the layout that fits your screen.' },
  { icon: FileUp, title: 'Bring your feeds', body: 'Paste a feed or site address, or import an OPML file from the reader you use today.' },
];

const SAMPLE = [
  { feed: 'The Verge', title: 'The quiet comeback of RSS', unread: true },
  { feed: 'Ars Technica', title: 'What the new chip rules mean for laptops', unread: true },
  { feed: 'Local News', title: 'Town meeting moves to Thursday night', unread: false },
  { feed: 'Hacker News', title: 'Show HN: a reader that respects your time', unread: true },
];

function ReaderPreview() {
  return (
    <div className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden text-left" aria-hidden="true">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="ml-3 text-[11px] text-gray-500">foogle.antderosa.com</span>
      </div>
      <div className="flex text-[13px]">
        <div className="hidden sm:block w-44 flex-shrink-0 whitespace-nowrap border-r border-gray-200 dark:border-gray-700 p-3 space-y-2 text-gray-600 dark:text-gray-400">
          <div className="font-semibold text-gray-900 dark:text-gray-100">All items <span className="text-[#15c] dark:text-blue-400">(42)</span></div>
          <div>Starred items</div>
          <div className="pt-2 text-[11px] uppercase tracking-wide text-gray-400">Tech</div>
          <div className="pl-2">The Verge (12)</div>
          <div className="pl-2">Ars Technica (8)</div>
          <div className="pt-2 text-[11px] uppercase tracking-wide text-gray-400">Home</div>
          <div className="pl-2">Local News (3)</div>
        </div>
        <ul className="flex-1 divide-y divide-gray-100 dark:divide-gray-700">
          {SAMPLE.map((s, i) => (
            <li key={s.title} className={`flex items-center gap-3 px-3 py-2.5 ${i === 0 ? 'bg-blue-50 dark:bg-blue-900/30 border-l-2 border-[#15c]' : ''}`}>
              <Star className={`h-3.5 w-3.5 flex-shrink-0 ${i === 1 ? 'text-[#e8b600] fill-[#e8b600]' : 'text-gray-300 dark:text-gray-600'}`} />
              <span className="w-24 flex-shrink-0 truncate text-gray-500 dark:text-gray-400">{s.feed}</span>
              <span className={`truncate ${s.unread ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>{s.title}</span>
            </li>
          ))}
        </ul>
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
          <Link to="/auth" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">
            Sign in
          </Link>
          <Link to="/auth?mode=signup" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2">
            Create account
          </Link>
        </nav>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Read the web on your terms again.
            </h1>
            <p className="mt-5 text-lg text-gray-600 dark:text-gray-300 max-w-xl">
              Foogle Reader brings back the feed reader you remember. Follow the sites you trust,
              see every new story in one place, and skip the algorithm deciding what you get to see.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth?mode=signup" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3">
                Create an account
              </Link>
              <Link
                to="/auth"
                className="rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium px-6 py-3"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No ads and no feed ranking. Stories arrive in the order they were published.</p>
          </div>
          <ReaderPreview />
        </section>

        <section className="bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-2xl sm:text-3xl font-bold">Everything a reader should do, nothing it shouldn't</h2>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title}>
                  <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-1.5 text-gray-600 dark:text-gray-300 text-[15px] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold">Up and running in a minute</h2>
          <ol className="mt-8 grid md:grid-cols-3 gap-8">
            {[
              ['Create your account', 'Sign up with your email and confirm the link we send you.'],
              ['Add your feeds', 'Paste the address of any site or feed, or import your OPML file.'],
              ['Start reading', 'New stories land in your list as your feeds publish them.'],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-300 text-[15px]">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-12 rounded-lg bg-blue-600 text-white px-6 py-8 sm:px-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xl font-semibold">Your feeds are waiting.</p>
              <p className="mt-1 text-blue-100 flex items-center gap-2">
                <Moon className="h-4 w-4" /> Works on your phone and in dark mode.
              </p>
            </div>
            <Link to="/auth?mode=signup" className="rounded-md bg-white text-blue-700 hover:bg-blue-50 font-medium px-6 py-3 text-center">
              Create an account
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-6 gap-y-2 justify-between">
          <span>Foogle Reader, an open-source RSS reader inspired by Google Reader.</span>
          <a href="https://github.com/soupsoup/google-reader-clone" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
