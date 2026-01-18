import { useState, useCallback, useRef, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ArticleList } from '../articles/ArticleList';
import { ArticleView } from '../articles/ArticleView';
import { Header } from './Header';
import { AddFeedModal } from '../feeds/AddFeedModal';
import { useFeeds } from '../../hooks/useFeeds';
import { useArticles } from '../../hooks/useArticles';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import type { ViewState, ArticleWithState } from '../../types';

export function AppLayout() {
  const [view, setView] = useState<ViewState>({ type: 'all', title: 'All Items' });
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { organizedFeeds, addFeed, isAddingFeed, refreshFeed } = useFeeds();
  const { articles, toggleRead, toggleStar, markAllRead, refetch } = useArticles({
    viewType: view.type,
    viewId: view.id,
    searchQuery: searchQuery || undefined,
  });

  const selectedIndex = selectedArticle
    ? articles.findIndex(a => a.id === selectedArticle.id)
    : -1;

  const handleSelectArticle = useCallback((article: ArticleWithState) => {
    setSelectedArticle(article);
    // Mark as read when selected
    if (!article.is_read) {
      toggleRead({ articleId: article.id, isRead: true });
    }
  }, [toggleRead]);

  const handleNextArticle = useCallback(() => {
    if (articles.length === 0) return;
    const nextIndex = selectedIndex < articles.length - 1 ? selectedIndex + 1 : 0;
    handleSelectArticle(articles[nextIndex]);
  }, [articles, selectedIndex, handleSelectArticle]);

  const handlePrevArticle = useCallback(() => {
    if (articles.length === 0) return;
    const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : articles.length - 1;
    handleSelectArticle(articles[prevIndex]);
  }, [articles, selectedIndex, handleSelectArticle]);

  const handleToggleStar = useCallback(() => {
    if (!selectedArticle) return;
    toggleStar({ articleId: selectedArticle.id, isStarred: !selectedArticle.is_starred });
    setSelectedArticle(prev => prev ? { ...prev, is_starred: !prev.is_starred } : null);
  }, [selectedArticle, toggleStar]);

  const handleToggleRead = useCallback(() => {
    if (!selectedArticle) return;
    toggleRead({ articleId: selectedArticle.id, isRead: !selectedArticle.is_read });
    setSelectedArticle(prev => prev ? { ...prev, is_read: !prev.is_read } : null);
  }, [selectedArticle, toggleRead]);

  const handleMarkAllRead = useCallback(() => {
    if (view.type === 'all') {
      markAllRead({ type: 'all' });
    } else if (view.type === 'feed' && view.id) {
      markAllRead({ type: 'feed', id: view.id });
    } else if (view.type === 'folder' && view.id) {
      markAllRead({ type: 'folder', id: view.id });
    }
  }, [view, markAllRead]);

  const handleRefresh = useCallback(() => {
    if (view.type === 'feed' && view.id) {
      refreshFeed(view.id);
    }
    refetch();
  }, [view, refreshFeed, refetch]);

  useKeyboardShortcuts({
    onNextArticle: handleNextArticle,
    onPrevArticle: handlePrevArticle,
    onOpenArticle: () => {
      if (selectedArticle?.url) {
        window.open(selectedArticle.url, '_blank');
      }
    },
    onToggleStar: handleToggleStar,
    onToggleRead: handleToggleRead,
    onMarkAllRead: handleMarkAllRead,
    onGoHome: () => setView({ type: 'all', title: 'All Items' }),
    onGoAll: () => setView({ type: 'all', title: 'All Items' }),
    onGoStarred: () => setView({ type: 'starred', title: 'Starred Items' }),
    onSearch: () => searchInputRef.current?.focus(),
    onRefresh: handleRefresh,
    onAddFeed: () => setShowAddFeed(true),
  });

  // Update selected article when articles change
  useEffect(() => {
    if (selectedArticle) {
      const updated = articles.find(a => a.id === selectedArticle.id);
      if (updated) {
        setSelectedArticle(updated);
      }
    }
  }, [articles, selectedArticle?.id]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
        onAddFeed={() => setShowAddFeed(true)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          organizedFeeds={organizedFeeds}
          currentView={view}
          onSelectView={setView}
          onAddFeed={() => setShowAddFeed(true)}
        />

        <ArticleList
          articles={articles}
          selectedArticle={selectedArticle}
          onSelectArticle={handleSelectArticle}
          viewTitle={view.title}
          onMarkAllRead={handleMarkAllRead}
        />

        <ArticleView
          article={selectedArticle}
          onToggleStar={handleToggleStar}
          onToggleRead={handleToggleRead}
        />
      </div>

      <AddFeedModal
        isOpen={showAddFeed}
        onClose={() => setShowAddFeed(false)}
        onAddFeed={addFeed}
        isLoading={isAddingFeed}
        folders={organizedFeeds?.folders || []}
      />
    </div>
  );
}
