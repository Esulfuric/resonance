
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSupabase();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  
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
        
        // Fetch followers (people following this user)
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
        setFollowers(followersData || []);
        
        // Fetch following (people this user follows)
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
        setFollowing(followingData || []);
        
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
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="container flex-1 py-6">
        {/* Profile header */}
        <ProfileHeader 
          profile={{
            ...profile,
            post_count: posts.length
          }} 
          isOwnProfile={isOwnProfile}
        />

        {/* Profile content */}
        <Tabs defaultValue={activeTab} className="mt-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto md:mx-0">
            <TabsTrigger value="posts" className="flex gap-2 items-center">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Posts</span>
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
          
          <TabsContent value="following" className="mt-6">
            {following.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {following.map((follow) => (
                  <div 
                    key={follow.following_id} 
                    className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer"
                    onClick={() => navigate(`/profile/${follow.profiles.id}`)}
                  >
                    <Avatar>
                      <AvatarImage src={follow.profiles.avatar_url} />
                      <AvatarFallback>
                        {(follow.profiles.full_name?.[0] || follow.profiles.username?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{follow.profiles.full_name || follow.profiles.username}</p>
                      <p className="text-sm text-muted-foreground">@{follow.profiles.username}</p>
                    </div>
                  </div>
                ))}
              </div>
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
