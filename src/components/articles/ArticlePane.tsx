import type { ArticleWithState } from '../../types';
import { ArticleContent } from './ArticleContent';

interface ArticlePaneProps {
  article: ArticleWithState | null;
  fontSize: number;
}

export function ArticlePane({ article, fontSize }: ArticlePaneProps) {
  if (!article) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
        <div className="text-center">
          <p className="text-lg">Select an article to read</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-5xl mx-auto px-8 py-8" style={{ fontSize: `${fontSize}px` }}>
        <ArticleContent article={article} fontSize={fontSize} />
      </div>
    </div>
  );
}
