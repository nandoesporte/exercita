-- Function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email text,
  user_password text,
  admin_name text DEFAULT null
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  created_user_data json;
  created_user_id uuid;
BEGIN
  -- Create the user account
  SELECT auth.admin_create_user(
    user_email,
    user_password,
    '{"email_confirmed": true}'::jsonb
  ) INTO created_user_data;
  
  -- Extract user ID from the result
  created_user_id := (created_user_data->>'id')::uuid;
  
  -- Create profile for the user
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    created_user_id,
    user_email,
    COALESCE(admin_name, 'Admin User')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome = EXCLUDED.nome;
  
  -- Add user to admin_users table
  INSERT INTO public.admin_users (user_id, email, name, role, active)
  VALUES (
    created_user_id,
    user_email,
    COALESCE(admin_name, 'Admin User'),
    'admin',
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    active = EXCLUDED.active;
  
  RETURN json_build_object(
    'success', true,
    'user_id', created_user_id,
    'email', user_email,
    'message', 'Admin user created successfully'
  );
END;
$$;

-- Create the admin user
SELECT create_admin_user('nandoesporte1@gmail.com', '190800+-', 'Nando Admin');