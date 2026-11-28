// Only http(s) links from a feed become links, so a feed can't slip in a javascript: URL.
export function originalUrl(url: string | null | undefined): string | null {
  try {
    const parsed = new URL(url || '');
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
}

export interface ShareTarget {
  name: 'X' | 'LinkedIn' | 'Bluesky';
  href: string;
}

// Compose links for each network, pre-filled with the article title and the original article's link.
export function shareTargets(title: string | null | undefined, url: string): ShareTarget[] {
  const text = (title || '').trim();
  const q = encodeURIComponent;
  return [
    { name: 'X', href: `https://x.com/intent/post?text=${q(text)}&url=${q(url)}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${q(url)}` },
    { name: 'Bluesky', href: `https://bsky.app/intent/compose?text=${q(text ? `${text} ${url}` : url)}` },
  ];
}
