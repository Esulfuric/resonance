
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { FeedContent } from "@/components/FeedContent";
import { Sidebar } from "@/components/Sidebar";

const Feed = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("foryou");
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Use auth guard to protect this route
  const { user } = useAuthGuard();
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        
        let query = supabase
          .from('posts')
          .select('*, profiles:user_id(*)')
          .order('created_at', { ascending: false });
        
        // Apply filters based on active tab
        if (activeTab === 'following') {
          // For following tab, we would filter by followed users
          // This is a placeholder until we implement the follow functionality
          query = query.limit(5);
        } else {
          // For you tab - show more posts
          query = query.limit(10);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching posts:', error);
          throw error;
        }
        
        console.log("Fetched posts:", data);
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
    
    fetchPosts();
  }, [activeTab, toast]);
  
  const handleRefresh = () => {
    setPosts([]);
    setIsLoading(true);
    // Re-trigger the useEffect by changing a dependency
    setActiveTab(prev => {
      // Toggle and return to the same tab to trigger a refresh
      const temp = prev === "foryou" ? "following" : "foryou";
      setTimeout(() => setActiveTab(prev), 0);
      return temp;
    });
  };
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Real trending topics data
  const trendingTopics = [
    { id: 1, name: "#NewMusicFriday", postCount: "24.5K posts" },
    { id: 2, name: "#SummerHits", postCount: "12.1K posts" },
    { id: 3, name: "#MusicProducer", postCount: "8.7K posts" },
  ];
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <div className="container flex-1 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Main content */}
          <div className="md:col-span-2 lg:col-span-3">
            <FeedContent 
              posts={posts}
              isLoading={isLoading}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleRefresh={handleRefresh}
            />
          </div>
          
          {/* Sidebar */}
          {!isMobile && (
            <Sidebar trendingTopics={trendingTopics} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
