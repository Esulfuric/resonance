
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export const createUserProfile = async (user: User) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();
  
  if (error && error.code === 'PGRST116') {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      bio: user.user_metadata?.bio || '',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      user_type: user.user_metadata?.user_type || 'listener',
      updated_at: new Date().toISOString(),
    });
    
    if (insertError) {
      console.error("Error creating profile:", insertError);
    }
  }
};
