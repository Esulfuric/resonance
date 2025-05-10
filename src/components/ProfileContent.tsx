
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { Music, Users, Settings, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfileSettings } from "@/components/ProfileSettings";
import { MusicTrackList } from "@/components/MusicTrackList";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FormattedPost {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    user_type?: 'musician' | 'listener';
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
  userType?: 'musician' | 'listener';
}

export function ProfileContent({
  posts,
  followers,
  following,
  isOwnProfile,
  showSettings = false,
  defaultTab = "posts",
  userType
}: ProfileContentProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const isMusician = userType === 'musician';

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
      <TabsList className={`grid ${
        isMusician ? 
          (showSettings ? 'grid-cols-4 sm:grid-cols-5' : 'grid-cols-4') : 
          (showSettings ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-3')
      } w-full max-w-md mx-auto md:mx-0`}>
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
        
        {isMusician && (
          <TabsTrigger value="music" className="flex gap-2 items-center">
            <Music className="h-4 w-4" />
            <span className="hidden sm:inline">Music</span>
          </TabsTrigger>
        )}
        
        {showSettings && (
          <TabsTrigger value="settings" className="flex gap-2 items-center">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="posts" className="mt-6 space-y-6">
        <ScrollArea className="max-h-[800px] pr-4">
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
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="followers" className="mt-6">
        <ScrollArea className="max-h-[800px] pr-4">
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
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="following" className="mt-6">
        <ScrollArea className="max-h-[800px] pr-4">
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
        </ScrollArea>
      </TabsContent>
      
      {/* Music tab for musicians */}
      {isMusician && (
        <TabsContent value="music" className="mt-6">
          <ScrollArea className="max-h-[800px] pr-4">
            {isOwnProfile ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">My Tracks</h2>
                  <Button onClick={() => navigate('/upload-music')} className="flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Upload Music
                  </Button>
                </div>
                <MusicTrackList />
              </div>
            ) : (
              <MusicTrackList />
            )}
          </ScrollArea>
        </TabsContent>
      )}
      
      {showSettings && (
        <TabsContent value="settings" className="mt-6">
          <ScrollArea className="max-h-[800px] pr-4">
            <ProfileSettings />
          </ScrollArea>
        </TabsContent>
      )}
    </Tabs>
  );
}
