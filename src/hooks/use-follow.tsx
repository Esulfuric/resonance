
import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabase-provider';
import { followUser, unfollowUser, checkIsFollowing, getFollowerCount, getFollowingCount } from '@/services/followService';
import { useToast } from '@/hooks/use-toast';

interface UseFollowProps {
  profileId: string;
}

export function useFollow({ profileId }: UseFollowProps) {
  const { user } = useSupabase();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (user && profileId && user.id !== profileId) {
      loadFollowStatus();
      loadCounts();
    }
  }, [user, profileId]);

  const loadFollowStatus = async () => {
    if (!user || !profileId) return;
    
    try {
      const following = await checkIsFollowing(user.id, profileId);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error loading follow status:', error);
    }
  };

  const loadCounts = async () => {
    if (!profileId) return;
    
    try {
      const [followers, following] = await Promise.all([
        getFollowerCount(profileId),
        getFollowingCount(profileId)
      ]);
      
      setFollowerCount(followers);
      setFollowingCount(following);
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !profileId || isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (isFollowing) {
        const result = await unfollowUser(user.id, profileId);
        if (result.success) {
          setIsFollowing(false);
          setFollowerCount(prev => Math.max(0, prev - 1));
          toast({
            title: "Unfollowed",
            description: "You are no longer following this user",
          });
        }
      } else {
        const result = await followUser(user.id, profileId);
        if (result.success) {
          setIsFollowing(true);
          setFollowerCount(prev => prev + 1);
          toast({
            title: "Following",
            description: "You are now following this user",
          });
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Could not update follow status",
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
