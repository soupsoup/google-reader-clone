import type { ArticleWithState } from '../../types';

interface ArticleContentProps {
  article: ArticleWithState;
  fontSize: number;
}

export function ArticleContent({ article, fontSize }: ArticleContentProps) {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
      <div className="text-sm text-gray-500 mb-4">
        <span>{article.feed?.title}</span>
        <span className="mx-2">|</span>
        <span>{new Date(article.published_at || '').toLocaleString()}</span>
      </div>
      <div
        className="prose max-w-none"
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />
    </>
  );
}
