
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCard } from "./UserCard";

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  user_type?: string | null;
}

interface SuggestedContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  suggestedUsers: UserProfile[];
  recentlyActive: UserProfile[];
}

export const SuggestedContent = ({ 
  activeTab, 
  setActiveTab, 
  suggestedUsers, 
  recentlyActive 
}: SuggestedContentProps) => {
  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="suggested">Suggested Users</TabsTrigger>
        <TabsTrigger value="active">Recently Active</TabsTrigger>
      </TabsList>
      
      <TabsContent value="suggested" className="space-y-4">
        <h2 className="text-lg font-semibold">Suggested Users</h2>
        <div className="space-y-3">
          {suggestedUsers.length > 0 ? (
            suggestedUsers.map(user => (
              <UserCard key={user.id} profile={user} />
            ))
          ) : (
            <p className="text-muted-foreground">No suggested users found</p>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="active" className="space-y-4">
        <h2 className="text-lg font-semibold">Recently Active</h2>
        <div className="space-y-3">
          {recentlyActive.length > 0 ? (
            recentlyActive.map(user => (
              <UserCard key={user.id} profile={user} />
            ))
          ) : (
            <p className="text-muted-foreground">No recently active users found</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
