
import { supabase } from "@/lib/supabase";
import { Post, Profile, Comment } from "@/types/post";

export const fetchUserPosts = async (userId: string | undefined): Promise<Post[]> => {
  if (!userId) return [];
  
  const { data: followedUsers } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);
    
  if (!followedUsers || followedUsers.length === 0) {
    return [];
  }
  
  const followingIds = followedUsers.map(fu => fu.following_id);
  
  return fetchPostsByUserIds(followingIds);
};

export const fetchLatestPosts = async (limit: number = 20): Promise<Post[]> => {
  return fetchPosts(limit);
};

export const fetchPosts = async (limit: number = 20, userIds?: string[]): Promise<Post[]> => {
  try {
    // Start with a base query
    let query = supabase
      .from('posts')
      .select(`
        id,
        user_id,
        content,
        created_at,
        updated_at,
        song_title,
        image_url
      `)
      .order('created_at', { ascending: false });
    
    // Apply user filter if provided
    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    } else {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    if (!data) return [];
    
    // Enhance posts with profile data and like counts
    const postsWithProfiles = await Promise.all(data.map(async (post) => {
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url')
          .eq('id', post.user_id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return enhancePost(post, undefined);
        }
        
        // Fetch likes count
        const { count: likesCount, error: likesError } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
          
        // Fetch comments count
        const { count: commentsCount, error: commentsError } = await supabase
          .from('post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        const enhancedPost = enhancePost(post, profileData);
        
        // Add like and comment counts to the post
        return {
          ...enhancedPost,
          likes_count: likesError ? 0 : likesCount || 0,
          comments_count: commentsError ? 0 : commentsCount || 0,
        };
      } catch (err) {
        console.error('Error processing profile:', err);
        return enhancePost(post, undefined);
      }
    }));

    return postsWithProfiles;
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const fetchPostsByUserIds = async (userIds: string[]): Promise<Post[]> => {
  if (!userIds.length) return [];
  return fetchPosts(undefined, userIds);
};

export const deletePost = async (postId: string): Promise<{ success: boolean, error?: any }> => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error };
  }
};

export const createPost = async (content: string, userId: string, songTitle?: string, imageUrl?: string): Promise<{ success: boolean, data?: any, error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content,
        song_title: songTitle || null,
        image_url: imageUrl || null,
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error };
  }
};

// Like/unlike a post
export const toggleLikePost = async (postId: string, userId: string): Promise<{ success: boolean, isLiked: boolean, error?: any }> => {
  try {
    // Check if the post is already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    // If already liked, unlike it
    if (existingLike) {
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
        
      if (unlikeError) throw unlikeError;
      return { success: true, isLiked: false };
    }
    
    // If not liked, like it
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
          user_id: postData.user_id, // Post owner
          actor_id: userId, // User who liked
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

// Check if a user liked a post
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

// Add comment to a post
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
    
    // Fetch the user profile for the comment
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
          user_id: postData.user_id, // Post owner
          actor_id: userId, // User who commented
          type: 'comment',
          post_id: postId,
          comment_id: data.id,
          is_read: false
        });
    }
    
    // Format the comment with user profile data
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

// Fetch comments for a post
export const fetchComments = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Fetch user profiles for each comment
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

// Fetch notifications for a user
export const fetchNotifications = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:actor_id(id, full_name, username, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all user notifications as read
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

// Messages API
export const sendMessage = async (senderId: string, recipientId: string, content: string): Promise<{ success: boolean, data?: any, error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        content,
      })
      .select();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error };
  }
};

export const fetchMessages = async (userId: string, otherUserId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, full_name, username, avatar_url),
        recipient:recipient_id(id, full_name, username, avatar_url)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .or(`sender_id.eq.${otherUserId},recipient_id.eq.${otherUserId}`)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    // Filter to ensure only messages between these two users
    const filteredMessages = data?.filter(msg => 
      (msg.sender_id === userId && msg.recipient_id === otherUserId) || 
      (msg.sender_id === otherUserId && msg.recipient_id === userId)
    ) || [];
    
    return filteredMessages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const fetchConversations = async (userId: string): Promise<any[]> => {
  try {
    // This query gets the most recent message for each conversation
    const { data, error } = await supabase
      .rpc('get_user_conversations', { user_id_param: userId });
      
    if (error) throw error;
    
    // Fetch profiles for each conversation
    const conversationsWithProfiles = await Promise.all((data || []).map(async (conversation) => {
      const otherUserId = conversation.sender_id === userId ? conversation.recipient_id : conversation.sender_id;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', otherUserId)
        .single();
        
      return {
        ...conversation,
        other_user: {
          id: otherUserId,
          full_name: profileData?.full_name || 'User',
          username: profileData?.username || 'user',
          avatar_url: profileData?.avatar_url || '',
        }
      };
    }));
    
    return conversationsWithProfiles;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Helper function to determine if a post was edited
export const isPostEdited = (post: any): boolean => {
  if (!post.created_at || !post.updated_at) return false;
  const createdDate = new Date(post.created_at).getTime();
  const updatedDate = new Date(post.updated_at).getTime();
  return updatedDate - createdDate > 1000; // If more than 1 second difference, consider it edited
};

// Helper to enhance a post with profile data and edited status
const enhancePost = (post: any, profileData: any): Post => {
  return { 
    ...post, 
    is_edited: isPostEdited(post),
    profiles: profileData || {
      full_name: undefined,
      username: undefined,
      avatar_url: undefined
    }
  };
};
