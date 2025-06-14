
import { supabase } from "@/lib/supabase";
import { Comment } from "@/types/post";

export const toggleLikePost = async (postId: string, userId: string): Promise<{ success: boolean, isLiked: boolean, error?: any }> => {
  try {
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingLike) {
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
        
      if (unlikeError) throw unlikeError;
      return { success: true, isLiked: false };
    }
    
    const { error: likeError } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
      });
      
    if (likeError) throw likeError;
    
    // Create notification for post owner
    const { data: postData } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();
      
    if (postData && postData.user_id !== userId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: postData.user_id,
          actor_id: userId,
          type: 'like',
          post_id: postId,
          is_read: false
        });
    }
    
    return { success: true, isLiked: true };
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, isLiked: false, error };
  }
};

export const checkPostLiked = async (postId: string, userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    const { data, error } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking post like:', error);
    return false;
  }
};

export const addComment = async (postId: string, userId: string, content: string): Promise<{ success: boolean, data?: Comment, error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, username, avatar_url')
      .eq('id', userId)
      .single();
      
    // Create notification for post owner if not self-comment
    const { data: postData } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();
      
    if (postData && postData.user_id !== userId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: postData.user_id,
          actor_id: userId,
          type: 'comment',
          post_id: postId,
          comment_id: data.id,
          is_read: false
        });
    }
    
    const commentWithUser: Comment = {
      ...data,
      user: {
        id: userId,
        full_name: profileData?.full_name || 'User',
        username: profileData?.username || 'user',
        avatar_url: profileData?.avatar_url || '',
      }
    };
    
    return { success: true, data: commentWithUser };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error };
  }
};

export const fetchComments = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    const commentsWithUsers = await Promise.all(data.map(async (comment) => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', comment.user_id)
        .single();
        
      return {
        ...comment,
        user: {
          id: comment.user_id,
          full_name: profileData?.full_name || 'User',
          username: profileData?.username || 'user',
          avatar_url: profileData?.avatar_url || '',
        }
      };
    }));
    
    return commentsWithUsers;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};
