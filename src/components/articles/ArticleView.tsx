import { format } from 'date-fns';
import { Star, ExternalLink, Check, Circle } from 'lucide-react';
import type { ArticleWithState } from '../../types';

interface ArticleViewProps {
  article: ArticleWithState | null;
  onToggleStar: () => void;
  onToggleRead: () => void;
}

export function ArticleView({ article, onToggleStar, onToggleRead }: ArticleViewProps) {
  if (!article) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">Select an article to read</p>
          <p className="text-sm mt-2">
            Use <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">j</kbd> and{' '}
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">k</kbd> to navigate
          </p>
        </div>
      </div>
    );
  }

  const publishedDate = article.published_at
    ? format(new Date(article.published_at), 'MMMM d, yyyy • h:mm a')
    : 'Unknown date';

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Article header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                {article.feed?.favicon_url && (
                  <img
                    src={article.feed.favicon_url}
                    alt=""
                    className="h-4 w-4 rounded"
                  />
                )}
                <span>{article.feed?.title}</span>
              </div>
              {article.author && (
                <>
                  <span>•</span>
                  <span>{article.author}</span>
                </>
              )}
              <span>•</span>
              <span>{publishedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onToggleRead}
              className={`p-2 rounded-lg transition-colors ${
                article.is_read
                  ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              title={article.is_read ? 'Mark as unread (m)' : 'Mark as read (m)'}
            >
              {article.is_read ? (
                <Check className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={onToggleStar}
              className={`p-2 rounded-lg transition-colors ${
                article.is_starred
                  ? 'text-yellow-500'
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
              title={article.is_starred ? 'Unstar (s)' : 'Star (s)'}
            >
              <Star className={`h-5 w-5 ${article.is_starred ? 'fill-yellow-500' : ''}`} />
            </button>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              title="Open in new tab (o)"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          <div
            className="article-content prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: article.content || article.summary || '<p>No content available.</p>',
            }}
          />

          {/* Article footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Read original article
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
