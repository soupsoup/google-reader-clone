import { useState } from 'react';
import type { RefObject } from 'react';
import { Search, Settings, LogOut, Keyboard, Columns, Rows, PanelRight, Minus, Plus, Menu } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import type { Layout } from '../../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onAddFeed: () => void;
  onToggleSidebar: () => void;
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  searchInputRef,
  onToggleSidebar,
  layout,
  onLayoutChange,
  fontSize,
  onFontSizeChange,
}: HeaderProps) {
  const { signOut, user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <header className="bg-white border-b border-gray-300 flex-shrink-0">
      {/* Top bar with logo and search */}
      <div className="h-14 flex items-center px-2 sm:px-4 gap-2 sm:gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* Foogle Logo */}
        <div className="flex items-center">
          <span className="text-xl sm:text-2xl font-normal tracking-tight">
            <span className="text-[#4285f4]">F</span>
            <span className="text-[#ea4335]">o</span>
            <span className="text-[#fbbc05]">o</span>
            <span className="text-[#4285f4]">g</span>
            <span className="text-[#34a853]">l</span>
            <span className="text-[#ea4335]">e</span>
          </span>
        </div>

        {/* Search */}
        <div className="hidden sm:flex flex-1 max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Reader"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-l text-[14px] focus:outline-none focus:border-[#4285f4]"
            />
          </div>
          <button className="px-4 py-2 bg-[#4285f4] hover:bg-[#3367d6] text-white rounded-r border border-[#4285f4]">
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Right side - user info */}
        <div className="flex items-center gap-1 sm:gap-3 ml-auto">
          <span className="hidden md:block text-[14px] text-gray-700">{user?.email?.split('@')[0]}</span>

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => onFontSizeChange(fontSize - 1)}
              className="p-2 rounded hover:bg-gray-100"
              title="Decrease font size"
            >
              <Minus className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => onFontSizeChange(fontSize + 1)}
              className="p-2 rounded hover:bg-gray-100"
              title="Increase font size"
            >
              <Plus className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onLayoutChange('modal')}
              className={`p-2 rounded ${layout === 'modal' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title="Modal"
            >
              <PanelRight className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => onLayoutChange('side-by-side')}
              className={`p-2 rounded ${layout === 'side-by-side' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title="Side-by-side"
            >
              <Columns className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => onLayoutChange('top-and-bottom')}
              className={`p-2 rounded ${layout === 'top-and-bottom' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title="Top-and-bottom"
            >
              <Rows className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>

            {showSettings && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSettings(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      setShowShortcuts(true);
                      setShowSettings(false);
                    }}
                    className="w-full px-4 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Keyboard className="h-4 w-4" />
                    Keyboard shortcuts
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={signOut}
                    className="w-full px-4 py-2 text-left text-[14px] text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Second row with Reader title */}
      <div className="h-10 flex items-center px-4 border-t border-gray-200 bg-[#f5f5f5]">
        <span className="text-xl text-[#dd4b39] font-normal">Reader</span>
      </div>

      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-2 gap-2 text-[14px]">
              <div className="text-gray-500">j / k</div>
              <div className="text-gray-900">Next / Previous item</div>
              <div className="text-gray-500">o / Enter</div>
              <div className="text-gray-900">Open item in new tab</div>
              <div className="text-gray-500">s</div>
              <div className="text-gray-900">Star / Unstar item</div>
              <div className="text-gray-500">m</div>
              <div className="text-gray-900">Mark read / unread</div>
              <div className="text-gray-500">Shift + a</div>
              <div className="text-gray-900">Mark all as read</div>
              <div className="text-gray-500">g h</div>
              <div className="text-gray-900">Go to Home</div>
              <div className="text-gray-500">g a</div>
              <div className="text-gray-900">Go to All Items</div>
              <div className="text-gray-500">g s</div>
              <div className="text-gray-900">Go to Starred</div>
              <div className="text-gray-500">/</div>
              <div className="text-gray-900">Focus search</div>
              <div className="text-gray-500">a</div>
              <div className="text-gray-900">Add subscription</div>
              <div className="text-gray-500">r</div>
              <div className="text-gray-900">Refresh</div>
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-6 w-full py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
