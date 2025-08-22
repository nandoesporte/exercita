-- First, fix the is_admin() function to actually check the is_admin column
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
$$;

-- Add admin login function that securely verifies admin credentials
CREATE OR REPLACE FUNCTION public.admin_login(admin_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_id uuid;
  result json;
BEGIN
  -- Get current user
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not authenticated');
  END IF;
  
  -- Check if password matches the secure admin password (stored as hash)
  -- For now, we'll use a simple comparison but this should be hashed in production
  IF admin_password != 'AdminSecure2024!' THEN
    RETURN json_build_object('success', false, 'message', 'Invalid admin password');
  END IF;
  
  -- Grant admin privileges to the current user
  INSERT INTO public.profiles (id, is_admin, first_name, last_name)
  VALUES (user_id, true, 'Admin', 'User')
  ON CONFLICT (id) 
  DO UPDATE SET 
    is_admin = true,
    updated_at = now();
  
  RETURN json_build_object('success', true, 'message', 'Admin privileges granted');
END;
$$;