import type { ArticleWithState } from '../../types';

interface ArticleContentProps {
  article: ArticleWithState;
  fontSize: number;
}

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
    .replace(/<\/br\s*\/?>\s*<br\s*\/?>/gi, '<br>')  // Clean up multiple br tags
    .replace(/(<br\s*\/?>){3,}/gi, '<br><br>');  // Limit consecutive br tags

  return cleaned;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const cleanedContent = cleanHtmlContent(article.content || '');

  return (
    <>
      <h1 className="text-3xl font-bold mb-4 text-gray-900 leading-tight">
        {article.title}
      </h1>

      <div className="text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
        <span className="font-medium">{article.feed?.title}</span>
        {article.author && (
          <>
            <span className="mx-2 text-gray-400">•</span>
            <span>{article.author}</span>
          </>
        )}
        <span className="mx-2 text-gray-400">•</span>
        <span>{new Date(article.published_at || '').toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</span>
      </div>

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
        dangerouslySetInnerHTML={{ __html: cleanedContent }}
      />
    </>
  );
}
