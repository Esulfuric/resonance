
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  user_type: string | null;
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [recentlyActive, setRecentlyActive] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("suggested");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use auth guard to protect this route
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
        .select('*, posts(count)')
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
      // Search for users by username, name, or bio containing the search query
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
        .neq('id', user?.id || '') // Exclude the current user
        .limit(20);
        
      if (error) throw error;
      
      setSearchResults(data as UserProfile[]);
      
      if (data?.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term",
        });
      }
    } catch (error: any) {
      console.error('Error searching users:', error);
      toast({
        title: "Error searching users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  const renderUserCard = (profile: UserProfile) => (
    <Card 
      key={profile.id} 
      className="hover:bg-accent transition-colors cursor-pointer"
      onClick={() => navigate(`/profile/${profile.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>
              {(profile.full_name?.[0] || profile.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{profile.full_name || profile.username || "User"}</p>
            <p className="text-sm text-muted-foreground truncate">
              @{profile.username || "user"}{" "}
              {profile.user_type && (
                <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground ml-1">
                  {profile.user_type}
                </span>
              )}
            </p>
            {profile.bio && (
              <p className="text-sm truncate mt-1">{profile.bio}</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="container flex-1 py-6">
        <h1 className="text-2xl font-bold mb-6">Search</h1>
        
        <form onSubmit={handleSearch} className="relative mb-6 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for users, music, or posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-20 py-6"
          />
          <Button 
            type="submit"
            variant="default" 
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-resonance-green hover:bg-resonance-green/90" 
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>
        
        {searchResults.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Search Results</h2>
            <div className="space-y-3">
              {searchResults.map(renderUserCard)}
            </div>
          </div>
        ) : (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="suggested">Suggested Users</TabsTrigger>
              <TabsTrigger value="active">Recently Active</TabsTrigger>
            </TabsList>
            
            <TabsContent value="suggested" className="space-y-4">
              <h2 className="text-lg font-semibold">Suggested Users</h2>
              <div className="space-y-3">
                {suggestedUsers.length > 0 ? (
                  suggestedUsers.map(renderUserCard)
                ) : (
                  <p className="text-muted-foreground">No suggested users found</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="space-y-4">
              <h2 className="text-lg font-semibold">Recently Active</h2>
              <div className="space-y-3">
                {recentlyActive.length > 0 ? (
                  recentlyActive.map(renderUserCard)
                ) : (
                  <p className="text-muted-foreground">No recently active users found</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
