-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Feeds table (global, shared across users)
CREATE TABLE feeds (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  site_url TEXT,
  favicon_url TEXT,
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_feeds_url ON feeds(url);

-- Folders table (per user)
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_folders_user_id ON folders(user_id);

-- User feed subscriptions (join table)
CREATE TABLE user_feeds (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feed_id UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  custom_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feed_id)
);

CREATE INDEX idx_user_feeds_user_id ON user_feeds(user_id);
CREATE INDEX idx_user_feeds_feed_id ON user_feeds(feed_id);
CREATE INDEX idx_user_feeds_folder_id ON user_feeds(folder_id);

-- Articles table (global, linked to feeds)
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  feed_id UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  guid TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  author TEXT,
  content TEXT,
  summary TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feed_id, guid)
);

CREATE INDEX idx_articles_feed_id ON articles(feed_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_feed_published ON articles(feed_id, published_at DESC);

-- User article state (read/starred per user)
CREATE TABLE user_articles (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  starred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

CREATE INDEX idx_user_articles_user_id ON user_articles(user_id);
CREATE INDEX idx_user_articles_article_id ON user_articles(article_id);
CREATE INDEX idx_user_articles_starred ON user_articles(user_id, is_starred) WHERE is_starred = TRUE;
CREATE INDEX idx_user_articles_unread ON user_articles(user_id, is_read) WHERE is_read = FALSE;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_articles ENABLE ROW LEVEL SECURITY;

-- Feeds: Anyone can read, only service role can insert/update
CREATE POLICY "Feeds are viewable by authenticated users" ON feeds
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Feeds can be inserted by authenticated users" ON feeds
  FOR INSERT TO authenticated WITH CHECK (true);

-- Folders: Users can only access their own folders
CREATE POLICY "Users can view their own folders" ON folders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders" ON folders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" ON folders
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" ON folders
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User Feeds: Users can only access their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_feeds
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can subscribe to feeds" ON user_feeds
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their subscriptions" ON user_feeds
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can unsubscribe from feeds" ON user_feeds
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Articles: Anyone can read articles from feeds they're subscribed to
CREATE POLICY "Users can view articles from subscribed feeds" ON articles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_feeds
      WHERE user_feeds.user_id = auth.uid()
      AND user_feeds.feed_id = articles.feed_id
    )
  );

CREATE POLICY "Service role can insert articles" ON articles
  FOR INSERT TO service_role WITH CHECK (true);

-- User Articles: Users can only access their own article states
CREATE POLICY "Users can view their own article states" ON user_articles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own article states" ON user_articles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own article states" ON user_articles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own article states" ON user_articles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Function to get unread count for a feed
CREATE OR REPLACE FUNCTION get_feed_unread_count(p_user_id UUID, p_feed_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM articles a
    LEFT JOIN user_articles ua ON ua.article_id = a.id AND ua.user_id = p_user_id
    WHERE a.feed_id = p_feed_id
    AND (ua.is_read IS NULL OR ua.is_read = FALSE)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all articles as read for a feed
CREATE OR REPLACE FUNCTION mark_feed_as_read(p_user_id UUID, p_feed_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_articles (user_id, article_id, is_read, read_at)
  SELECT p_user_id, a.id, TRUE, NOW()
  FROM articles a
  WHERE a.feed_id = p_feed_id
  ON CONFLICT (user_id, article_id)
  DO UPDATE SET is_read = TRUE, read_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all articles as read for a folder
CREATE OR REPLACE FUNCTION mark_folder_as_read(p_user_id UUID, p_folder_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_articles (user_id, article_id, is_read, read_at)
  SELECT p_user_id, a.id, TRUE, NOW()
  FROM articles a
  JOIN user_feeds uf ON uf.feed_id = a.feed_id
  WHERE uf.user_id = p_user_id AND uf.folder_id = p_folder_id
  ON CONFLICT (user_id, article_id)
  DO UPDATE SET is_read = TRUE, read_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all articles as read
CREATE OR REPLACE FUNCTION mark_all_as_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_articles (user_id, article_id, is_read, read_at)
  SELECT p_user_id, a.id, TRUE, NOW()
  FROM articles a
  JOIN user_feeds uf ON uf.feed_id = a.feed_id
  WHERE uf.user_id = p_user_id
  ON CONFLICT (user_id, article_id)
  DO UPDATE SET is_read = TRUE, read_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
