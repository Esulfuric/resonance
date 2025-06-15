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
  bio: string | null;
  user_type?: string | null;
}

export function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
          .limit(8);
        
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

  const getUsernameUrl = (profile: Profile) => {
    const username = profile.username || 'user';
    const prefix = profile.user_type === 'musician' ? 'm' : 'l';
    return `/${prefix}/${username}`;
  };

  const handleViewProfile = (profile: Profile) => {
    setShowDropdown(false);
    navigate(getUsernameUrl(profile));
  };

  return (
    <div className="relative max-w-md w-full">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2 rounded-full"
          onFocus={() => {
            if (searchTerm.trim().length >= 2) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => {
            // Delay hiding to allow for clicking on results
            setTimeout(() => setShowDropdown(false), 200);
          }}
        />
        {searchTerm && (
          <button
            className="absolute right-3 top-2.5 h-5 w-5 rounded-full bg-muted flex items-center justify-center"
            onClick={() => setSearchTerm("")}
          >
            <span className="sr-only">Clear search</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1 1L9 9M1 9L9 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
      
      {showDropdown && searchTerm.trim().length >= 2 && (
        <Card className="absolute mt-1 w-full z-10 shadow-md">
          <CardContent className="p-0 max-h-[300px] overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                {searchResults.map((profile) => (
                  <div 
                    key={profile.id} 
                    className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b last:border-0" 
                    onClick={() => handleViewProfile(profile)}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || "User"} />
                      <AvatarFallback>
                        {(profile.full_name?.[0] || profile.username?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{profile.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">@{profile.username || "user"}</p>
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
