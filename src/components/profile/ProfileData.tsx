
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/lib/supabase-provider";

interface FollowUser {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface ProfileData {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  user_type?: 'musician' | 'listener';
  post_count: number;
  follower_count: number;
  following_count: number;
}

export function useProfileData(userId: string) {
  const { toast } = useToast();
  const { user: currentUser } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: "",
    full_name: "",
    username: "",
    bio: "",
    avatar_url: "",
    user_type: undefined,
    post_count: 0,
    follower_count: 0,
    following_count: 0
  });
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);

  useEffect(() => {
    if (!userId) return;
    
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        if (profileData) {
          setProfileData({
            id: profileData.id,
            full_name: profileData.full_name || "",
            username: profileData.username || "",
            bio: profileData.bio || "",
            avatar_url: profileData.avatar_url || "",
            user_type: profileData.user_type,
            post_count: 0, // Will be updated later
            follower_count: 0, // Will be updated later
            following_count: 0 // Will be updated later
          });
        } else if (currentUser) {
          // Set default values from Supabase auth if profile doesn't exist
          setProfileData({
            id: userId,
            full_name: currentUser?.user_metadata?.full_name || "",
            username: currentUser?.user_metadata?.username || currentUser?.email?.split("@")[0] || "",
            bio: currentUser?.user_metadata?.bio || "",
            avatar_url: currentUser?.user_metadata?.avatar_url || "",
            user_type: currentUser?.user_metadata?.user_type as 'musician' | 'listener' | undefined,
            post_count: 0,
            follower_count: 0,
            following_count: 0
          });
        }
        
        // Fetch user posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (postsError) throw postsError;
        setUserPosts(postsData || []);
        
        // Update post count
        setProfileData(prev => ({
          ...prev,
          post_count: postsData?.length || 0
        }));
        
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
          
          // Update follower count
          setProfileData(prev => ({
            ...prev,
            follower_count: followerProfiles?.length || 0
          }));
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
          
          // Update following count
          setProfileData(prev => ({
            ...prev,
            following_count: followingProfiles?.length || 0
          }));
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
  }, [userId, currentUser, toast]);

  return {
    isLoading,
    profileData,
    userPosts,
    followers,
    following
  };
}
