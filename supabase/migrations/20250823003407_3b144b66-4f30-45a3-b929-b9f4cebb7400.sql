-- Fix remaining security issues

-- 1. Fix function search path security issue
CREATE OR REPLACE FUNCTION public.debug_get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  raw_user_meta_data jsonb,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  banned_until timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can view all users';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data,
    u.created_at,
    u.last_sign_in_at,
    u.banned_until
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- 2. Fix existing functions that may have search path issues
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
$$;

-- Update admin_login function to set search path
CREATE OR REPLACE FUNCTION public.admin_login(admin_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  -- Check if password matches the secure admin password
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

-- Update the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;