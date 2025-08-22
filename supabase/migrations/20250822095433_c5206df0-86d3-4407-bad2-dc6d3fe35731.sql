-- Make nandoesporte1@gmail.com an admin
UPDATE public.profiles 
SET is_admin = true 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'nandoesporte1@gmail.com'
);