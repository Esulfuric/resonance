
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/components/PostCard";
import { Music, Users, Settings } from "lucide-react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useSupabase } from "@/lib/supabase-provider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { isLoading: authLoading, user } = useAuthGuard();
  const { user: supabaseUser } = useSupabase();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    username: "",
    bio: "",
    avatar_url: ""
  });
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        if (profileData) {
          setProfileData({
            full_name: profileData.full_name || "",
            username: profileData.username || "",
            bio: profileData.bio || "",
            avatar_url: profileData.avatar_url || ""
          });
        } else {
          // Set default values from Supabase auth if profile doesn't exist
          setProfileData({
            full_name: supabaseUser?.user_metadata?.full_name || "",
            username: supabaseUser?.user_metadata?.username || supabaseUser?.email?.split("@")[0] || "",
            bio: "",
            avatar_url: supabaseUser?.user_metadata?.avatar_url || ""
          });
        }
        
        // Fetch user posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*, profiles:user_id(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (postsError) throw postsError;
        setUserPosts(postsData || []);
        
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, supabaseUser, toast]);
  
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.full_name,
          username: profileData.username,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const displayPosts = userPosts.map((post) => {
    const profile = post.profiles || {};
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
  
  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="container flex-1 py-6">
        {/* Profile header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 avatar-ring">
              <AvatarImage 
                src={profileData.avatar_url || supabaseUser?.user_metadata?.avatar_url || undefined} 
                alt={profileData.full_name || "User"} 
              />
              <AvatarFallback>
                {(profileData.full_name?.[0] || supabaseUser?.email?.[0] || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                    <Input 
                      id="fullName"
                      value={profileData.full_name} 
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      placeholder="Your full name" 
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="text-sm font-medium">Username</label>
                    <Input 
                      id="username"
                      value={profileData.username} 
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      placeholder="Your username" 
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                    <Textarea 
                      id="bio"
                      value={profileData.bio} 
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  <div>
                    <label htmlFor="avatar" className="text-sm font-medium">Avatar URL</label>
                    <Input 
                      id="avatar"
                      value={profileData.avatar_url} 
                      onChange={(e) => setProfileData({...profileData, avatar_url: e.target.value})}
                      placeholder="URL to your avatar image" 
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{profileData.full_name || "User"}</h1>
                  <p className="text-muted-foreground">@{profileData.username || "user"}</p>
                  <p className="mt-2 max-w-xl">
                    {profileData.bio || "Share your bio by editing your profile"}
                  </p>
                </>
              )}
              <div className="flex gap-4 mt-4 justify-center md:justify-start">
                <div>
                  <span className="font-bold">{userPosts.length}</span>{" "}
                  <span className="text-muted-foreground">Posts</span>
                </div>
                <div>
                  <span className="font-bold">0</span>{" "}
                  <span className="text-muted-foreground">Following</span>
                </div>
                <div>
                  <span className="font-bold">0</span>{" "}
                  <span className="text-muted-foreground">Followers</span>
                </div>
              </div>
            </div>
            <div className="md:self-start">
              {isEditing ? (
                <div className="space-x-2">
                  <Button onClick={handleUpdateProfile}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile content */}
        <Tabs defaultValue="posts" className="mt-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto md:mx-0">
            <TabsTrigger value="posts" className="flex gap-2 items-center">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex gap-2 items-center">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Following</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex gap-2 items-center">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6 space-y-6">
            {displayPosts.length > 0 ? (
              displayPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You haven't posted anything yet.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="following" className="mt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">You aren't following anyone yet.</p>
              <Button className="mt-4">Find people to follow</Button>
            </div>
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <div className="max-w-md space-y-4">
              <div className="space-y-1">
                <h3 className="font-medium">Account Settings</h3>
                <p className="text-sm text-muted-foreground">Manage your account preferences and settings.</p>
              </div>
              <div className="border rounded-lg divide-y">
                <div className="p-4">
                  <h4 className="font-medium">Email & Password</h4>
                  <Button size="sm" variant="outline" className="mt-2">Change</Button>
                </div>
                <div className="p-4">
                  <h4 className="font-medium">Privacy Settings</h4>
                  <Button size="sm" variant="outline" className="mt-2">Manage</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
