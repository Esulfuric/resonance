
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
  const { toast } = useToast();
  const observer = useRef<IntersectionObserver>();

  const fetchPosts = async (tab: string, loadMore = false) => {
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
      
      // Sort posts by creation date, newest first
      fetchedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      if (loadMore) {
        setPosts(prev => [...prev, ...fetchedPosts]);
      } else {
        setPosts(fetchedPosts);
      }
      
      setHasMore(fetchedPosts.length === limit);
      setOffset(currentOffset + limit);
      
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts('foryou', true);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore]);

  const handleDeletePost = async (postId: string) => {
    try {
      const result = await deletePost(postId);
      
      if (result.success) {
        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully.",
        });
        
        // Update local state
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
    fetchPosts,
    handleDeletePost,
    setPosts,
    lastElementRef
  };
};
