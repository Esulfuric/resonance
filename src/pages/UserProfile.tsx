import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/components/PostCard";
import { Music, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/lib/supabase-provider";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { ProfileHeader } from "@/components/ProfileHeader";

interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  user_type?: 'musician' | 'listener';
}

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

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSupabase();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  
  // Use auth guard to protect this route
  useAuthGuard();
  
  useEffect(() => {
    if (!userId || !currentUser) {
      return;
    }
    
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileError) throw profileError;
        if (!profileData) {
          toast({
            title: "User not found",
            description: "The requested user profile could not be found.",
            variant: "destructive",
          });
          navigate('/feed');
          return;
        }
        
        setProfile(profileData);
        
        // Fetch user posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id(
              full_name,
              username, 
              avatar_url
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (postsError) throw postsError;
        setPosts(postsData || []);
        
        // Fetch followers with proper error handling
        const { data: followersData, error: followersError } = await supabase
          .from('follows')
          .select(`
            follower_id,
            profiles:follower_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('following_id', userId);
        
        if (followersError) throw followersError;
        
        // Extract follower profiles with type safety
        const followerProfiles: FollowUser[] = followersData
          ? followersData
              .filter(item => item.profiles) // Filter out any null profiles
              .map(item => ({
                id: item.profiles?.id || "",
                username: item.profiles?.username || "",
                full_name: item.profiles?.full_name || "",
                avatar_url: item.profiles?.avatar_url || ""
              }))
          : [];
        
        setFollowers(followerProfiles);
        
        // Fetch following with proper error handling
        const { data: followingData, error: followingError } = await supabase
          .from('follows')
          .select(`
            following_id,
            profiles:following_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('follower_id', userId);
        
        if (followingError) throw followingError;
        
        // Extract following profiles with type safety
        const followingProfiles: FollowUser[] = followingData
          ? followingData
              .filter(item => item.profiles) // Filter out any null profiles
              .map(item => ({
                id: item.profiles?.id || "",
                username: item.profiles?.username || "",
                full_name: item.profiles?.full_name || "",
                avatar_url: item.profiles?.avatar_url || ""
              }))
          : [];
        
        setFollowing(followingProfiles);
        
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [userId, navigate, toast, currentUser]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading profile...</div>;
  }
  
  if (!profile) {
    return <div className="flex items-center justify-center h-screen">Profile not found</div>;
  }

  // Format posts for display
  const displayPosts: FormattedPost[] = posts.map((post) => {
    return {
      id: post.id,
      user: {
        name: profile.full_name || profile.username || "User",
        username: profile.username || "user",
        avatar: profile.avatar_url || "https://randomuser.me/api/portraits/women/42.jpg",
      },
      timestamp: new Date(post.created_at).toLocaleDateString(),
      content: post.content,
      imageUrl: post.image_url,
      songInfo: post.song_title ? {
        title: post.song_title,
        artist: "Unknown Artist",
        albumCover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=200&auto=format&fit=crop",
      } : undefined,
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
    };
  });
  
  const isOwnProfile = currentUser?.id === userId;
  
  // Component to display user list (for followers/following)
  const UserList = ({ users }: { users: FollowUser[] }) => (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <div 
          key={user.id} 
          className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer"
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          <Avatar>
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>
              {(user.full_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.full_name || user.username}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="container flex-1 py-6">
        {/* Profile header */}
        <ProfileHeader 
          profile={{
            ...profile,
            post_count: posts.length,
            follower_count: followers.length,
            following_count: following.length
          }} 
          isOwnProfile={isOwnProfile}
        />

        {/* Profile content */}
        <Tabs defaultValue={activeTab} className="mt-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto md:mx-0">
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
          </TabsList>
          
          <TabsContent value="posts" className="mt-6 space-y-6">
            {displayPosts.length > 0 ? (
              displayPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No posts yet.</p>
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
      </main>
    </div>
  );
};

export default UserProfile;
