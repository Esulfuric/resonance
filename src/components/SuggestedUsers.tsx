
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export function SuggestedUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(3);
        
        if (error) throw error;
        setProfiles(data || []);
      } catch (error: any) {
        console.error('Error fetching profiles:', error);
        toast({
          title: "Error loading suggested users",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfiles();
  }, [toast]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">Loading suggestions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">No suggestions available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Who to follow</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex items-center gap-3 p-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || "User"} />
                <AvatarFallback>
                  {(profile.full_name?.[0] || profile.username?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{profile.full_name || profile.username || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">@{profile.username || "user"}</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
