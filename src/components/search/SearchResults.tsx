
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCard } from "./UserCard";
import { PostCard } from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, User, Album as AlbumIcon, Heart } from "lucide-react";

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

  const totalResults = searchResults.users.length + searchResults.posts.length + searchResults.tracks.length;

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
        <TabsTrigger value="users">Users ({searchResults.users.length})</TabsTrigger>
        <TabsTrigger value="posts">Posts ({searchResults.posts.length})</TabsTrigger>
        <TabsTrigger value="music">Music ({searchResults.tracks.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-3">
        {/* Users */}
        {searchResults.users.slice(0, 3).map(user => (
          <UserCard key={`user-${user.id}`} profile={user} />
        ))}
        
        {/* Music Tracks */}
        {searchResults.tracks.slice(0, 5).map((track, index) => (
          <Card key={`track-${index}`} className="p-4">
            <div className="flex items-center gap-4">
              {track.thumbnail && (
                <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{track.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                {track.duration && (
                  <p className="text-xs text-muted-foreground">{track.duration}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate(`/artist/${encodeURIComponent(track.artist)}`)}>
                  <User className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate(`/song/${encodeURIComponent(track.title)}/${encodeURIComponent(track.artist)}`)}>
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => navigate(`/song/${encodeURIComponent(track.title)}/${encodeURIComponent(track.artist)}`)}>
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
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
      
      <TabsContent value="music" className="space-y-3">
        {searchResults.tracks.map((track, index) => (
          <div key={index} ref={index === searchResults.tracks.length - 1 ? lastElementRef : null}>
            <Card className="p-4">
              <div className="flex items-center gap-4">
                {track.thumbnail && (
                  <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{track.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  {track.duration && (
                    <p className="text-xs text-muted-foreground">{track.duration}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/artist/${encodeURIComponent(track.artist)}`)}>
                    <User className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/album/${encodeURIComponent(`${track.title} - Single`)}/${encodeURIComponent(track.artist)}`)}>
                    <AlbumIcon className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => navigate(`/song/${encodeURIComponent(track.title)}/${encodeURIComponent(track.artist)}`)}>
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))}
        {isLoadingMore && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading more tracks...</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
