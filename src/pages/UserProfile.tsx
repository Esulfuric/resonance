import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useSupabase } from "@/lib/supabase-provider";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfileContent } from "@/components/ProfileContent";

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
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useSupabase();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  
  // Use auth guard to protect this route
  useAuthGuard();
  
  // Get the active tab from URL params
  const defaultTab = searchParams.get('tab') || 'posts';
  
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
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (postsError) throw postsError;
        setPosts(postsData || []);
        
        // Fetch followers
        const { data: followersData } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', userId);
        
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
        
        // Fetch following
        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId);
        
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
        name: profile?.full_name || profile?.username || "User",
        username: profile?.username || "user",
        avatar: profile?.avatar_url || "https://randomuser.me/api/portraits/women/42.jpg",
        user_type: profile?.user_type,
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
  
  return (
    <div className="min-h-screen flex flex-col">
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
        <ProfileContent 
          posts={displayPosts}
          followers={followers}
          following={following}
          isOwnProfile={isOwnProfile}
          defaultTab={defaultTab}
          userType={profile.user_type}
        />
      </main>
    </div>
  );
};

export default UserProfile;
