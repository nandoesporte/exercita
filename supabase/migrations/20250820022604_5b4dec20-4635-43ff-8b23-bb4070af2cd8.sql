-- Update admin user password with correct bcrypt hash
UPDATE auth.users 
SET encrypted_password = crypt('190800+-', gen_salt('bf'))
WHERE email = 'nandoesporte1@gmail.com';