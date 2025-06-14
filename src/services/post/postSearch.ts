
import { supabase } from "@/lib/supabase";
import { Post } from "@/types/post";
import { enhancePostsWithData } from "./postEnhancer";

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
    
    // Enhance posts with profile data using the new enhancer
    const enhancedPosts = await enhancePostsWithData(postsData || []);
    
    return {
      users: usersData || [],
      posts: enhancedPosts
    };
  } catch (error) {
    console.error('Error searching:', error);
    return { users: [], posts: [] };
  }
};
