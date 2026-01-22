import { format } from 'date-fns';
import { Star, ExternalLink, X } from 'lucide-react';
import type { ArticleWithState } from '../../types';

function cleanHtmlContent(html: string): string {
  if (!html) return '';

  // Remove excessive whitespace and normalize line breaks
  let cleaned = html
    .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n\n')  // Normalize multiple newlines
    .trim();

  // Ensure paragraphs have proper spacing
  cleaned = cleaned
    .replace(/<\/p>\s*<p>/gi, '</p>\n\n<p>')  // Add spacing between paragraphs
    .replace(/<\/div>\s*<div>/gi, '</div>\n\n<div>')  // Add spacing between divs
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br>')  // Clean up multiple br tags
    .replace(/(<br\s*\/?>){3,}/gi, '<br><br>');  // Limit consecutive br tags

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

  const publishedDate = article.published_at
    ? format(new Date(article.published_at), 'MMMM d, yyyy h:mm a')
    : 'Unknown date';

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Article header */}
        <div className="border-b border-gray-300 bg-[#f5f5f5] px-4 py-3 flex-shrink-0 rounded-t">
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
              <h1 className="text-[18px] font-bold text-[#15c] leading-tight">
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
              <div className="flex items-center gap-2 mt-1 text-[14px] text-gray-600">
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
              <div className="text-[13px] text-gray-500 mt-0.5">
                {publishedDate}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onToggleRead}
                className="text-[14px] text-[#15c] hover:underline"
                title={article.is_read ? 'Mark as unread (m)' : 'Mark as read (m)'}
              >
                {article.is_read ? 'Mark unread' : 'Mark read'}
              </button>
              <span className="text-gray-400">|</span>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-[#15c] hover:underline flex items-center gap-1"
                title="Open in new tab (o)"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </a>
              {onClose && (
                <>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
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
        <div className="flex-1 overflow-y-auto bg-white rounded-b">
          <div className="max-w-3xl mx-auto p-6">
            <div
              className="prose prose-sm md:prose-base prose-gray max-w-none
                         prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mb-3
                         prose-p:text-gray-700 prose-p:leading-7 prose-p:mb-4 prose-p:text-[15px]
                         prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-gray-900 prose-strong:font-semibold
                         prose-em:text-gray-700
                         prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                         prose-ul:my-4 prose-ul:space-y-2
                         prose-ol:my-4 prose-ol:space-y-2
                         prose-li:text-gray-700 prose-li:text-[15px] prose-li:leading-7
                         prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-gray-800
                         prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4
                         prose-img:rounded-lg prose-img:shadow-sm prose-img:my-4
                         [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: cleanHtmlContent(article.content || '') }}
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
