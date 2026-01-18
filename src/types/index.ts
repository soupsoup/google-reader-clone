export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Feed {
  id: string;
  url: string;
  title: string;
  description: string | null;
  site_url: string | null;
  favicon_url: string | null;
  last_fetched_at: string | null;
  created_at: string;
}

export interface UserFeed {
  id: string;
  user_id: string;
  feed_id: string;
  folder_id: string | null;
  custom_title: string | null;
  created_at: string;
  feed?: Feed;
  unread_count?: number;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Article {
  id: string;
  feed_id: string;
  guid: string;
  title: string;
  url: string;
  author: string | null;
  content: string | null;
  summary: string | null;
  published_at: string | null;
  created_at: string;
  feed?: Feed;
}

export interface UserArticle {
  id: string;
  user_id: string;
  article_id: string;
  is_read: boolean;
  is_starred: boolean;
  read_at: string | null;
  starred_at: string | null;
  created_at: string;
}

export interface ArticleWithState extends Article {
  is_read: boolean;
  is_starred: boolean;
  user_article_id?: string;
}

export type ViewType = 'all' | 'starred' | 'feed' | 'folder';

export interface ViewState {
  type: ViewType;
  id?: string;
  title: string;
}

export interface FeedWithUnread extends Feed {
  unread_count: number;
  folder_id: string | null;
  custom_title: string | null;
  user_feed_id: string;
}

export interface FolderWithFeeds extends Folder {
  feeds: FeedWithUnread[];
  unread_count: number;
  is_expanded: boolean;
}

export type Layout = 'modal' | 'side-by-side' | 'top-and-bottom';
