import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useSupabase } from "@/lib/supabase-provider";

interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  user_type?: 'musician' | 'listener';
}

interface FollowUser {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export const useUserProfile = () => {
  const { userId, username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useSupabase();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        let targetUserId = userId;
        
        // Always resolve by username if :username param present
        if (username) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, user_type')
            .eq('username', username)
            .maybeSingle();
          
          if (profileError || !profileData) {
            toast({
              title: "User not found",
              description: "The requested user profile could not be found.",
              variant: "destructive",
            });
            setIsLoading(false); // <-- Ensure loading state always ends before navigation!
            navigate('/feed');
            return;
          }
          
          const isListenerRoute = location.pathname.startsWith('/l/');
          const isMusicianRoute = location.pathname.startsWith('/m/');
          
          // ensure correct prefix-username match and redirect if needed
          if (isListenerRoute && profileData.user_type !== 'listener') {
            setIsLoading(false); // <-- Always before navigation!
            navigate(`/m/${username}${location.search}`, { replace: true });
            return;
          }
          
          if (isMusicianRoute && profileData.user_type !== 'musician') {
            setIsLoading(false); // <-- Always before navigation!
            navigate(`/l/${username}${location.search}`, { replace: true });
            return;
          }
          
          targetUserId = profileData.id;
        }
        
        if (!targetUserId) {
          toast({
            title: "User not found",
            description: "Invalid user identifier.",
            variant: "destructive",
          });
          setIsLoading(false); // <-- Always before navigation!
          navigate('/feed');
          return;
        }
        
        setResolvedUserId(targetUserId);
        
        // Fetch user profile (with username only, not ID)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .maybeSingle();
        
        if (profileError) throw profileError;
        if (!profileData) {
          toast({
            title: "User not found",
            description: "The requested user profile could not be found.",
            variant: "destructive",
          });
          setIsLoading(false); // <-- Always before navigation!
          navigate('/feed');
          return;
        }
        
        // Cast user_type to the correct union type
        const userType = profileData.user_type as 'musician' | 'listener' | undefined;
        
        setProfile({
          ...profileData,
          user_type: userType
        });
        
        // Fetch user posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false });
        
        if (postsError) throw postsError;
        setPosts(postsData || []);
        
        // Fetch followers
        const { data: followersData } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', targetUserId);
        
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
          .eq('follower_id', targetUserId);
        
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
  }, [userId, username, navigate, toast, currentUser, location.pathname, location.search]);

  return {
    profile,
    posts,
    isLoading,
    followers,
    following,
    currentUser,
    userId: resolvedUserId
  };
};
