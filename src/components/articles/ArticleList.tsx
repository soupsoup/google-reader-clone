import { formatDistanceToNow } from 'date-fns';
import { Star, Check } from 'lucide-react';
import type { ArticleWithState } from '../../types';

interface ArticleListProps {
  articles: ArticleWithState[];
  selectedArticle: ArticleWithState | null;
  onSelectArticle: (article: ArticleWithState) => void;
  viewTitle: string;
  onMarkAllRead: () => void;
}

export function ArticleList({
  articles,
  selectedArticle,
  onSelectArticle,
  viewTitle,
  onMarkAllRead,
}: ArticleListProps) {
  const unreadCount = articles.filter(a => !a.is_read).length;

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="h-12 px-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900 dark:text-white truncate">{viewTitle}</h2>
          {unreadCount > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">({unreadCount})</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            title="Mark all as read (Shift+A)"
          >
            <Check className="h-3 w-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* Article list */}
      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 px-4 text-center">
            <p className="text-sm">No articles to display</p>
            <p className="text-xs mt-1">Subscribe to feeds to see articles here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {articles.map((article) => (
              <ArticleListItem
                key={article.id}
                article={article}
                isSelected={selectedArticle?.id === article.id}
                onSelect={() => onSelectArticle(article)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ArticleListItemProps {
  article: ArticleWithState;
  isSelected: boolean;
  onSelect: () => void;
}

function ArticleListItem({ article, isSelected, onSelect }: ArticleListItemProps) {
  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Unknown date';

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 transition-colors ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm line-clamp-2 ${
              article.is_read
                ? 'text-gray-600 dark:text-gray-400'
                : 'font-semibold text-gray-900 dark:text-white'
            }`}
          >
            {!article.is_read && (
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2" />
            )}
            {article.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {article.feed?.favicon_url && (
              <img
                src={article.feed.favicon_url}
                alt=""
                className="h-3 w-3 rounded"
              />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {article.feed?.title}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
              {timeAgo}
            </span>
          </div>
          {article.summary && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {article.summary.replace(/<[^>]*>/g, '').slice(0, 150)}
            </p>
          )}
        </div>
        {article.is_starred && (
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
        )}
      </div>
    </button>
  );
}
