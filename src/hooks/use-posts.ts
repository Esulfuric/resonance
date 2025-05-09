
import { useState, useEffect } from "react";
import { Post } from "@/types/post";
import { fetchLatestPosts, fetchUserPosts, deletePost } from "@/services/postService";
import { useToast } from "@/hooks/use-toast";

export const usePosts = (userId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async (tab: string) => {
    try {
      setIsLoading(true);
      
      let fetchedPosts: Post[] = [];
      
      if (tab === 'following' && userId) {
        fetchedPosts = await fetchUserPosts(userId);
      } else {
        // For you tab - show all posts
        fetchedPosts = await fetchLatestPosts(20);
      }
      
      setPosts(fetchedPosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    fetchPosts,
    handleDeletePost
  };
};
