
import { useState, useEffect, useCallback, useRef } from "react";
import { Post } from "@/types/post";
import { fetchLatestPosts, fetchUserPosts, deletePost } from "@/services/postService";
import { useToast } from "@/hooks/use-toast";

export const usePosts = (userId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [currentTab, setCurrentTab] = useState<string>('foryou');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const observer = useRef<IntersectionObserver>();
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Function to force-clear loading if fetch hangs
  const startLoadingTimeout = () => {
    if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    loadingTimeout.current = setTimeout(() => {
      if (isLoading || isLoadingMore) {
        setIsLoading(false);
        setIsLoadingMore(false);
        setError("Couldn't refresh feed. Please try again.");
      }
    }, 10000); // 10 seconds
  };

  const clearLoadingTimeout = () => {
    if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    loadingTimeout.current = null;
  };

  const fetchPosts = async (tab: string, loadMore = false) => {
    setError(null);
    if (!loadMore) startLoadingTimeout();

    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setOffset(0);
        setPosts([]);
      }
      const currentOffset = loadMore ? offset : 0;
      const limit = 10;

      let fetchedPosts: Post[] = [];
      if (tab === 'following' && userId) {
        fetchedPosts = await fetchUserPosts(userId, limit, currentOffset);
      } else {
        fetchedPosts = await fetchLatestPosts(limit, currentOffset);
      }

      fetchedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (loadMore) {
        setPosts(prev => [...prev, ...fetchedPosts]);
      } else {
        setPosts(fetchedPosts);
      }

      setHasMore(fetchedPosts.length === limit);
      setOffset(currentOffset + limit);
      setCurrentTab(tab);

    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setError("Failed to load posts. Please try again.");
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      clearLoadingTimeout();
    }
  };

  // Automatic loading timeout on mount and fetch
  useEffect(() => {
    if (isLoading) startLoadingTimeout();
    return () => clearLoadingTimeout();
  }, [isLoading]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts(currentTab, true);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, currentTab, fetchPosts]);

  const handleDeletePost = async (postId: string) => {
    try {
      const result = await deletePost(postId);

      if (result.success) {
        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully.",
        });
        setPosts(posts.filter(post => post.id !== postId));
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

  return {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    fetchPosts,
    handleDeletePost,
    setPosts,
    lastElementRef
  };
};
