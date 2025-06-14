
import { supabase } from "@/lib/supabase";
import { Post } from "@/types/post";
import { fetchLatestPosts as fetchLatestPostsCore, fetchPostsByUserIds as fetchPostsByUserIdsCore } from "./post/postFetcher";
import { enhancePostsWithData } from "./post/postEnhancer";

export const fetchUserPosts = async (userId: string | undefined, limit: number = 20, offset: number = 0): Promise<Post[]> => {
  if (!userId) return [];
  
  const { data: followedUsers } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);
    
  if (!followedUsers || followedUsers.length === 0) {
    return [];
  }
  
  const followingIds = followedUsers.map(fu => fu.following_id);
  const posts = await fetchPostsByUserIdsCore(followingIds, limit, offset);
  return enhancePostsWithData(posts);
};

export const fetchLatestPosts = async (limit: number = 20, offset: number = 0): Promise<Post[]> => {
  const posts = await fetchLatestPostsCore(limit, offset);
  return enhancePostsWithData(posts);
};

export const fetchPosts = async (limit: number = 20, userIds?: string[], offset: number = 0): Promise<Post[]> => {
  const posts = await fetchLatestPostsCore(limit, offset);
  return enhancePostsWithData(posts);
};

export const fetchPostsByUserIds = async (userIds: string[], limit: number = 20, offset: number = 0): Promise<Post[]> => {
  const posts = await fetchPostsByUserIdsCore(userIds, limit, offset);
  return enhancePostsWithData(posts);
};

// Re-export all functions from the modular files
export { deletePost, createPost } from "./post/postActions";
export { toggleLikePost, checkPostLiked, addComment, fetchComments } from "./post/postInteractions";
export { searchUsersAndPosts } from "./post/postSearch";
export { isPostEdited } from "./post/postEnhancer";
