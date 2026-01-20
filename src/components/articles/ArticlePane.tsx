import type { ArticleWithState } from '../../types';
import { ArticleContent } from './ArticleContent';

interface ArticlePaneProps {
  article: ArticleWithState | null;
  fontSize: number;
}

export function ArticlePane({ article, fontSize }: ArticlePaneProps) {
  if (!article) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">📖</div>
          <div className="text-lg font-medium">Select an article to read</div>
          <div className="text-sm text-gray-400 mt-2">Choose an article from the list to view its content</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-6">
        <ArticleContent article={article} fontSize={fontSize} />
      </div>
    </div>
  );
}
