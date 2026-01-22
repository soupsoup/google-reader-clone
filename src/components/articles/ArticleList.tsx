import { format } from 'date-fns';
import { Star, RefreshCw } from 'lucide-react';
import type { ArticleWithState } from '../../types';

interface ArticleListProps {
  articles: ArticleWithState[];
  selectedArticle: ArticleWithState | null;
  onSelectArticle: (article: ArticleWithState) => void;
  viewTitle: string;
  onMarkAllRead: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ArticleList({
  articles,
  selectedArticle,
  onSelectArticle,
  viewTitle,
  onMarkAllRead,
  onRefresh,
  isRefreshing = false,
}: ArticleListProps) {
  const unreadCount = articles.filter(a => !a.is_read).length;

  return (
    <div className="flex-1 flex flex-col bg-white border-r border-gray-300">
      {/* Toolbar */}
      <div className="h-10 px-3 border-b border-gray-300 bg-[#f5f5f5] flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onRefresh}
          disabled={isRefreshing || !onRefresh}
          className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title="Refresh all feeds (r)"
        >
          <RefreshCw className={`h-4 w-4 text-gray-600 transition-all ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>
        <span className="text-[14px] text-gray-700">
          {unreadCount > 0 ? `${unreadCount} new items` : 'No new items'}
        </span>
        {unreadCount > 0 && (
          <>
            <span className="text-gray-400">|</span>
            <button
              onClick={onMarkAllRead}
              className="text-[14px] text-gray-700 hover:bg-gray-200 px-2 py-1 rounded"
            >
              Mark all as read
            </button>
          </>
        )}
      </div>

      {/* View title */}
      <div className="px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-[15px] font-bold text-gray-800">{viewTitle}</h2>
      </div>

      {/* Article list */}
      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4 text-center">
            <p className="text-[14px]">No items to display</p>
            <p className="text-[13px] mt-1">Subscribe to feeds to see items here</p>
          </div>
        ) : (
          <table className="w-full text-[14px]">
            <tbody>
              {articles.map((article) => (
                <ArticleRow
                  key={article.id}
                  article={article}
                  isSelected={selectedArticle?.id === article.id}
                  onSelect={() => onSelectArticle(article)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

interface ArticleRowProps {
  article: ArticleWithState;
  isSelected: boolean;
  onSelect: () => void;
}

function ArticleRow({ article, isSelected, onSelect }: ArticleRowProps) {
  const timeDisplay = article.published_at
    ? format(new Date(article.published_at), 'MMM d, yyyy')
    : '';

  return (
    <tr
      onClick={onSelect}
      className={`cursor-pointer border-b border-gray-100 ${
        isSelected
          ? 'bg-[#ffffd0]'
          : 'hover:bg-[#f0f7ff]'
      }`}
    >
      {/* Star */}
      <td className="w-8 px-2 py-2 align-top">
        <Star
          className={`h-4 w-4 ${
            article.is_starred
              ? 'text-[#e8b600] fill-[#e8b600]'
              : 'text-gray-300'
          }`}
        />
      </td>

      {/* Feed name */}
      <td className="w-40 px-2 py-2 align-top">
        <span className="text-gray-600 truncate block">
          {article.feed?.title}
        </span>
      </td>

      {/* Title and preview */}
      <td className="px-2 py-2 align-top">
        <span
          className={`${
            article.is_read
              ? 'text-[#77a]'
              : 'font-bold text-[#15c]'
          }`}
        >
          {article.title}
        </span>
        {article.summary && (
          <span className="text-gray-500 ml-2">
            - {article.summary.replace(/<[^>]*>/g, '').slice(0, 80)}
          </span>
        )}
      </td>

      {/* Time */}
      <td className="w-24 px-2 py-2 align-top text-right whitespace-nowrap">
        <span className="text-gray-500">{timeDisplay}</span>
      </td>
    </tr>
  );
}
