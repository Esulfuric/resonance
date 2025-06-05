
import { supabase } from "@/lib/supabase";

interface SearchFilters {
  limit?: number;
  offset?: number;
}

interface PaginatedSearchResults {
  users: any[];
  posts: any[];
  tracks: any[];
  hasMore: boolean;
  total: number;
}

export const searchUsersAndPostsPaginated = async (
  query: string, 
  filters: SearchFilters = {}
): Promise<PaginatedSearchResults> => {
  const { limit = 10, offset = 0 } = filters;
  
  try {
    // Only search users and posts for speed - remove slow external API calls
    const [usersResult, postsResult] = await Promise.all([
      // Search users
      supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .range(offset, offset + limit - 1),
      
      // Search posts
      supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url,
            user_type
          )
        `)
        .or(`content.ilike.%${query}%,song_title.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
    ]);

    const users = usersResult.data || [];
    const posts = postsResult.data || [];
    
    // For now, return empty tracks to make search fast
    // Music search can be added back as a separate feature later
    const tracks: any[] = [];
    
    // Calculate if there are more results
    const hasMoreUsers = users.length === limit;
    const hasMorePosts = posts.length === limit;
    const hasMore = hasMoreUsers || hasMorePosts;
    
    return {
      users,
      posts,
      tracks,
      hasMore,
      total: users.length + posts.length + tracks.length
    };
    
  } catch (error) {
    console.error('Error in paginated search:', error);
    throw error;
  }
};

export const searchUsersAndPosts = async (query: string) => {
  const result = await searchUsersAndPostsPaginated(query, { limit: 50 });
  return {
    users: result.users,
    posts: result.posts
  };
};
