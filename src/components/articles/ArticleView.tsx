import { format } from 'date-fns';
import { Star, ExternalLink, X } from 'lucide-react';
import type { ArticleWithState } from '../../types';
import { ArticleContent } from './ArticleContent';

interface ArticleViewProps {
  article: ArticleWithState | null;
  onToggleStar: () => void;
  onToggleRead: () => void;
  onClose?: () => void;
  fontSize: number;
}

export function ArticleView({ article, onToggleStar, onToggleRead, onClose, fontSize }: ArticleViewProps) {
  if (!article) {
    return null;
  }

  const publishedDate = article.published_at
    ? format(new Date(article.published_at), 'MMMM d, yyyy h:mm a')
    : 'Unknown date';

  return (
    <div className="fixed inset-0 bg-white md:bg-black/30 z-40 flex items-center justify-center md:p-4" onClick={onClose}>
      <div
        className="bg-white md:rounded md:shadow-xl w-full md:max-w-4xl h-full md:max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Article header */}
        <div className="border-b border-gray-300 bg-[#f5f5f5] px-3 sm:px-4 py-3 flex-shrink-0 md:rounded-t">
          <div className="flex items-start gap-3">
            {/* Star button */}
            <button
              onClick={onToggleStar}
              className="mt-1 flex-shrink-0"
              title={article.is_starred ? 'Unstar (s)' : 'Star (s)'}
            >
              <Star
                className={`h-5 w-5 ${
                  article.is_starred
                    ? 'text-[#e8b600] fill-[#e8b600]'
                    : 'text-gray-400 hover:text-[#e8b600]'
                }`}
              />
            </button>

            <div className="flex-1 min-w-0">
              {/* Title */}
              <h1 className="text-base sm:text-[18px] font-bold text-[#15c] leading-tight">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {article.title}
                </a>
              </h1>

              {/* Meta info */}
              <div className="flex items-center gap-2 mt-1 text-[13px] sm:text-[14px] text-gray-600 flex-wrap">
                {article.feed?.favicon_url && (
                  <img
                    src={article.feed.favicon_url}
                    alt=""
                    className="h-4 w-4"
                  />
                )}
                <span className="font-medium">{article.feed?.title}</span>
                {article.author && (
                  <>
                    <span>-</span>
                    <span>{article.author}</span>
                  </>
                )}
              </div>
              <div className="text-xs sm:text-[13px] text-gray-500 mt-0.5">
                {publishedDate}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={onToggleRead}
                className="hidden sm:block text-[14px] text-[#15c] hover:underline"
                title={article.is_read ? 'Mark as unread (m)' : 'Mark as read (m)'}
              >
                {article.is_read ? 'Mark unread' : 'Mark read'}
              </button>
              <span className="hidden sm:inline text-gray-400">|</span>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex text-[14px] text-[#15c] hover:underline items-center gap-1"
                title="Open in new tab (o)"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </a>
              {onClose && (
                <>
                  <span className="hidden sm:inline text-gray-400">|</span>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 p-1"
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Article content */}
        <div className="flex-1 overflow-y-auto bg-white md:rounded-b" style={{ fontSize: `${fontSize}px` }}>
          <div className="max-w-3xl mx-auto p-4 sm:p-6">
            <ArticleContent article={article} fontSize={fontSize} />

            {/* Article footer */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm sm:text-[14px] text-[#15c] hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Read original article
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
