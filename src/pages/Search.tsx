
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { UserSearch } from "@/components/UserSearch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [recentSearches, setRecentSearches] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  
  // Use auth guard to protect this route
  const { user } = useAuthGuard();
  
  useEffect(() => {
    fetchRandomProfiles();
  }, []);
  
  const fetchRandomProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '')
        .limit(5);
        
      if (error) throw error;
      
      setRecentSearches(data as UserProfile[]);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
    }
  };
  
  const handleSearch = async () => {
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
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  const renderUserCard = (profile: UserProfile) => (
    <Link to={`/profile/${profile.id}`} key={profile.id}>
      <Card className="hover:bg-accent transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>
                {profile.full_name?.[0] || profile.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile.full_name}</p>
              <p className="text-sm text-muted-foreground truncate">@{profile.username}</p>
            </div>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="container flex-1 py-6">
        <h1 className="text-2xl font-bold mb-6">Search</h1>
        
        <div className="relative mb-6">
          <Input
            placeholder="Search for users, music, or posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pr-10"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 h-full" 
            onClick={handleSearch}
            disabled={isSearching}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        {searchResults.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Search Results</h2>
            <div className="space-y-3">
              {searchResults.map(renderUserCard)}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">People to Follow</h2>
              <div className="space-y-3">
                {recentSearches.length > 0 ? (
                  recentSearches.map(renderUserCard)
                ) : (
                  <p className="text-muted-foreground">No suggested users found</p>
                )}
              </div>
            </div>
            
            <UserSearch />
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
