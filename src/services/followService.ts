
import { supabase } from '@/lib/supabase';

export const followUser = async (followerId: string, followingId: string): Promise<{ success: boolean, error?: any }> => {
  try {
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      });
      
    if (error) throw error;
    
    // Create notification for the followed user
    await supabase
      .from('notifications')
      .insert({
        user_id: followingId,
        actor_id: followerId,
        type: 'follow',
        is_read: false
      });
    
    return { success: true };
  } catch (error) {
    console.error('Error following user:', error);
    return { success: false, error };
  }
};

export const unfollowUser = async (followerId: string, followingId: string): Promise<{ success: boolean, error?: any }> => {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, error };
  }
};

export const checkIsFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
      
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

export const getFollowerCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
      
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error getting follower count:', error);
    return 0;
  }
};

export const getFollowingCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
      
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error getting following count:', error);
    return 0;
  }
};
