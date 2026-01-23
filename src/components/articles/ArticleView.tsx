import { format } from 'date-fns';
import { Star, ExternalLink, X } from 'lucide-react';
import type { ArticleWithState } from '../../types';

// Reduce paragraph spacing by manipulating the HTML directly
function cleanHtmlContent(html: string): string {
  if (!html) return '';

  // Replace closing paragraph tags with a small line break instead of default spacing
  let cleaned = html.replace(/<\/p>\s*<p>/gi, '<br><br>');
  cleaned = cleaned.replace(/<p>/gi, '');
  cleaned = cleaned.replace(/<\/p>/gi, '<br><br>');

  return cleaned;
}

interface ArticleViewProps {
  article: ArticleWithState | null;
  onToggleStar: () => void;
  onToggleRead: () => void;
  onClose?: () => void;
  fontSize: number;
}

export function ArticleView({ article, onToggleStar, onToggleRead, onClose }: ArticleViewProps) {
  if (!article) {
    return null;
  }

  const cleanedContent = cleanHtmlContent(article.content || '');
  const publishedDate = article.published_at
    ? format(new Date(article.published_at), 'MMMM d, yyyy h:mm a')
    : 'Unknown date';

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center md:p-4" onClick={onClose}>
      <div
        className="bg-white md:rounded shadow-xl w-full max-w-4xl h-full md:max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Article header */}
        <div className="border-b border-gray-300 bg-[#f5f5f5] px-3 py-2 flex-shrink-0 md:rounded-t">
          <div className="flex items-center gap-2">
            {/* Star button */}
            <button
              onClick={onToggleStar}
              className="flex-shrink-0"
              title={article.is_starred ? 'Unstar (s)' : 'Star (s)'}
            >
              <Star
                className={`h-4 w-4 ${
                  article.is_starred
                    ? 'text-[#e8b600] fill-[#e8b600]'
                    : 'text-gray-400 hover:text-[#e8b600]'
                }`}
              />
            </button>

            <div className="flex-1 min-w-0">
              {/* Title */}
              <h1 className="text-[15px] md:text-[16px] font-semibold text-[#15c] leading-tight mb-1">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {article.title}
                </a>
              </h1>

              {/* Meta info - single line */}
              <div className="flex items-center gap-1.5 text-[12px] text-gray-600 flex-wrap">
                {article.feed?.favicon_url && (
                  <img
                    src={article.feed.favicon_url}
                    alt=""
                    className="h-3 w-3"
                  />
                )}
                <span className="font-medium truncate">{article.feed?.title}</span>
                {article.author && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="truncate">{article.author}</span>
                  </>
                )}
                <span className="text-gray-400">•</span>
                <span className="whitespace-nowrap">{publishedDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onToggleRead}
                className="text-[13px] text-[#15c] hover:underline whitespace-nowrap"
                title={article.is_read ? 'Mark as unread (m)' : 'Mark as read (m)'}
              >
                {article.is_read ? 'Mark unread' : 'Mark read'}
              </button>
              <span className="text-gray-400">|</span>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[#15c] hover:underline flex items-center gap-1"
                title="Open in new tab (o)"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </a>
            </div>

            {/* Close button - mobile and desktop */}
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Article content */}
        <div className="flex-1 overflow-y-auto bg-white md:rounded-b">
          <div className="max-w-3xl mx-auto p-6">
            <div
              className="text-[18px] text-gray-700"
              style={{
                fontSize: '18px',
                lineHeight: '1.6',
                wordWrap: 'break-word'
              }}
              dangerouslySetInnerHTML={{ __html: cleanedContent }}
            />

            {/* Article footer */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[14px] text-[#15c] hover:underline"
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
