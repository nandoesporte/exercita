-- Create profile for nandoesporte1@gmail.com and set as admin
INSERT INTO public.profiles (id, is_admin, first_name, last_name)
VALUES (
  'fd367417-ab4a-45ca-9240-fa77e67c9b2f',
  true,
  'Fernando',
  'Admin'
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
  last_name = COALESCE(EXCLUDED.last_name, profiles.last_name);

-- Update user password to a known value
-- Note: This uses the auth.admin_update_user_password function if available
-- or you can use the admin panel to reset password to: admin123456