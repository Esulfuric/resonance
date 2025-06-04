
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { searchUsersAndPosts } from "@/services/postService";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResults } from "@/components/search/SearchResults";
import { SuggestedContent } from "@/components/search/SuggestedContent";
import { MobileCharts } from "@/components/MobileCharts";

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  user_type?: string | null;
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ users: UserProfile[], posts: any[] }>({ users: [], posts: [] });
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [recentlyActive, setRecentlyActive] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("suggested");
  const { toast } = useToast();
  
  const { user } = useAuthGuard();
  
  useEffect(() => {
    fetchRandomProfiles();
    fetchRecentlyActive();
  }, []);
  
  const fetchRandomProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '')
        .limit(8);
        
      if (error) throw error;
      
      setSuggestedUsers(data as UserProfile[]);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchRecentlyActive = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '')
        .order('updated_at', { ascending: false })
        .limit(8);
        
      if (error) throw error;
      
      setRecentlyActive(data as UserProfile[]);
    } catch (error: any) {
      console.error('Error fetching recent profiles:', error);
    }
  };
  
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const results = await searchUsersAndPosts(searchQuery);
      setSearchResults(results);
      
      if (results.users.length === 0 && results.posts.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term",
        });
      }
    } catch (error: any) {
      console.error('Error searching:', error);
      toast({
        title: "Error searching",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const formatPostForDisplay = (post: any) => ({
    id: post.id,
    user: {
      name: post.profiles?.full_name || post.profiles?.username || "User",
      username: post.profiles?.username || "user",
      avatar: post.profiles?.avatar_url || "https://randomuser.me/api/portraits/women/42.jpg",
      user_type: post.profiles?.user_type,
    },
    timestamp: new Date(post.created_at).toLocaleDateString(),
    content: post.content,
    imageUrl: post.image_url,
    songInfo: post.song_title ? {
      title: post.song_title,
      artist: "Unknown Artist",
      albumCover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=200&auto=format&fit=crop",
    } : undefined,
    stats: {
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      shares: 0,
    },
  });
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="container flex-1 py-6">
        <h1 className="text-2xl font-bold mb-6">Search</h1>
        
        <SearchInput 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          isSearching={isSearching}
        />
        
        {/* Mobile Charts - Only show on mobile and when not searching */}
        {!searchQuery.trim() && <MobileCharts />}
        
        {searchResults.users.length > 0 || searchResults.posts.length > 0 ? (
          <SearchResults 
            searchResults={searchResults}
            formatPostForDisplay={formatPostForDisplay}
          />
        ) : (
          <SuggestedContent 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            suggestedUsers={suggestedUsers}
            recentlyActive={recentlyActive}
          />
        )}
      </main>
    </div>
  );
};

export default SearchPage;
