
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/lib/supabase-provider';
import { useToast } from '@/hooks/use-toast';

interface UseFollowProps {
  profileId: string;
}

export function useFollow({ profileId }: UseFollowProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { user: currentUser } = useSupabase();
  const { toast } = useToast();

  // Check if current user is following the profile
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !profileId || currentUser.id === profileId) return;

      try {
        const { data, error } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileId)
          .maybeSingle();
          
        if (error) throw error;
        setIsFollowing(!!data);
      } catch (error: any) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [currentUser, profileId]);

  // Fetch follower and following counts
  useEffect(() => {
    const fetchFollowCounts = async () => {
      if (!profileId) return;

      try {
        // Get follower count
        const { count: followers, error: followerError } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', profileId);
          
        if (followerError) throw followerError;
        setFollowerCount(followers || 0);
        
        // Get following count
        const { count: following, error: followingError } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', profileId);
          
        if (followingError) throw followingError;
        setFollowingCount(following || 0);
      } catch (error: any) {
        console.error('Error fetching follow counts:', error);
      }
    };

    fetchFollowCounts();
  }, [profileId, isFollowing]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profileId || currentUser.id === profileId) return;
    
    setIsLoading(true);
    try {
      if (isFollowing) {
        // Unfollow user
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileId);
          
        if (error) throw error;
        
        setFollowerCount(prev => Math.max(0, prev - 1));
        setIsFollowing(false);
      } else {
        // Follow user
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: profileId,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        setFollowerCount(prev => prev + 1);
        setIsFollowing(true);
      }
      
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? "You are no longer following this user" 
          : "You are now following this user",
      });
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    isFollowing, 
    isLoading, 
    followerCount, 
    followingCount, 
    handleFollowToggle 
  };
}
