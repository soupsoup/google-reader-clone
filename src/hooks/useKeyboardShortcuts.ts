import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcuts {
  onNextArticle?: () => void;
  onPrevArticle?: () => void;
  onOpenArticle?: () => void;
  onCloseArticle?: () => void;
  onToggleStar?: () => void;
  onToggleRead?: () => void;
  onMarkAllRead?: () => void;
  onGoHome?: () => void;
  onGoAll?: () => void;
  onGoStarred?: () => void;
  onSearch?: () => void;
  onRefresh?: () => void;
  onAddFeed?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const pendingKey = useRef<string | null>(null);
  const pendingTimeout = useRef<number | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in an input
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement).isContentEditable
    ) {
      return;
    }

    const key = e.key.toLowerCase();

    // Clear pending key after timeout
    if (pendingTimeout.current) {
      clearTimeout(pendingTimeout.current);
    }

    // Handle g + key combinations
    if (pendingKey.current === 'g') {
      pendingKey.current = null;
      switch (key) {
        case 'h':
          e.preventDefault();
          shortcuts.onGoHome?.();
          return;
        case 'a':
          e.preventDefault();
          shortcuts.onGoAll?.();
          return;
        case 's':
          e.preventDefault();
          shortcuts.onGoStarred?.();
          return;
      }
    }

    // Start g combination
    if (key === 'g' && !e.metaKey && !e.ctrlKey) {
      pendingKey.current = 'g';
      pendingTimeout.current = window.setTimeout(() => {
        pendingKey.current = null;
      }, 1000);
      return;
    }

    // Single key shortcuts
    switch (key) {
      case 'j':
        e.preventDefault();
        shortcuts.onNextArticle?.();
        break;
      case 'k':
        e.preventDefault();
        shortcuts.onPrevArticle?.();
        break;
      case 'o':
      case 'enter':
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          shortcuts.onOpenArticle?.();
        }
        break;
      case 's':
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          shortcuts.onToggleStar?.();
        }
        break;
      case 'm':
        e.preventDefault();
        shortcuts.onToggleRead?.();
        break;
      case 'a':
        if (e.shiftKey) {
          e.preventDefault();
          shortcuts.onMarkAllRead?.();
        } else if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          shortcuts.onAddFeed?.();
        }
        break;
      case '/':
        e.preventDefault();
        shortcuts.onSearch?.();
        break;
      case 'r':
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          shortcuts.onRefresh?.();
        }
        break;
      case 'escape':
        pendingKey.current = null;
        break;
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current);
      }
    };
  }, [handleKeyDown]);
}
