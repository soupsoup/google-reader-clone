import { Share2 } from 'lucide-react';
import { originalUrl, shareTargets } from '../../lib/share';

interface ShareButtonsProps {
  title: string | null | undefined;
  url: string | null | undefined;
  className?: string;
}

// Share the original article (not Foogle) to X, LinkedIn or Bluesky in a new tab.
export function ShareButtons({ title, url, className = '' }: ShareButtonsProps) {
  const href = originalUrl(url);
  if (!href) return null;

  return (
    <div className={`flex items-center gap-2 text-[13px] text-gray-600 ${className}`}>
      <Share2 className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
      <span>Share:</span>
      {shareTargets(title, href).map((t, i) => (
        <span key={t.name} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-300">|</span>}
          <a
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#15c] hover:underline"
            title={`Share the original article on ${t.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            {t.name}
          </a>
        </span>
      ))}
    </div>
  );
}
