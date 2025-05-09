
import { supabase } from "@/lib/supabase";
import { Post, Profile } from "@/types/post";

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
        song_title
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
    
    // Enhance posts with profile data
    const postsWithProfiles = await Promise.all(data.map(async (post) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url')
          .eq('id', post.user_id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return enhancePost(post, undefined);
        }
        
        return enhancePost(post, profileData);
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
