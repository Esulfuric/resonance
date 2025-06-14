
import { supabase } from "@/lib/supabase";

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
