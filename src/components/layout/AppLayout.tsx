import { useState, useCallback, useRef, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ArticleList } from '../articles/ArticleList';
import { ArticleView } from '../articles/ArticleView';
import { Header } from './Header';
import { AddFeedModal } from '../feeds/AddFeedModal';
import { Toast, type ToastProps } from '../common/Toast';
import { useFeeds } from '../../hooks/useFeeds';
import { useArticles } from '../../hooks/useArticles';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { TopBottomResizablePane } from '../common/TopBottomResizablePane';
import { LeftRightResizablePane } from '../common/LeftRightResizablePane';
import type { ViewState, ArticleWithState, Layout } from '../../types';

export function AppLayout() {
  const [view, setView] = useState<ViewState>({ type: 'all', title: 'All Items' });
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithState | null>(null);
  const [showArticleAsModal, setShowArticleAsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [layout, setLayout] = useState<Layout>('side-by-side');
  const [fontSize, setFontSize] = useState(28);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { organizedFeeds, addFeed, isAddingFeed, refreshAllFeeds, isRefreshing } = useFeeds();
  const { articles, toggleRead, toggleStar, markAllRead, refetch } = useArticles({
    viewType: view.type,
    viewId: view.id,
    searchQuery: searchQuery || undefined,
  });

  // Auto-refresh all feeds on page load
  useEffect(() => {
    if (organizedFeeds) {
      refreshAllFeeds().catch(err => {
        console.error('Failed to refresh feeds on load:', err);
      });
    }
  }, []); // Empty dependency array ensures this only runs once on mount

  const selectedIndex = selectedArticle
    ? articles.findIndex(a => a.id === selectedArticle.id)
    : -1;

  const handleSelectArticle = useCallback((article: ArticleWithState) => {
    setSelectedArticle(article);
    if (layout === 'modal') {
      setShowArticleAsModal(true);
    }
    // Mark as read when selected
    if (!article.is_read) {
      toggleRead({ articleId: article.id, isRead: true });
    }
  }, [layout, toggleRead]);

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
    console.log('handleRefresh called in AppLayout!');
    console.log('refreshAllFeeds function:', refreshAllFeeds);

    // Show toast that refresh is starting
    setToast({ message: 'Refreshing feeds...', type: 'info', duration: 2000 });

    // Refresh all feeds regardless of current view
    refreshAllFeeds().then(() => {
      console.log('Refresh completed successfully');
      refetch();
      setToast({ message: 'All feeds refreshed successfully!', type: 'success', duration: 3000 });
    }).catch(err => {
      console.error('Failed to refresh feeds:', err);
      setToast({ message: 'Failed to refresh some feeds', type: 'error', duration: 4000 });
    });
  }, [refreshAllFeeds, refetch]);

  const handleCloseArticle = () => {
    setShowArticleAsModal(false);
  };

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
    onCloseArticle: layout === 'modal' ? handleCloseArticle : undefined,
  });

  // Update selected article when articles change
  useEffect(() => {
    if (selectedArticle) {
      const updated = articles.find(a => a.id === selectedArticle.id);
      if (updated) {
        setSelectedArticle(updated);
      } else {
        // The article is no longer in the list, so close the view
        setSelectedArticle(null);
        setShowArticleAsModal(false);
      }
    }
  }, [articles, selectedArticle?.id]);

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
        onAddFeed={() => setShowAddFeed(true)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        layout={layout}
        onLayoutChange={setLayout}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
      />

        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            collapsed={sidebarCollapsed}
            organizedFeeds={organizedFeeds}
            currentView={view}
            onSelectView={setView}
            onAddFeed={() => setShowAddFeed(true)}
            onCloseSidebar={() => setSidebarCollapsed(true)}
          />

          <div className="flex-1 flex overflow-hidden"> {/* This div is the main content area, sibling to Sidebar */}
            {layout === 'side-by-side' && (
              <LeftRightResizablePane
                articles={articles}
                selectedArticle={selectedArticle}
                onSelectArticle={handleSelectArticle}
                viewTitle={view.title}
                onMarkAllRead={handleMarkAllRead}
                articlePaneFontSize={fontSize}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            )}

            {layout === 'top-and-bottom' && (
              <TopBottomResizablePane
                articles={articles}
                selectedArticle={selectedArticle}
                onSelectArticle={handleSelectArticle}
                viewTitle={view.title}
                onMarkAllRead={handleMarkAllRead}
                articlePaneFontSize={fontSize}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            )}

            {layout === 'modal' && (
              <ArticleList
                articles={articles}
                selectedArticle={selectedArticle}
                onSelectArticle={handleSelectArticle}
                viewTitle={view.title}
                onMarkAllRead={handleMarkAllRead}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            )}
          </div>
        </div>
      
      {layout === 'modal' && showArticleAsModal && (
        <ArticleView
          article={selectedArticle}
          onToggleStar={handleToggleStar}
          onToggleRead={handleToggleRead}
          onClose={handleCloseArticle}
          fontSize={fontSize}
        />
      )}

      <AddFeedModal
        isOpen={showAddFeed}
        onClose={() => setShowAddFeed(false)}
        onAddFeed={addFeed}
        isLoading={isAddingFeed}
        folders={organizedFeeds?.folders || []}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
