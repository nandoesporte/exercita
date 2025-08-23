-- Fix critical security issues

-- 1. Secure PIX keys table - remove public access and add proper RLS for SELECT
DROP POLICY IF EXISTS "Anyone can view PIX keys" ON public.pix_keys;

CREATE POLICY "Admins can view PIX keys" 
ON public.pix_keys 
FOR SELECT 
USING (is_admin());

-- 2. Secure payment settings table - add proper RLS for SELECT
CREATE POLICY "Anyone can view payment settings" 
ON public.payment_settings 
FOR SELECT 
USING (true);

-- Note: Payment settings can be viewed by everyone since it's needed for the store UI
-- The sensitive admin management is already protected by the existing admin policy

-- 3. Secure personal trainers - remove public contact access and add authenticated access
DROP POLICY IF EXISTS "Anyone can view personal trainers" ON public.personal_trainers;

CREATE POLICY "Authenticated users can view personal trainers" 
ON public.personal_trainers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 4. Create the missing debug function for user management
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

-- 5. Ensure profiles table has proper instance_id handling
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instance_id uuid;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_instance_id ON public.profiles(instance_id);