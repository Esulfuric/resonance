
import { useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Post } from "@/types/post";
import { fetchLatestPosts, fetchUserPosts, deletePost } from "@/services/postService";
import { useToast } from "@/hooks/use-toast";

export const usePostsOptimized = (userId?: string) => {
  const [currentTab, setCurrentTab] = useState<string>('foryou');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const observer = useRef<IntersectionObserver>();

  const queryKey = currentTab === 'following' && userId 
    ? ['posts', 'following', userId, offset] 
    : ['posts', 'foryou', offset];

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const limit = 10;
      if (currentTab === 'following' && userId) {
        return await fetchUserPosts(userId, limit, offset);
      }
      return await fetchLatestPosts(limit, offset);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const limit = 10;
      const newOffset = offset + limit;
      
      let newPosts: Post[] = [];
      if (currentTab === 'following' && userId) {
        newPosts = await fetchUserPosts(userId, limit, newOffset);
      } else {
        newPosts = await fetchLatestPosts(limit, newOffset);
      }
      
      if (newPosts.length < limit) {
        setHasMore(false);
      }
      
      if (newPosts.length > 0) {
        // Update cache with new posts
        const newQueryKey = currentTab === 'following' && userId 
          ? ['posts', 'following', userId, newOffset] 
          : ['posts', 'foryou', newOffset];
        
        queryClient.setQueryData(newQueryKey, newPosts);
        setOffset(newOffset);
      }
    } catch (error: any) {
      toast({
        title: "Error loading more posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentTab, userId, offset, isLoadingMore, hasMore, queryClient, toast]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, loadMorePosts]);

  const handleDeletePost = async (postId: string) => {
    try {
      const result = await deletePost(postId);
      
      if (result.success) {
        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully.",
        });
        
        // Invalidate and refetch posts
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      } else {
        throw result.error;
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchPosts = useCallback((tab: string) => {
    setCurrentTab(tab);
    setOffset(0);
    setHasMore(true);
    
    // Invalidate current queries and fetch new ones
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  }, [queryClient]);

  return {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    fetchPosts,
    handleDeletePost,
    lastElementRef,
    error
  };
};
