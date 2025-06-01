
import { supabase } from "@/lib/supabase";

export const fetchUserPosts = async (userId: string | undefined) => {
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

export const fetchPostsByUserIds = async (userIds: string[]) => {
  if (!userIds.length) return [];
  return fetchPosts(undefined, userIds);
};

export const fetchPosts = async (limit: number = 20, userIds?: string[]) => {
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
    
    const postsWithProfilesAndCounts = await Promise.all(data.map(async (post) => {
      try {
        // Fetch profile data separately
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url, user_type')
          .eq('id', post.user_id)
          .single();

        const { count: likesCount, error: likesError } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
          
        const { count: commentsCount, error: commentsError } = await supabase
          .from('post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        return {
          ...post,
          profiles: profileError ? {
            full_name: undefined,
            username: undefined,
            avatar_url: undefined,
            user_type: undefined
          } : {
            full_name: profileData?.full_name || undefined,
            username: profileData?.username || undefined,
            avatar_url: profileData?.avatar_url || undefined,
            user_type: (profileData?.user_type as 'musician' | 'listener') || undefined
          },
          likes_count: Math.max(0, likesError ? 0 : likesCount || 0),
          comments_count: Math.max(0, commentsError ? 0 : commentsCount || 0),
          is_edited: isPostEdited(post),
        };
      } catch (err) {
        console.error('Error processing post data:', err);
        return {
          ...post,
          profiles: {
            full_name: undefined,
            username: undefined,
            avatar_url: undefined,
            user_type: undefined
          },
          likes_count: 0,
          comments_count: 0,
          is_edited: isPostEdited(post),
        };
      }
    }));

    return postsWithProfilesAndCounts;
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const isPostEdited = (post: any): boolean => {
  if (!post.created_at || !post.updated_at) return false;
  const createdDate = new Date(post.created_at).getTime();
  const updatedDate = new Date(post.updated_at).getTime();
  return updatedDate - createdDate > 1000;
};
