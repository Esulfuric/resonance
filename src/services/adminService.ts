
import { supabase } from '@/lib/supabase';

export interface AdminAction {
  id: string;
  action_type: 'ban_user' | 'remove_post' | 'approve_music' | 'reject_music';
  target_id: string;
  reason?: string;
  created_at: string;
}

export const logAdminAction = async (
  actionType: AdminAction['action_type'],
  targetId: string,
  reason?: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: 'system', // Since we're using hardcoded admin for now
        action_type: actionType,
        target_id: targetId,
        reason: reason
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error logging admin action:', error);
    return { success: false, error };
  }
};

export const checkUserBanStatus = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('is_user_banned', { user_id_param: userId });

    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error checking ban status:', error);
    return false;
  }
};

export const getAdminStats = async () => {
  try {
    const [postsResult, usersResult, musicResult] = await Promise.all([
      supabase
        .from('posts')
        .select('id, is_removed')
        .eq('is_removed', true),
      
      supabase
        .from('profiles')
        .select('id, is_banned')
        .eq('is_banned', true),
      
      supabase
        .from('music_uploads')
        .select('id, status')
        .eq('status', 'pending')
    ]);

    return {
      removedPosts: postsResult.data?.length || 0,
      bannedUsers: usersResult.data?.length || 0,
      pendingMusic: musicResult.data?.length || 0
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      removedPosts: 0,
      bannedUsers: 0,
      pendingMusic: 0
    };
  }
};
