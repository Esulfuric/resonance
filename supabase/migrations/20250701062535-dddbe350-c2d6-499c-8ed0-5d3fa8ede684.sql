
-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update the authenticate_admin function to work with the pgcrypto extension
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
    -- Use crypt to verify the password (now that pgcrypto is enabled)
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

-- Update the create_admin_user function to work with pgcrypto
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
  -- Insert new admin user with hashed password using pgcrypto
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

-- Create the default admin user again with proper password hashing
SELECT public.create_admin_user('admin', 'ResonanceAdmin2024!');
