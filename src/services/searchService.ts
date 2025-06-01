
import { supabase } from "@/lib/supabase";
import { Post } from "@/types/post";
import { fetchPosts } from "./postQueries";

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
      const { data: profileData, error: profileError } = await supabase
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
        ...post,
        profiles: profileError ? {
          full_name: undefined,
          username: undefined,
          avatar_url: undefined,
          user_type: undefined
        } : {
          full_name: profileData.full_name || undefined,
          username: profileData.username || undefined,
          avatar_url: profileData.avatar_url || undefined,
          user_type: (profileData.user_type as 'musician' | 'listener') || undefined
        },
        likes_count: Math.max(0, likesCount || 0),
        comments_count: Math.max(0, commentsCount || 0),
        is_edited: false
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
