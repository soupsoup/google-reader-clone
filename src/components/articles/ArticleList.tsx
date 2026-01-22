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
    <div className="flex-1 flex flex-col bg-white md:border-r border-gray-300">
      {/* Toolbar - Desktop only */}
      <div className="hidden md:flex h-10 px-3 border-b border-gray-300 bg-[#f5f5f5] items-center gap-3 flex-shrink-0">
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

      {/* View title - Desktop only */}
      <div className="hidden md:block px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-[15px] font-bold text-gray-800">{viewTitle}</h2>
      </div>

      {/* Mobile title */}
      <div className="md:hidden px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-gray-900">{viewTitle}</h2>
        {unreadCount > 0 && (
          <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
        )}
      </div>

      {/* Article list */}
      <div className="flex-1 overflow-y-auto bg-gray-50 md:bg-white">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4 text-center">
            <p className="text-[14px]">No items to display</p>
            <p className="text-[13px] mt-1">Subscribe to feeds to see items here</p>
          </div>
        ) : (
          <>
            {/* Desktop card view */}
            <div className="hidden md:block">
              {articles.map((article) => (
                <DesktopArticleCard
                  key={article.id}
                  article={article}
                  isSelected={selectedArticle?.id === article.id}
                  onSelect={() => onSelectArticle(article)}
                />
              ))}
            </div>

            {/* Mobile card view */}
            <div className="md:hidden" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
              {articles.map((article) => (
                <MobileArticleCard
                  key={article.id}
                  article={article}
                  isSelected={selectedArticle?.id === article.id}
                  onSelect={() => onSelectArticle(article)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface DesktopArticleCardProps {
  article: ArticleWithState;
  isSelected: boolean;
  onSelect: () => void;
}

function DesktopArticleCard({ article, isSelected, onSelect }: DesktopArticleCardProps) {
  const timeDisplay = article.published_at
    ? format(new Date(article.published_at), 'MMM d, h:mm a')
    : '';

  return (
    <article
      onClick={onSelect}
      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-200 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-[#e8f0fe]'
          : 'hover:bg-gray-50'
      }`}
    >
      {/* Star icon */}
      <div className="flex-shrink-0 pt-0.5">
        <Star
          className={`h-4 w-4 ${
            article.is_starred
              ? 'text-[#e8b600] fill-[#e8b600]'
              : 'text-gray-300'
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3
          className={`text-[15px] leading-snug mb-1 ${
            article.is_read
              ? 'text-gray-600 font-normal'
              : 'text-gray-900 font-semibold'
          }`}
        >
          {article.title}
        </h3>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-[13px] text-gray-500">
          {article.feed?.favicon_url && (
            <img
              src={article.feed.favicon_url}
              alt=""
              className="h-3.5 w-3.5 flex-shrink-0"
            />
          )}
          <span className="truncate">{article.feed?.title}</span>
          <span>•</span>
          <span className="whitespace-nowrap">{timeDisplay}</span>
        </div>
      </div>
    </article>
  );
}

interface MobileArticleCardProps {
  article: ArticleWithState;
  isSelected: boolean;
  onSelect: () => void;
}

function MobileArticleCard({ article, isSelected, onSelect }: MobileArticleCardProps) {
  const timeDisplay = article.published_at
    ? format(new Date(article.published_at), 'h:mm a')
    : '';

  const dateDisplay = article.published_at
    ? format(new Date(article.published_at), 'MMM d')
    : '';

  // Extract first image from content if available
  const getImageFromContent = (content: string | null): string | null => {
    if (!content) return null;
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : null;
  };

  const imageUrl = getImageFromContent(article.content);

  // Get excerpt from summary or content
  const getExcerpt = (): string => {
    const text = article.summary || article.content || '';
    const stripped = text.replace(/<[^>]*>/g, '').trim();
    return stripped.slice(0, 120) + (stripped.length > 120 ? '...' : '');
  };

  return (
    <article
      onClick={onSelect}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden active:scale-[0.98] transition-transform ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        marginLeft: '8px',
        marginRight: '8px',
        marginBottom: '8px',
        maxWidth: 'calc(100vw - 16px)'
      }}
    >
      <div style={{ padding: '12px' }}>
        {/* Header - Feed name and star */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {article.feed?.favicon_url && (
              <img
                src={article.feed.favicon_url}
                alt=""
                className="h-4 w-4 flex-shrink-0"
              />
            )}
            <span className="text-xs font-medium text-gray-500 truncate">
              {article.feed?.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs text-gray-400">{timeDisplay}</span>
            <Star
              className={`h-4 w-4 flex-shrink-0 ${
                article.is_starred
                  ? 'text-[#e8b600] fill-[#e8b600]'
                  : 'text-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-2.5">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className={`text-base font-semibold leading-snug mb-1 ${
                article.is_read ? 'text-gray-600' : 'text-gray-900'
              }`}
            >
              {article.title}
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
              {getExcerpt()}
            </p>

            {/* Date badge */}
            {!article.is_read && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                  {dateDisplay}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail */}
          {imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={imageUrl}
                alt=""
                className="w-16 h-16 object-cover rounded-lg"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
