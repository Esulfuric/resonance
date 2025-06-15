
import { supabase } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  username: string;
  created_at: string;
}

export interface PendingMusicUpload {
  id: string;
  title: string;
  album_name?: string;
  composer_full_name: string;
  upload_type: 'single' | 'album';
  cover_art_url?: string;
  created_at: string;
  artist_id: string;
  artist_name?: string;
  tracks: {
    id: string;
    track_title: string;
    track_number?: number;
  }[];
}

export interface AdminAction {
  id: string;
  action_type: string;
  target_id: string;
  reason?: string;
  created_at: string;
}

// Admin authentication functions
export const adminLogin = async (username: string, password: string): Promise<{ success: boolean; admin?: AdminUser; error?: string }> => {
  try {
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Login failed' };
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return { success: true, admin: data[0] };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get pending music uploads for admin review
export const getPendingMusicUploads = async (): Promise<PendingMusicUpload[]> => {
  try {
    const { data: uploads, error } = await supabase
      .from('music_uploads')
      .select(`
        *,
        profiles!music_uploads_artist_id_fkey(full_name, username),
        music_tracks(id, track_title, track_number)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return uploads?.map(upload => ({
      ...upload,
      upload_type: upload.upload_type as 'single' | 'album',
      artist_name: upload.profiles?.full_name || upload.profiles?.username || 'Unknown Artist',
      tracks: upload.music_tracks || []
    })) || [];
  } catch (error) {
    console.error('Error fetching pending music uploads:', error);
    return [];
  }
};

// Approve music upload
export const approveMusicUpload = async (uploadId: string, adminId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('music_uploads')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', uploadId);
    
    if (error) throw error;
    
    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: adminId,
      action_type: 'approve_music',
      target_id: uploadId,
      reason: 'Music upload approved'
    });
    
    // Get artist ID to send notification
    const { data: upload } = await supabase
      .from('music_uploads')
      .select('artist_id, title')
      .eq('id', uploadId)
      .single();
    
    if (upload) {
      // Send notification to artist
      await supabase.from('notifications').insert({
        user_id: upload.artist_id,
        actor_id: adminId,
        type: 'music_approved',
        post_id: uploadId,
        is_read: false
      });
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Reject music upload
export const rejectMusicUpload = async (uploadId: string, adminId: string, reason: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('music_uploads')
      .update({
        status: 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', uploadId);
    
    if (error) throw error;
    
    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: adminId,
      action_type: 'reject_music',
      target_id: uploadId,
      reason: reason
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Ban user
export const banUser = async (userId: string, adminId: string, reason: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_banned: true,
        ban_reason: reason,
        banned_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: adminId,
      action_type: 'ban_user',
      target_id: userId,
      reason: reason
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Remove post
export const removePost = async (postId: string, adminId: string, reason: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('posts')
      .update({
        is_removed: true,
        removal_reason: reason,
        removed_at: new Date().toISOString(),
        removed_by: adminId
      })
      .eq('id', postId);
    
    if (error) throw error;
    
    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: adminId,
      action_type: 'remove_post',
      target_id: postId,
      reason: reason
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get all posts for moderation
export const getAllPostsForModeration = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey(full_name, username, avatar_url)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching posts for moderation:', error);
    return [];
  }
};

// Get all users for moderation
export const getAllUsersForModeration = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users for moderation:', error);
    return [];
  }
};
