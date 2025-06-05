
import { supabase } from "@/lib/supabase";
import { extractYouTubeMusicData } from "@/services/musicService";

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
    const [usersResult, postsResult, tracksResult] = await Promise.all([
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
        .range(offset, offset + limit - 1),
      
      // Search music tracks
      extractYouTubeMusicData(query)
    ]);

    const users = usersResult.data || [];
    const posts = postsResult.data || [];
    const allTracks = tracksResult || [];
    
    // Paginate tracks manually since they come from external source
    const tracks = allTracks.slice(offset, offset + limit);
    
    // Calculate if there are more results
    const hasMoreUsers = users.length === limit;
    const hasMorePosts = posts.length === limit;
    const hasMoreTracks = allTracks.length > offset + limit;
    
    const hasMore = hasMoreUsers || hasMorePosts || hasMoreTracks;
    
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
