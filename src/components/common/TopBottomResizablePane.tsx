import { useState, useCallback, useRef, useEffect } from 'react';
import { ArticleList } from '../articles/ArticleList';
import { ArticlePane } from '../articles/ArticlePane';
import type { ArticleWithState } from '../../types';

interface TopBottomResizablePaneProps {
  articles: ArticleWithState[];
  selectedArticle: ArticleWithState | null;
  onSelectArticle: (article: ArticleWithState) => void;
  viewTitle: string;
  onMarkAllRead: () => void;
  articlePaneFontSize: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function TopBottomResizablePane({
  articles,
  selectedArticle,
  onSelectArticle,
  viewTitle,
  onMarkAllRead,
  articlePaneFontSize,
  onRefresh,
  isRefreshing,
}: TopBottomResizablePaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [topPaneHeight, setTopPaneHeight] = useState(300); // Default height for ArticleList
  const isResizing = useRef(false);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    isResizing.current = true;
    mouseDownEvent.preventDefault();
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = mouseMoveEvent.clientY - containerRect.top;
      setTopPaneHeight(Math.max(100, newHeight)); // Minimum height of 100px
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResizing);
  }, [resize]);

  // Reset top pane height when selected article changes or layout changes
  useEffect(() => {
    setTopPaneHeight(300);
  }, [selectedArticle]);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
      <div style={{ height: `${topPaneHeight}px` }} className="overflow-y-auto flex-shrink-0">
        <ArticleList
          articles={articles}
          selectedArticle={selectedArticle}
          onSelectArticle={onSelectArticle}
          viewTitle={viewTitle}
          onMarkAllRead={onMarkAllRead}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      </div>
      <div
        className="h-2 bg-gray-200 cursor-row-resize hover:bg-gray-300 transition-colors duration-200 flex-shrink-0"
        onMouseDown={startResizing}
      />
      <div className="flex-1 overflow-y-auto">
        <ArticlePane article={selectedArticle} fontSize={articlePaneFontSize} />
      </div>
    </div>
  );
}
