import { useState } from 'react';
import type { RefObject } from 'react';
import { Rss, Search, Plus, Menu, Settings, LogOut, Moon, Sun, Keyboard } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onAddFeed: () => void;
  onToggleSidebar: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  searchInputRef,
  onAddFeed,
  onToggleSidebar,
}: HeaderProps) {
  const { signOut } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center px-4 gap-4 flex-shrink-0">
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md lg:hidden"
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </button>

      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
        <Rss className="h-6 w-6" />
        <span className="text-xl font-bold hidden sm:inline">Reader</span>
      </div>

      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search articles... (Press /)"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onAddFeed}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Feed</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>

          {showSettings && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSettings(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                <button
                  onClick={() => {
                    setShowShortcuts(true);
                    setShowSettings(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Keyboard className="h-4 w-4" />
                  Keyboard shortcuts
                </button>
                <button
                  onClick={toggleDarkMode}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {darkMode ? 'Light mode' : 'Dark mode'}
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={signOut}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500 dark:text-gray-400">j / k</div>
              <div className="text-gray-900 dark:text-white">Next / Previous article</div>
              <div className="text-gray-500 dark:text-gray-400">o / Enter</div>
              <div className="text-gray-900 dark:text-white">Open article in new tab</div>
              <div className="text-gray-500 dark:text-gray-400">s</div>
              <div className="text-gray-900 dark:text-white">Star / Unstar article</div>
              <div className="text-gray-500 dark:text-gray-400">m</div>
              <div className="text-gray-900 dark:text-white">Mark read / unread</div>
              <div className="text-gray-500 dark:text-gray-400">Shift + a</div>
              <div className="text-gray-900 dark:text-white">Mark all as read</div>
              <div className="text-gray-500 dark:text-gray-400">g h</div>
              <div className="text-gray-900 dark:text-white">Go to Home</div>
              <div className="text-gray-500 dark:text-gray-400">g a</div>
              <div className="text-gray-900 dark:text-white">Go to All Items</div>
              <div className="text-gray-500 dark:text-gray-400">g s</div>
              <div className="text-gray-900 dark:text-white">Go to Starred</div>
              <div className="text-gray-500 dark:text-gray-400">/</div>
              <div className="text-gray-900 dark:text-white">Focus search</div>
              <div className="text-gray-500 dark:text-gray-400">a</div>
              <div className="text-gray-900 dark:text-white">Add feed</div>
              <div className="text-gray-500 dark:text-gray-400">r</div>
              <div className="text-gray-900 dark:text-white">Refresh</div>
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-6 w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
