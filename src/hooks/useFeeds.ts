import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { Feed, Folder, FeedWithUnread, FolderWithFeeds } from '../types';

export function useFeeds() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const feedsQuery = useQuery({
    queryKey: ['feeds', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user's subscribed feeds with unread counts
      const { data: userFeeds, error: userFeedsError } = await supabase
        .from('user_feeds')
        .select(`
          id,
          folder_id,
          custom_title,
          feed:feeds(*)
        `)
        .eq('user_id', user.id);

      if (userFeedsError) throw userFeedsError;

      // Get unread counts for each feed
      const feedsWithUnread: FeedWithUnread[] = await Promise.all(
        (userFeeds || []).map(async (uf) => {
          const feed = uf.feed as unknown as Feed;

          // Get all articles and read articles
          const { data: articles } = await supabase
            .from('articles')
            .select('id')
            .eq('feed_id', feed.id);

          const { data: readArticles } = await supabase
            .from('user_articles')
            .select('article_id')
            .eq('user_id', user.id)
            .eq('is_read', true);

          const readIds = new Set(readArticles?.map(ra => ra.article_id) || []);
          const unreadCount = (articles || []).filter(a => !readIds.has(a.id)).length;

          return {
            ...feed,
            user_feed_id: uf.id,
            folder_id: uf.folder_id,
            custom_title: uf.custom_title,
            unread_count: unreadCount,
          };
        })
      );

      return feedsWithUnread;
    },
    enabled: !!user,
  });

  const foldersQuery = useQuery({
    queryKey: ['folders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as Folder[];
    },
    enabled: !!user,
  });

  // Combine feeds and folders into organized structure
  const organizedFeeds = useQuery({
    queryKey: ['organized-feeds', user?.id, feedsQuery.data, foldersQuery.data],
    queryFn: () => {
      const feeds = feedsQuery.data || [];
      const folders = foldersQuery.data || [];

      // Create folder structure with feeds
      const foldersWithFeeds: FolderWithFeeds[] = folders.map(folder => {
        const folderFeeds = feeds.filter(f => f.folder_id === folder.id);
        const unreadCount = folderFeeds.reduce((sum, f) => sum + f.unread_count, 0);
        return {
          ...folder,
          feeds: folderFeeds,
          unread_count: unreadCount,
          is_expanded: true, // Default expanded
        };
      });

      // Get feeds without folders
      const unfolderedFeeds = feeds.filter(f => !f.folder_id);

      // Total unread count
      const totalUnread = feeds.reduce((sum, f) => sum + f.unread_count, 0);

      return {
        folders: foldersWithFeeds,
        unfolderedFeeds,
        totalUnread,
      };
    },
    enabled: !!feedsQuery.data && !!foldersQuery.data,
  });

  const addFeedMutation = useMutation({
    mutationFn: async ({ url, folderId }: { url: string; folderId?: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Call edge function to fetch and parse feed
      const { data, error } = await supabase.functions.invoke('fetch-feeds', {
        body: { feed_url: url, user_id: user.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // If folder specified, update the user_feed
      if (folderId && data.feed) {
        await supabase
          .from('user_feeds')
          .update({ folder_id: folderId })
          .eq('user_id', user.id)
          .eq('feed_id', data.feed.id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  const removeFeedMutation = useMutation({
    mutationFn: async (feedId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_feeds')
        .delete()
        .eq('user_id', user.id)
        .eq('feed_id', feedId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('folders')
        .insert({ user_id: user.id, name })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });

  const moveFeedToFolderMutation = useMutation({
    mutationFn: async ({ feedId, folderId }: { feedId: string; folderId: string | null }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_feeds')
        .update({ folder_id: folderId })
        .eq('user_id', user.id)
        .eq('feed_id', feedId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });

  const refreshFeedMutation = useMutation({
    mutationFn: async (feedId: string) => {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase.functions.invoke('fetch-feeds', {
        body: { feed_id: feedId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  return {
    feeds: feedsQuery.data || [],
    folders: foldersQuery.data || [],
    organizedFeeds: organizedFeeds.data,
    isLoading: feedsQuery.isLoading || foldersQuery.isLoading,
    error: feedsQuery.error || foldersQuery.error,
    addFeed: addFeedMutation.mutateAsync,
    removeFeed: removeFeedMutation.mutateAsync,
    createFolder: createFolderMutation.mutateAsync,
    deleteFolder: deleteFolderMutation.mutateAsync,
    moveFeedToFolder: moveFeedToFolderMutation.mutateAsync,
    refreshFeed: refreshFeedMutation.mutateAsync,
    isAddingFeed: addFeedMutation.isPending,
  };
}
