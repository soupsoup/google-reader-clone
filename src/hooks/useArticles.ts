import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { ArticleWithState, ViewType } from '../types';

interface UseArticlesOptions {
  viewType: ViewType;
  viewId?: string;
  searchQuery?: string;
}

export function useArticles({ viewType, viewId, searchQuery }: UseArticlesOptions) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const articlesQuery = useQuery({
    queryKey: ['articles', user?.id, viewType, viewId, searchQuery],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('articles')
        .select(`
          *,
          feed:feeds(id, title, favicon_url)
        `)
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(100);

      // Filter by view type
      if (viewType === 'feed' && viewId) {
        query = query.eq('feed_id', viewId);
      } else if (viewType === 'folder' && viewId) {
        // Get feeds in this folder
        const { data: userFeeds } = await supabase
          .from('user_feeds')
          .select('feed_id')
          .eq('user_id', user.id)
          .eq('folder_id', viewId);

        const feedIds = userFeeds?.map(uf => uf.feed_id) || [];
        if (feedIds.length === 0) return [];
        query = query.in('feed_id', feedIds);
      } else if (viewType === 'all' || viewType === 'starred') {
        // Get all user's subscribed feeds
        const { data: userFeeds } = await supabase
          .from('user_feeds')
          .select('feed_id')
          .eq('user_id', user.id);

        const feedIds = userFeeds?.map(uf => uf.feed_id) || [];
        if (feedIds.length === 0) return [];
        query = query.in('feed_id', feedIds);
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data: articles, error } = await query;
      if (error) throw error;

      // Get user article states
      const articleIds = articles?.map(a => a.id) || [];
      const { data: userArticles } = await supabase
        .from('user_articles')
        .select('*')
        .eq('user_id', user.id)
        .in('article_id', articleIds);

      const stateMap = new Map(userArticles?.map(ua => [ua.article_id, ua]) || []);

      // Combine articles with their state
      const articlesWithState: ArticleWithState[] = (articles || []).map(article => {
        const state = stateMap.get(article.id);
        return {
          ...article,
          is_read: state?.is_read || false,
          is_starred: state?.is_starred || false,
          user_article_id: state?.id,
        };
      });

      // For starred view, filter to only starred articles
      if (viewType === 'starred') {
        return articlesWithState.filter(a => a.is_starred);
      }

      return articlesWithState;
    },
    enabled: !!user,
  });

  const toggleReadMutation = useMutation({
    mutationFn: async ({ articleId, isRead }: { articleId: string; isRead: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_articles')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          is_read: isRead,
          read_at: isRead ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,article_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });

  const toggleStarMutation = useMutation({
    mutationFn: async ({ articleId, isStarred }: { articleId: string; isStarred: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_articles')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          is_starred: isStarred,
          starred_at: isStarred ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,article_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'all' | 'feed' | 'folder'; id?: string }) => {
      if (!user) throw new Error('Not authenticated');

      if (type === 'all') {
        const { error } = await supabase.rpc('mark_all_as_read', { p_user_id: user.id });
        if (error) throw error;
      } else if (type === 'feed' && id) {
        const { error } = await supabase.rpc('mark_feed_as_read', {
          p_user_id: user.id,
          p_feed_id: id,
        });
        if (error) throw error;
      } else if (type === 'folder' && id) {
        const { error } = await supabase.rpc('mark_folder_as_read', {
          p_user_id: user.id,
          p_folder_id: id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });

  return {
    articles: articlesQuery.data || [],
    isLoading: articlesQuery.isLoading,
    error: articlesQuery.error,
    refetch: articlesQuery.refetch,
    toggleRead: toggleReadMutation.mutateAsync,
    toggleStar: toggleStarMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
  };
}
