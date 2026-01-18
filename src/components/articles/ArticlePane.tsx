import type { ArticleWithState } from '../../types';
import { ArticleContent } from './ArticleContent';

interface ArticlePaneProps {
  article: ArticleWithState | null;
  fontSize: number;
}

export function ArticlePane({ article, fontSize }: ArticlePaneProps) {
  if (!article) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select an article to read
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ fontSize: `${fontSize}px` }}>
      <ArticleContent article={article} fontSize={fontSize} />
    </div>
  );
}
