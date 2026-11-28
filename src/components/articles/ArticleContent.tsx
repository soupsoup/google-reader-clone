import { ExternalLink } from 'lucide-react';
import type { ArticleWithState } from '../../types';
import { originalUrl } from '../../lib/share';
import { ShareButtons } from './ShareButtons';

interface ArticleContentProps {
  article: ArticleWithState;
  fontSize: number;
}

// Reduce paragraph spacing by manipulating the HTML directly
function cleanHtmlContent(html: string): string {
  if (!html) return '';

  // Replace closing paragraph tags with a small line break instead of default spacing
  let cleaned = html.replace(/<\/p>\s*<p>/gi, '<br><br>');
  cleaned = cleaned.replace(/<p>/gi, '');
  cleaned = cleaned.replace(/<\/p>/gi, '<br><br>');

  return cleaned;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const cleanedContent = cleanHtmlContent(article.content || '');
  const href = originalUrl(article.url);

  return (
    <>
      <h1 className="text-3xl font-bold mb-4 text-gray-900 leading-tight">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline" title="Open the original article (o)">
            {article.title}
          </a>
        ) : (
          article.title
        )}
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
        <ShareButtons title={article.title} url={article.url} className="mt-2" />
      </div>

      <div
        className="text-[18px] text-gray-700"
        style={{
          fontSize: '18px',
          lineHeight: '1.6',
          wordWrap: 'break-word'
        }}
        dangerouslySetInnerHTML={{ __html: cleanedContent }}
      />

      {href && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[14px] text-[#15c] hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Read original article
          </a>
          <ShareButtons title={article.title} url={article.url} className="mt-3" />
        </div>
      )}
    </>
  );
}
