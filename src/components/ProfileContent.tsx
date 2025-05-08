
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { Music, Users, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FormattedPost {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: string;
  content: string;
  imageUrl?: string;
  songInfo?: {
    title: string;
    artist: string;
    albumCover: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface FollowUser {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface ProfileContentProps {
  posts: FormattedPost[];
  followers: FollowUser[];
  following: FollowUser[];
  isOwnProfile: boolean;
  showSettings?: boolean;
  defaultTab?: string;
}

export function ProfileContent({
  posts,
  followers,
  following,
  isOwnProfile,
  showSettings = false,
  defaultTab = "posts"
}: ProfileContentProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Component to display user list (for followers/following)
  const UserList = ({ users }: { users: FollowUser[] }) => (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <div 
          key={user.id} 
          className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer"
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img src={user.avatar_url} alt={user.username || "User"} />
            </div>
          </div>
          <div>
            <p className="font-medium">{user.full_name || user.username}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Tabs defaultValue={activeTab} className="mt-6" onValueChange={setActiveTab}>
      <TabsList className={`grid ${showSettings ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-3'} w-full max-w-md mx-auto md:mx-0`}>
        <TabsTrigger value="posts" className="flex gap-2 items-center">
          <Music className="h-4 w-4" />
          <span className="hidden sm:inline">Posts</span>
        </TabsTrigger>
        <TabsTrigger value="followers" className="flex gap-2 items-center">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Followers</span>
        </TabsTrigger>
        <TabsTrigger value="following" className="flex gap-2 items-center">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Following</span>
        </TabsTrigger>
        {showSettings && (
          <TabsTrigger value="settings" className="flex gap-2 items-center">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="posts" className="mt-6 space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
            </p>
            {isOwnProfile && (
              <Button className="mt-4" onClick={() => navigate("/create-post")}>
                Create Your First Post
              </Button>
            )}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="followers" className="mt-6">
        {followers.length > 0 ? (
          <UserList users={followers} />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {isOwnProfile 
                ? "You don't have any followers yet." 
                : "This user doesn't have any followers yet."}
            </p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="following" className="mt-6">
        {following.length > 0 ? (
          <UserList users={following} />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {isOwnProfile 
                ? "You aren't following anyone yet." 
                : "This user isn't following anyone yet."}
            </p>
            {isOwnProfile && (
              <Button className="mt-4" onClick={() => navigate('/search')}>
                Find people to follow
              </Button>
            )}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
