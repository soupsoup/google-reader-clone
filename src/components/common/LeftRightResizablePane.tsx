import { useState, useCallback, useRef, useEffect } from 'react';
import { ArticleList } from '../articles/ArticleList';
import { ArticlePane } from '../articles/ArticlePane';
import type { ArticleWithState } from '../../types';

interface LeftRightResizablePaneProps {
  articles: ArticleWithState[];
  selectedArticle: ArticleWithState | null;
  onSelectArticle: (article: ArticleWithState) => void;
  viewTitle: string;
  onMarkAllRead: () => void;
  articlePaneFontSize: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function LeftRightResizablePane({
  articles,
  selectedArticle,
  onSelectArticle,
  viewTitle,
  onMarkAllRead,
  articlePaneFontSize,
  onRefresh,
  isRefreshing,
}: LeftRightResizablePaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState(400); // Default width for ArticleList
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
      const newWidth = mouseMoveEvent.clientX - containerRect.left;
      setLeftPaneWidth(Math.max(200, Math.min(newWidth, containerRect.width - 200))); // Min 200px, max container width - 200px
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResizing);
  }, [resize]);

  // Reset left pane width when layout changes
  useEffect(() => {
    setLeftPaneWidth(400);
  }, []);

  return (
    <div ref={containerRef} className="flex-1 flex overflow-hidden">
      <div style={{ width: `${leftPaneWidth}px` }} className="overflow-y-auto flex-shrink-0">
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
        className="w-2 bg-gray-200 cursor-col-resize hover:bg-gray-300 transition-colors duration-200 flex-shrink-0"
        onMouseDown={startResizing}
      />
      <div className="flex-1 overflow-y-auto">
        <ArticlePane article={selectedArticle} fontSize={articlePaneFontSize} />
      </div>
    </div>
  );
}