
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
    
    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    } else {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    if (!data) return [];
    
    const postsWithProfiles = await Promise.all(data.map(async (post) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url, user_type')
          .eq('id', post.user_id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return enhancePost(post, undefined);
        }
        
        const { count: likesCount, error: likesError } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
          
        const { count: commentsCount, error: commentsError } = await supabase
          .from('post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        const enhancedPost = enhancePost(post, profileData);
        
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

// Enhanced search function for both users and posts
export const searchUsersAndPosts = async (query: string): Promise<{ users: any[], posts: Post[] }> => {
  try {
    // Search for users
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%`)
      .limit(20);
    
    if (usersError) throw usersError;
    
    // Search for posts
    const { data: postsData, error: postsError } = await supabase
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
      .or(`content.ilike.%${query}%,song_title.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (postsError) throw postsError;
    
    // Enhance posts with profile data
    const enhancedPosts = await Promise.all((postsData || []).map(async (post) => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url, user_type')
        .eq('id', post.user_id)
        .single();
        
      const { count: likesCount } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
        
      const { count: commentsCount } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      
      return {
        ...enhancePost(post, profileData),
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0,
      };
    }));
    
    return {
      users: usersData || [],
      posts: enhancedPosts
    };
  } catch (error) {
    console.error('Error searching:', error);
    return { users: [], posts: [] };
  }
};

// Helper to enhance a post with profile data and edited status
const enhancePost = (post: any, profileData: any): Post => {
  return { 
    ...post, 
    is_edited: isPostEdited(post),
    profiles: profileData || {
      full_name: undefined,
      username: undefined,
      avatar_url: undefined,
      user_type: undefined
    }
  };
};

// Helper function to determine if a post was edited
export const isPostEdited = (post: any): boolean => {
  if (!post.created_at || !post.updated_at) return false;
  const createdDate = new Date(post.created_at).getTime();
  const updatedDate = new Date(post.updated_at).getTime();
  return updatedDate - createdDate > 1000;
};
