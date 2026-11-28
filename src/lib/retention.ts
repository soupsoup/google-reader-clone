import type { User } from '@supabase/supabase-js';

// "Remove items older than N days" setting. It lives in the account's user_metadata, so it
// follows the person to every device. Stories past the cutoff drop out of every list and unread
// count except Starred items. Nothing is deleted from the database, so choosing "Keep everything"
// brings them back.

export const RETENTION_CHOICES = [0, 7, 14, 30, 60, 90] as const;

export function retentionDays(user: User | null | undefined): number {
  const raw = Number(user?.user_metadata?.remove_after_days);
  return (RETENTION_CHOICES as readonly number[]).includes(raw) ? raw : 0;
}

export function retentionLabel(days: number): string {
  return days ? `Older than ${days} days` : 'Keep everything';
}

// Cutoff as an ISO timestamp, rounded down to the minute so query keys stay stable for a while.
export function retentionCutoff(days: number): string | null {
  if (!days) return null;
  const ms = Date.now() - days * 86_400_000;
  return new Date(ms - (ms % 60_000)).toISOString();
}

// PostgREST filter body (inside or=(...)): keep a story published after the cutoff, or one with
// no publish date that arrived after it.
export function retentionFilter(cutoff: string): string {
  return `published_at.gte.${cutoff},and(published_at.is.null,created_at.gte.${cutoff})`;
}
