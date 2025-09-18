-- Create missing is_super_admin function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Add admin_id column to personal_trainers table to fix the interface
ALTER TABLE public.personal_trainers 
ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES auth.users(id);