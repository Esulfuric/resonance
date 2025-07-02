
-- First, let's clean up the custom admin system and use Supabase Auth instead
-- Drop the custom admin functions and table since we'll use Supabase Auth
DROP FUNCTION IF EXISTS public.authenticate_admin(text, text);
DROP FUNCTION IF EXISTS public.create_admin_user(text, text);
DROP TABLE IF EXISTS public.admin_users;

-- Create a simple function to check if a user is an admin based on their email
CREATE OR REPLACE FUNCTION public.is_admin_user(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_email = 'admin@resonance.app';
$$;

-- Create an admin role check function that works with auth.users
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_email text;
BEGIN
  -- Get the current user's email from auth
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if user is admin
  IF current_user_email = 'admin@resonance.app' THEN
    RETURN json_build_object(
      'success', true,
      'is_admin', true,
      'email', current_user_email
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'is_admin', false,
      'error', 'Access denied'
    );
  END IF;
END;
$$;
