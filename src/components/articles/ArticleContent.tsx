import type { ArticleWithState } from '../../types';

interface ArticleContentProps {
  article: ArticleWithState;
  fontSize: number;
}

export function ArticleContent({ article, fontSize }: ArticleContentProps) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900 leading-tight">{article.title}</h1>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
        {article.author && (
          <>
            <span className="font-medium">{article.author}</span>
            <span className="text-gray-400">•</span>
          </>
        )}
        <span className="text-[#15c] hover:underline cursor-pointer">{article.feed?.title}</span>
        <span className="text-gray-400">•</span>
        <span className="whitespace-nowrap">{new Date(article.published_at || '').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        })}</span>
      </div>

      <div
        className="article-content"
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: article.content || article.summary || '<p class="text-gray-500 italic">No content available</p>' }}
      />
    </div>
  );
}
