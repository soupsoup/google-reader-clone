import { useState } from 'react';
import {
  Inbox,
  Star,
  ChevronDown,
  ChevronRight,
  Folder,
  Rss,
  Plus,
  Trash2,
  FolderPlus,
} from 'lucide-react';
import type { ViewState, FolderWithFeeds, FeedWithUnread } from '../../types';
import { useFeeds } from '../../hooks/useFeeds';

interface SidebarProps {
  collapsed: boolean;
  organizedFeeds?: {
    folders: FolderWithFeeds[];
    unfolderedFeeds: FeedWithUnread[];
    totalUnread: number;
  };
  currentView: ViewState;
  onSelectView: (view: ViewState) => void;
  onAddFeed: () => void;
}

export function Sidebar({
  collapsed,
  organizedFeeds,
  currentView,
  onSelectView,
  onAddFeed,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ feedId: string; x: number; y: number } | null>(null);
  const { createFolder, removeFeed } = useFeeds();

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const isActive = (type: string, id?: string) => {
    return currentView.type === type && currentView.id === id;
  };

  if (collapsed) {
    return null;
  }

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0 overflow-y-auto">
      <nav className="p-2">
        {/* Main navigation */}
        <div className="space-y-1">
          <button
            onClick={() => onSelectView({ type: 'all', title: 'All Items' })}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive('all')
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Inbox className="h-4 w-4" />
            <span className="flex-1 text-left">All Items</span>
            {(organizedFeeds?.totalUnread || 0) > 0 && (
              <span className="text-xs font-medium bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                {organizedFeeds?.totalUnread}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectView({ type: 'starred', title: 'Starred Items' })}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive('starred')
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Star className="h-4 w-4" />
            <span className="flex-1 text-left">Starred</span>
          </button>
        </div>

        <hr className="my-3 border-gray-200 dark:border-gray-700" />

        {/* Folders */}
        <div className="space-y-1">
          {organizedFeeds?.folders.map(folder => (
            <div key={folder.id}>
              <button
                onClick={() => toggleFolder(folder.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive('folder', folder.id)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {expandedFolders.has(folder.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Folder className="h-4 w-4" />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                {folder.unread_count > 0 && (
                  <span className="text-xs font-medium bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                    {folder.unread_count}
                  </span>
                )}
              </button>

              {expandedFolders.has(folder.id) && (
                <div className="ml-6 space-y-1 mt-1">
                  {folder.feeds.map(feed => (
                    <FeedItem
                      key={feed.id}
                      feed={feed}
                      isActive={isActive('feed', feed.id)}
                      onSelect={() =>
                        onSelectView({
                          type: 'feed',
                          id: feed.id,
                          title: feed.custom_title || feed.title,
                        })
                      }
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ feedId: feed.id, x: e.clientX, y: e.clientY });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Unfoldered feeds */}
          {organizedFeeds?.unfolderedFeeds.map(feed => (
            <FeedItem
              key={feed.id}
              feed={feed}
              isActive={isActive('feed', feed.id)}
              onSelect={() =>
                onSelectView({
                  type: 'feed',
                  id: feed.id,
                  title: feed.custom_title || feed.title,
                })
              }
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ feedId: feed.id, x: e.clientX, y: e.clientY });
              }}
            />
          ))}
        </div>

        <hr className="my-3 border-gray-200 dark:border-gray-700" />

        {/* Add folder button */}
        {showNewFolder ? (
          <div className="px-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setShowNewFolder(false);
                  setNewFolderName('');
                }
              }}
              onBlur={() => {
                if (!newFolderName.trim()) {
                  setShowNewFolder(false);
                }
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowNewFolder(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Folder</span>
          </button>
        )}

        <button
          onClick={onAddFeed}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add Feed</span>
        </button>
      </nav>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                removeFeed(contextMenu.feedId);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Unsubscribe
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

interface FeedItemProps {
  feed: FeedWithUnread;
  isActive: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function FeedItem({ feed, isActive, onSelect, onContextMenu }: FeedItemProps) {
  return (
    <button
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {feed.favicon_url ? (
        <img src={feed.favicon_url} alt="" className="h-4 w-4 rounded" />
      ) : (
        <Rss className="h-4 w-4 text-gray-400" />
      )}
      <span className="flex-1 text-left truncate">{feed.custom_title || feed.title}</span>
      {feed.unread_count > 0 && (
        <span className="text-xs font-medium bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
          {feed.unread_count}
        </span>
      )}
    </button>
  );
}
