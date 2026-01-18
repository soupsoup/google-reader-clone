import { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Star,
  Trash2,
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
  const [expandedSubscriptions, setExpandedSubscriptions] = useState(true);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ feedId: string; x: number; y: number } | null>(null);
  const { createFolder, removeFeed, moveFeedToFolder } = useFeeds();

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

  const handleDragStart = useCallback((e: React.DragEvent, feedId: string) => {
    e.dataTransfer.setData('text/plain', feedId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    const feedId = e.dataTransfer.getData('text/plain');
    if (feedId) {
      await moveFeedToFolder({ feedId, folderId });
    }
  }, [moveFeedToFolder]);

  if (collapsed) {
    return null;
  }

  return (
    <aside className="w-56 border-r border-gray-300 bg-white flex-shrink-0 overflow-y-auto">
      <nav className="py-3">
        {/* Subscribe button */}
        <div className="px-3 mb-4">
          <button
            onClick={onAddFeed}
            className="w-full py-2 px-4 bg-[#dd4b39] hover:bg-[#c23321] text-white text-[14px] font-bold rounded shadow-sm"
          >
            SUBSCRIBE
          </button>
        </div>

        {/* Home */}
        <button
          onClick={() => onSelectView({ type: 'all', title: 'All items' })}
          className={`w-full flex items-center gap-2 px-4 py-1.5 text-left text-[14px] ${
            isActive('all')
              ? 'bg-[#fcf1de]'
              : 'hover:bg-[#f1f1f1]'
          }`}
        >
          <span className="text-[#15c]">Home</span>
        </button>

        <hr className="my-2 mx-3 border-gray-200" />

        {/* All items */}
        <button
          onClick={() => onSelectView({ type: 'all', title: 'All items' })}
          className={`w-full flex items-center gap-2 px-4 py-1.5 text-left text-[14px] ${
            isActive('all')
              ? 'bg-[#fcf1de]'
              : 'hover:bg-[#f1f1f1]'
          }`}
        >
          <ChevronDown className="h-3 w-3 text-gray-500" />
          <span className="text-[#15c]">All items</span>
          {(organizedFeeds?.totalUnread || 0) > 0 && (
            <span className="text-gray-600">({organizedFeeds?.totalUnread})</span>
          )}
        </button>

        {/* Starred items */}
        <button
          onClick={() => onSelectView({ type: 'starred', title: 'Starred items' })}
          className={`w-full flex items-center gap-2 px-4 py-1.5 text-left text-[14px] ${
            isActive('starred')
              ? 'bg-[#fcf1de]'
              : 'hover:bg-[#f1f1f1]'
          }`}
        >
          <Star className="h-4 w-4 text-[#e8b600] fill-[#e8b600]" />
          <span className="text-[#15c]">Starred items</span>
        </button>

        <hr className="my-2 mx-3 border-gray-200" />

        {/* Subscriptions header */}
        <button
          onClick={() => setExpandedSubscriptions(!expandedSubscriptions)}
          className="w-full flex items-center gap-1 px-3 py-1.5 text-left text-[14px] font-bold text-gray-700 hover:bg-[#f1f1f1]"
        >
          {expandedSubscriptions ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Subscriptions
        </button>

        {expandedSubscriptions && (
          <div className="ml-2">
            {/* Folders */}
            {organizedFeeds?.folders.map(folder => (
              <div
                key={folder.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, folder.id)}
              >
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className={`w-full flex items-center gap-1 px-3 py-1 text-left text-[14px] ${
                    isActive('folder', folder.id)
                      ? 'bg-[#fcf1de]'
                      : 'hover:bg-[#f1f1f1]'
                  }`}
                >
                  {expandedFolders.has(folder.id) ? (
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-gray-500" />
                  )}
                  <span className="text-[#15c] flex-1 truncate">{folder.name}</span>
                  {folder.unread_count > 0 && (
                    <span className="text-gray-600">({folder.unread_count})</span>
                  )}
                </button>

                {expandedFolders.has(folder.id) && (
                  <div className="ml-4">
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
                        onDragStart={handleDragStart}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Unfoldered feeds */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, null)}
            >
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
                  onDragStart={handleDragStart}
                />
              ))}
            </div>

            {/* New folder input */}
            {showNewFolder ? (
              <div className="px-3 py-1">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New folder name"
                  className="w-full px-2 py-1 text-[14px] border border-gray-400 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#15c]"
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
                className="w-full flex items-center gap-1 px-4 py-1 text-left text-[14px] text-[#15c] hover:underline hover:bg-[#f1f1f1]"
              >
                + New folder
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed bg-white rounded shadow-lg border border-gray-300 py-1 z-20"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                removeFeed(contextMenu.feedId);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-[14px] text-red-600 hover:bg-gray-100 flex items-center gap-2"
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
  onDragStart: (e: React.DragEvent, feedId: string) => void;
}

function FeedItem({ feed, isActive, onSelect, onContextMenu, onDragStart }: FeedItemProps) {
  return (
    <button
      draggable="true"
      onDragStart={(e) => onDragStart(e, feed.id)}
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className={`w-full flex items-center gap-2 px-3 py-1 text-left text-[14px] ${
        isActive
          ? 'bg-[#fcf1de]'
          : 'hover:bg-[#f1f1f1]'
      }`}
    >
      {feed.favicon_url ? (
        <img src={feed.favicon_url} alt="" className="h-4 w-4 flex-shrink-0" />
      ) : (
        <div className="h-4 w-4 bg-[#77a] rounded-sm flex-shrink-0" />
      )}
      <span className="text-[#15c] flex-1 truncate">
        {feed.custom_title || feed.title}
      </span>
      {feed.unread_count > 0 && (
        <span className="text-gray-600">({feed.unread_count})</span>
      )}
    </button>
  );
}