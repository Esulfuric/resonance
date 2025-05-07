
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
          .limit(5);
        
        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {searchTerm.trim().length >= 2 && (
        <Card className="absolute mt-1 w-full z-10">
          <CardContent className="p-0">
            {isSearching ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y">
                {searchResults.map((profile) => (
                  <div key={profile.id} className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer" onClick={() => handleViewProfile(profile.id)}>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || "User"} />
                      <AvatarFallback>
                        {(profile.full_name?.[0] || profile.username?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{profile.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">@{profile.username || "user"}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto">View</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
