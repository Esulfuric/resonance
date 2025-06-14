
import { supabase } from "@/lib/supabase";
import { Post } from "@/types/post";

interface PostCounts {
  likesMap: Record<string, number>;
  commentsMap: Record<string, number>;
}

interface ProfilesMap {
  [key: string]: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
    user_type?: 'musician' | 'listener';
  };
}

export const fetchProfiles = async (userIds: string[]): Promise<ProfilesMap> => {
  if (userIds.length === 0) return {};
  
  const { data: profileRows, error } = await supabase
    .from('profiles')
    .select('id,full_name,username,avatar_url,user_type')
    .in('id', userIds);
  
  if (error || !profileRows) return {};
  
  const profilesMap: ProfilesMap = {};
  for (const row of profileRows) {
    profilesMap[row.id] = {
      full_name: row.full_name,
      username: row.username,
      avatar_url: row.avatar_url,
      user_type: row.user_type === 'musician' || row.user_type === 'listener' ? row.user_type : undefined
    };
  }
  return profilesMap;
};

export const fetchPostCounts = async (postIds: string[]): Promise<PostCounts> => {
  if (postIds.length === 0) return { likesMap: {}, commentsMap: {} };
  
  const likesMap: Record<string, number> = {};
  const commentsMap: Record<string, number> = {};

  // Fetch likes
  const { data: likesRows } = await supabase
    .from('post_likes')
    .select('post_id')
    .in('post_id', postIds);
  
  if (likesRows) {
    for (const row of likesRows) {
      if (row.post_id) {
        likesMap[row.post_id] = (likesMap[row.post_id] || 0) + 1;
      }
    }
  }

  // Fetch comments
  const { data: commentsRows } = await supabase
    .from('post_comments')
    .select('post_id')
    .in('post_id', postIds);
  
  if (commentsRows) {
    for (const row of commentsRows) {
      if (row.post_id) {
        commentsMap[row.post_id] = (commentsMap[row.post_id] || 0) + 1;
      }
    }
  }

  return { likesMap, commentsMap };
};

export const isPostEdited = (post: any): boolean => {
  if (!post.created_at || !post.updated_at) return false;
  const createdDate = new Date(post.created_at).getTime();
  const updatedDate = new Date(post.updated_at).getTime();
  return updatedDate - createdDate > 1000;
};

export const enhancePostsWithData = async (posts: any[]): Promise<Post[]> => {
  if (!posts.length) return [];
  
  // Get unique user IDs and post IDs
  const userIds = [...new Set(posts.map(post => post.user_id).filter(Boolean))];
  const postIds = posts.map(post => post.id);
  
  // Fetch all data in parallel
  const [profilesMap, { likesMap, commentsMap }] = await Promise.all([
    fetchProfiles(userIds),
    fetchPostCounts(postIds)
  ]);

  // Enhance posts with profile data and counts
  return posts.map((post) => {
    const profileData = profilesMap[post.user_id] || {};
    return {
      ...post,
      profiles: {
        full_name: profileData.full_name,
        username: profileData.username,
        avatar_url: profileData.avatar_url,
        user_type: profileData.user_type
      },
      likes_count: likesMap[post.id] || 0,
      comments_count: commentsMap[post.id] || 0,
      is_edited: isPostEdited(post),
    };
  });
};
