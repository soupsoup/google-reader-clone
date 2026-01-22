import type { ArticleWithState } from '../../types';

interface ArticleContentProps {
  article: ArticleWithState;
  fontSize: number;
}

// Don't manipulate HTML, just return it as-is
function cleanHtmlContent(html: string): string {
  return html || '';
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
        className="text-[18px] text-gray-700 article-content"
        style={{
          fontSize: '18px',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        dangerouslySetInnerHTML={{ __html: cleanedContent }}
      />
      <style>{`
        .article-content p {
          margin: 0;
          margin-bottom: 0.1em;
        }
        .article-content br {
          display: block;
          content: "";
          margin-top: 0;
        }
      `}</style>
    </>
  );
}
