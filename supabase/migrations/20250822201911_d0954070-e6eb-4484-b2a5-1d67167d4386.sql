-- Set nandoesporte2@gmail.com as admin too
INSERT INTO public.profiles (id, is_admin, first_name, last_name)
VALUES (
  '1458fc48-8f56-4f2c-9009-e1d5b869345f',
  true,
  'Fernando',
  'Admin'
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
  last_name = COALESCE(EXCLUDED.last_name, profiles.last_name);