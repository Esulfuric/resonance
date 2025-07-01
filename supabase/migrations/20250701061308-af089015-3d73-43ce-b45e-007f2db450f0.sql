
-- Create admin_users table if it doesn't exist (it should already exist based on the schema)
-- But let's make sure it has the right structure
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create a policy that prevents direct access to admin_users table
-- Only the admin authentication function should be able to access it
CREATE POLICY "No direct access to admin_users" 
  ON public.admin_users 
  FOR ALL 
  USING (false);

-- Create a secure function to authenticate admin users
CREATE OR REPLACE FUNCTION public.authenticate_admin(
  username_param text,
  password_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  is_valid boolean := false;
BEGIN
  -- Get the admin user record
  SELECT * INTO admin_record 
  FROM admin_users 
  WHERE username = username_param;
  
  -- Check if user exists and password matches
  IF admin_record.id IS NOT NULL THEN
    -- Use crypt to verify the password (assuming bcrypt hashing)
    SELECT (password_hash = crypt(password_param, password_hash)) INTO is_valid
    FROM admin_users 
    WHERE username = username_param;
  END IF;
  
  -- Return authentication result
  IF is_valid THEN
    RETURN json_build_object(
      'success', true,
      'admin_id', admin_record.id,
      'username', admin_record.username
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid credentials'
    );
  END IF;
END;
$$;

-- Create a function to safely create admin users (for initial setup)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  username_param text,
  password_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert new admin user with hashed password
  INSERT INTO admin_users (username, password_hash)
  VALUES (username_param, crypt(password_param, gen_salt('bf')));
  
  RETURN json_build_object('success', true, 'message', 'Admin user created');
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('success', false, 'error', 'Username already exists');
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Failed to create admin user');
END;
$$;

-- Insert a default admin user (you should change this password immediately)
-- This is just for initial access - change the password after first login
SELECT public.create_admin_user('admin', 'ResonanceAdmin2024!');
