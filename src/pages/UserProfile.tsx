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

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSupabase();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
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
        
        // Check if current user is following this profile
        if (currentUser) {
          const { data: followData, error: followError } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', currentUser.id)
            .eq('following_id', userId)
            .maybeSingle();
            
          if (followError) throw followError;
          
          setIsFollowing(!!followData);
        }
        
        // Get follower count
        const { count: followerCount, error: followerError } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId);
          
        if (followerError) throw followerError;
        setFollowerCount(followerCount || 0);
        
        // Get following count
        const { count: followingCount, error: followingError } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId);
          
        if (followingError) throw followingError;
        setFollowingCount(followingCount || 0);
        
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
  
  const handleFollowToggle = async () => {
    if (!currentUser || !userId) return;
    
    try {
      if (isFollowing) {
        // Unfollow user
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId);
          
        if (error) throw error;
        
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        // Follow user
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: userId,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        setFollowerCount(prev => prev + 1);
      }
      
      setIsFollowing(!isFollowing);
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? `You are no longer following ${profile?.full_name || profile?.username || "this user"}` 
          : `You are now following ${profile?.full_name || profile?.username || "this user"}`,
      });
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading profile...</div>;
  }
  
  if (!profile) {
    return <div className="flex items-center justify-center h-screen">Profile not found</div>;
  }

  // Format posts for display
  const displayPosts = posts.map((post) => {
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
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 avatar-ring">
              <AvatarImage 
                src={profile.avatar_url || undefined} 
                alt={profile.full_name || "User"} 
              />
              <AvatarFallback>
                {profile.full_name?.[0] || profile.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{profile.full_name || "User"}</h1>
              <p className="text-muted-foreground">@{profile.username || "user"}</p>
              <p className="mt-2 max-w-xl">
                {profile.bio || "Music enthusiast"}
              </p>
              <div className="flex gap-4 mt-4 justify-center md:justify-start">
                <div>
                  <span className="font-bold">{posts.length}</span>{" "}
                  <span className="text-muted-foreground">Posts</span>
                </div>
                <div>
                  <span className="font-bold">{followingCount}</span>{" "}
                  <span className="text-muted-foreground">Following</span>
                </div>
                <div>
                  <span className="font-bold">{followerCount}</span>{" "}
                  <span className="text-muted-foreground">Followers</span>
                </div>
              </div>
            </div>
            {!isOwnProfile && (
              <div className="md:self-start">
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            )}
            {isOwnProfile && (
              <div className="md:self-start">
                <Button onClick={() => navigate('/profile')}>
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile content */}
        <Tabs defaultValue="posts" className="mt-6">
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
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {isOwnProfile 
                  ? "You aren't following anyone yet." 
                  : "This user isn't following anyone yet."}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserProfile;
