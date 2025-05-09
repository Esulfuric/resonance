
import { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/lib/supabase-provider";

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited?: boolean;
  song_title?: string;
  image_url?: string;
  profiles?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
    user_type?: 'musician' | 'listener';
  };
}

interface FeedContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FeedContent = ({ activeTab, setActiveTab }: FeedContentProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useSupabase();
  
  useEffect(() => {
    fetchPosts();
  }, [activeTab]);
  
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      // Start with a base query
      let query = supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          created_at,
          updated_at,
          song_title,
          profiles:user_id(
            full_name,
            username,
            avatar_url,
            user_type
          )
        `)
        .order('created_at', { ascending: false });
      
      // Apply filters based on active tab
      if (activeTab === 'following' && user) {
        // For following tab, get followed users first, then their posts
        const { data: followedUsers } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
          
        if (followedUsers && followedUsers.length > 0) {
          const followingIds = followedUsers.map(fu => fu.following_id);
          query = query.in('user_id', followingIds);
        } else {
          // No followed users, return empty array
          setPosts([]);
          setIsLoading(false);
          return;
        }
      } else {
        // For you tab - show all posts
        query = query.limit(20);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      console.log("Posts fetched:", data);
      
      if (data) {
        // Add is_edited flag based on created_at and updated_at timestamps
        const postsWithEditFlag = data.map(post => {
          const createdDate = new Date(post.created_at).getTime();
          const updatedDate = new Date(post.updated_at).getTime();
          const isEdited = updatedDate - createdDate > 1000; // If more than 1 second difference, consider it edited
          return { ...post, is_edited: isEdited };
        });

        setPosts(postsWithEditFlag);
      } else {
        setPosts([]);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPosts();
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });

      // Refresh posts after deletion
      fetchPosts();

    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Map the posts data to the format expected by PostCard component
  const displayPosts = posts.map((post) => {
    const profile = post.profiles || {};
    return {
      id: post.id,
      user_id: post.user_id,
      user: {
        name: profile.full_name || profile.username || "User",
        username: profile.username || "user",
        avatar: profile.avatar_url || "https://randomuser.me/api/portraits/women/42.jpg",
        user_type: profile.user_type
      },
      timestamp: new Date(post.created_at).toLocaleDateString(),
      content: post.content,
      isEdited: post.is_edited,
      songInfo: post.song_title ? {
        title: post.song_title,
        artist: "Unknown Artist",
        albumCover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=200&auto=format&fit=crop",
      } : undefined,
      imageUrl: post.image_url,
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
      isOwner: user?.id === post.user_id,
      onDelete: () => handleDeletePost(post.id),
    };
  });

  return (
    <Tabs defaultValue={activeTab} className="mb-6" onValueChange={setActiveTab}>
      <div className="flex items-center justify-between">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="foryou">For You</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full" 
          onClick={handleRefresh} 
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <TabsContent value="foryou" className="space-y-4 mt-4">
        {isLoading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : displayPosts.length > 0 ? (
          <div className="space-y-4">
            {displayPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="following" className="mt-4">
        {isLoading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : (
          <div className="space-y-4">
            {displayPosts.length > 0 ? (
              displayPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))
            ) : (
              <div className="p-8 text-center">
                <h3 className="text-xl font-medium mb-2">Follow more people to see their posts</h3>
                <p className="text-muted-foreground mb-4">When you follow someone, you'll see their posts here.</p>
                <Button onClick={() => window.location.href = '/search'}>Find people to follow</Button>
              </div>
            )}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
