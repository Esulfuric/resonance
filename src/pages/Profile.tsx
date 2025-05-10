import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useSupabase } from "@/lib/supabase-provider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfileEditor } from "@/components/ProfileEditor";
import { ProfileContent } from "@/components/ProfileContent";

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

interface ProfileType {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  user_type?: 'musician' | 'listener';
  updated_at: string | null;
}

interface FollowUser {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

const Profile = () => {
  const { isLoading: authLoading, user } = useAuthGuard();
  const { user: supabaseUser } = useSupabase();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  
  // Get the active tab from URL params
  const activeTab = searchParams.get('tab') || 'posts';
  
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
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (postsError) throw postsError;
        setUserPosts(postsData || []);
        
        // Fetch followers - first get follower IDs, then get their profile data
        const { data: followersData } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', user.id);
        
        if (followersData && followersData.length > 0) {
          const followerIds = followersData.map(f => f.follower_id);
          const { data: followerProfiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', followerIds);
            
          setFollowers(followerProfiles as FollowUser[] || []);
        } else {
          setFollowers([]);
        }
        
        // Fetch following - first get following IDs, then get their profile data
        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        if (followingData && followingData.length > 0) {
          const followingIds = followingData.map(f => f.following_id);
          const { data: followingProfiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', followingIds);
            
          setFollowing(followingProfiles as FollowUser[] || []);
        } else {
          setFollowing([]);
        }
        
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
      
      console.log("Uploading avatar to profiles bucket");
      
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
      console.log("Avatar uploaded successfully:", avatarUrl);
      
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
  
  // Format posts for display
  const displayPosts: FormattedPost[] = userPosts.map((post) => {
    return {
      id: post.id,
      user: {
        name: profileData.full_name || profileData.username || "User",
        username: profileData.username || "user",
        avatar: profileData.avatar_url || "https://randomuser.me/api/portraits/women/42.jpg",
        user_type: profileData.user_type,
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
  
  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
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
              post_count: userPosts.length,
              follower_count: followers.length,
              following_count: following.length
            }} 
            isOwnProfile={true}
            onAvatarClick={() => fileInputRef.current?.click()}
            isUploadingAvatar={uploadingAvatar}
            onEditClick={() => setIsEditing(true)}
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

        {/* Profile content with settings tab */}
        <ProfileContent 
          posts={displayPosts}
          followers={followers}
          following={following}
          isOwnProfile={true}
          showSettings={true}
          defaultTab={activeTab}
          userType={profileData.user_type}
        />
      </main>
    </div>
  );
};

export default Profile;
