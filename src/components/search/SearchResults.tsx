
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCard } from "./UserCard";
import { PostCard } from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

interface SearchResultsProps {
  searchResults: { users: any[], posts: any[], tracks: any[] };
  formatPostForDisplay: (post: any) => any;
  lastElementRef: (node: HTMLDivElement) => void;
  isLoadingMore: boolean;
}

export const SearchResults = ({ 
  searchResults, 
  formatPostForDisplay, 
  lastElementRef, 
  isLoadingMore 
}: SearchResultsProps) => {
  const navigate = useNavigate();

  const totalResults = searchResults.users.length + searchResults.posts.length;
  const hasNoResults = totalResults === 0;

  if (hasNoResults) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">
            Looking for a song, album or artist?
          </p>
          <Button 
            onClick={() => navigate('/music')}
            className="bg-primary hover:bg-primary/90"
          >
            <Music className="h-4 w-4 mr-2" />
            Search Music
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
        <TabsTrigger value="users">Users ({searchResults.users.length})</TabsTrigger>
        <TabsTrigger value="posts">Posts ({searchResults.posts.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-3">
        {/* Users */}
        {searchResults.users.slice(0, 3).map(user => (
          <UserCard key={`user-${user.id}`} profile={user} />
        ))}
        
        {/* Posts */}
        {searchResults.posts.slice(0, 3).map(post => (
          <PostCard key={`post-${post.id}`} {...formatPostForDisplay(post)} />
        ))}
        
        {/* Load more indicator */}
        <div ref={lastElementRef}>
          {isLoadingMore && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading more results...</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="users" className="space-y-3">
        {searchResults.users.map((user, index) => (
          <div key={user.id} ref={index === searchResults.users.length - 1 ? lastElementRef : null}>
            <UserCard profile={user} />
          </div>
        ))}
        {isLoadingMore && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading more users...</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="posts" className="space-y-4">
        {searchResults.posts.map((post, index) => (
          <div key={post.id} ref={index === searchResults.posts.length - 1 ? lastElementRef : null}>
            <PostCard {...formatPostForDisplay(post)} />
          </div>
        ))}
        {isLoadingMore && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading more posts...</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
