
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
  song_title?: string;
  profiles?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
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
      
      let query = supabase
        .from('posts')
        .select('*, profiles:user_id(*)')
        .order('created_at', { ascending: false });
      
      // Apply filters based on active tab
      if (activeTab === 'following') {
        // TODO: For following tab, we would filter by followed users
        // This is a placeholder - implement proper following filter once that feature is built
        query = query.limit(10);
      } else {
        // For you tab - show more posts
        query = query.limit(20);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setPosts(data || []);
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

  const handleRefresh = () => {
    fetchPosts();
  };

  // Map the posts data to the format expected by PostCard component
  const displayPosts = posts.map((post) => {
    const profile = post.profiles || {};
    return {
      id: post.id,
      user: {
        name: profile.full_name || profile.username || "User",
        username: profile.username || "user",
        avatar: profile.avatar_url || "https://randomuser.me/api/portraits/women/42.jpg",
      },
      timestamp: new Date(post.created_at).toLocaleDateString(),
      content: post.content,
      songInfo: post.song_title ? {
        title: post.song_title,
        artist: "Unknown Artist",
        albumCover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=200&auto=format&fit=crop",
      } : undefined,
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
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
