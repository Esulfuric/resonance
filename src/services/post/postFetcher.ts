
import { supabase } from "@/lib/supabase";
import { Post } from "@/types/post";

export const fetchPostsWithOptimization = async (limit: number = 20, userIds?: string[], offset: number = 0): Promise<Post[]> => {
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    if (!data) return [];
    
    return data;
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const fetchPostsByUserIds = async (userIds: string[], limit: number = 20, offset: number = 0): Promise<Post[]> => {
  if (!userIds.length) return [];
  return fetchPostsWithOptimization(limit, userIds, offset);
};

export const fetchLatestPosts = async (limit: number = 20, offset: number = 0): Promise<Post[]> => {
  return fetchPostsWithOptimization(limit, undefined, offset);
};
