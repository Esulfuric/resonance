
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCard } from "./UserCard";
import { PostCard } from "@/components/PostCard";

interface SearchResultsProps {
  searchResults: { users: any[], posts: any[] };
  formatPostForDisplay: (post: any) => any;
}

export const SearchResults = ({ searchResults, formatPostForDisplay }: SearchResultsProps) => {
  return (
    <Tabs defaultValue="users" className="space-y-4">
      <TabsList>
        <TabsTrigger value="users">Users ({searchResults.users.length})</TabsTrigger>
        <TabsTrigger value="posts">Posts ({searchResults.posts.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="users" className="space-y-3">
        {searchResults.users.map(user => (
          <UserCard key={user.id} profile={user} />
        ))}
      </TabsContent>
      
      <TabsContent value="posts" className="space-y-4">
        {searchResults.posts.map(post => (
          <PostCard key={post.id} {...formatPostForDisplay(post)} />
        ))}
      </TabsContent>
    </Tabs>
  );
};
