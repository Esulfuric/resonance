
-- Create admin_users table to store admin credentials
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add banned status to profiles table
ALTER TABLE public.profiles ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN ban_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN banned_at TIMESTAMP WITH TIME ZONE;

-- Add moderation fields to posts table
ALTER TABLE public.posts ADD COLUMN is_removed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.posts ADD COLUMN removal_reason TEXT;
ALTER TABLE public.posts ADD COLUMN removed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.posts ADD COLUMN removed_by UUID;

-- Update music_uploads table to have proper approval workflow
ALTER TABLE public.music_uploads ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.music_uploads ADD COLUMN reviewed_by UUID;
ALTER TABLE public.music_uploads ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.music_uploads ADD COLUMN rejection_reason TEXT;

-- Create admin_actions table to log admin activities
CREATE TABLE public.admin_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'ban_user', 'remove_post', 'approve_music', 'reject_music'
  target_id UUID NOT NULL, -- user_id, post_id, or music_upload_id
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert a default admin user (username: admin, password: admin123)
-- Note: In production, use a secure password hash
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Enable RLS on new tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin tables (only accessible by admin functions)
CREATE POLICY "Admin users table access" ON public.admin_users FOR ALL USING (false);
CREATE POLICY "Admin actions table access" ON public.admin_actions FOR ALL USING (false);

-- Update existing RLS policies to handle banned users and removed posts
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
CREATE POLICY "Users can view posts" ON public.posts FOR SELECT 
USING (
  NOT is_removed OR 
  (is_removed AND user_id = auth.uid())
);

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(is_banned, false) FROM public.profiles WHERE id = user_id_param;
$$;
