
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/components/PostCard";
import { Music, Users, Settings, Key } from "lucide-react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useSupabase } from "@/lib/supabase-provider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfileEditor } from "@/components/ProfileEditor";

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

// Define the profile interface to match what's in the database
interface ProfileType {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  user_type?: 'musician' | 'listener';
  updated_at: string | null;
}

const Profile = () => {
  const { isLoading: authLoading, user } = useAuthGuard();
  const { user: supabaseUser } = useSupabase();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    id: "",
    full_name: "",
    username: "",
    bio: "",
    avatar_url: "",
    user_type: undefined as 'musician' | 'listener' | undefined
  });
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  
  // For avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
          const profile = profileData as ProfileType;
          setProfileData({
            id: profile.id,
            full_name: profile.full_name || "",
            username: profile.username || "",
            bio: profile.bio || "",
            avatar_url: profile.avatar_url || "",
            user_type: profile.user_type
          });
        } else {
          // Set default values from Supabase auth if profile doesn't exist
          setProfileData({
            id: user.id,
            full_name: supabaseUser?.user_metadata?.full_name || "",
            username: supabaseUser?.user_metadata?.username || supabaseUser?.email?.split("@")[0] || "",
            bio: supabaseUser?.user_metadata?.bio || "",
            avatar_url: supabaseUser?.user_metadata?.avatar_url || "",
            user_type: supabaseUser?.user_metadata?.user_type as 'musician' | 'listener' | undefined
          });
        }
        
        // Fetch user posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (
              full_name,
              username,
              avatar_url
            )
          `)
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
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setUploadingAvatar(true);
      
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL of the uploaded file
      const { data: urlData } = supabase
        .storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      const avatarUrl = urlData.publicUrl;
      
      // Update profile with new avatar URL
      setProfileData({
        ...profileData,
        avatar_url: avatarUrl
      });
      
      // If not in editing mode, save immediately
      if (!isEditing) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          });
          
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully."
        });
      }
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error updating avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handlePasswordChange = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        title: "Password error",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // First authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: supabaseUser?.email || '',
        password: currentPassword
      });
      
      if (signInError) {
        throw new Error("Current password is incorrect");
      }
      
      // Then update to the new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully."
      });
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Error changing password",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  // Format posts for display
  const displayPosts: FormattedPost[] = userPosts.map((post) => {
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
        {/* Profile header or editor */}
        {isEditing ? (
          <div className="mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            <ProfileEditor 
              profileData={profileData}
              onSave={() => setIsEditing(false)}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <ProfileHeader 
            profile={{
              ...profileData,
              post_count: userPosts.length
            }} 
            isOwnProfile={true}
            onAvatarClick={() => fileInputRef.current?.click()}
            isUploadingAvatar={uploadingAvatar}
          />
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleAvatarUpload} 
          accept="image/*" 
          className="hidden" 
          disabled={uploadingAvatar}
        />

        {/* Profile content */}
        <Tabs defaultValue={activeTab} className="mt-6" onValueChange={setActiveTab}>
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
                <Button className="mt-4" onClick={() => navigate("/create-post")}>Create Your First Post</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="mt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">You aren't following anyone yet.</p>
              <Button className="mt-4" onClick={() => navigate("/search")}>Find People to Follow</Button>
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
                  <h4 className="font-medium">Profile Information</h4>
                  <p className="text-sm text-muted-foreground mt-1">Update how others see you on the platform</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                </div>
                <div className="p-4">
                  <h4 className="font-medium">Email & Password</h4>
                  <p className="text-sm text-muted-foreground mt-1">Current email: {supabaseUser?.email}</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="mt-2">Change Password</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and a new password below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password-dialog">Current Password</Label>
                          <Input 
                            id="current-password-dialog" 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password-dialog">New Password</Label>
                          <Input 
                            id="new-password-dialog" 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password-dialog">Confirm New Password</Label>
                          <Input 
                            id="confirm-password-dialog" 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••" 
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handlePasswordChange}>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
