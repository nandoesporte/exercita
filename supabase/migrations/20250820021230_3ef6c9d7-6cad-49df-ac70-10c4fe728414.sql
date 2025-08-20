-- Create admin user manually by inserting into auth.users
DO $$
DECLARE
    new_user_id uuid;
    encrypted_password text;
BEGIN
    -- Generate new UUID for user
    new_user_id := gen_random_uuid();
    
    -- Create password hash (note: in production, you should use proper password hashing)
    encrypted_password := crypt('190800+-', gen_salt('bf'));
    
    -- Insert into auth.users table
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data,
        raw_app_meta_data,
        aud,
        role
    ) VALUES (
        new_user_id,
        'nandoesporte1@gmail.com',
        encrypted_password,
        now(),
        now(),
        now(),
        '{"first_name": "Nando", "last_name": "Admin"}'::jsonb,
        '{}'::jsonb,
        'authenticated',
        'authenticated'
    );
    
    -- Create profile
    INSERT INTO public.profiles (id, email, nome)
    VALUES (new_user_id, 'nandoesporte1@gmail.com', 'Nando Admin');
    
    -- Add to admin_users table
    INSERT INTO public.admin_users (user_id, email, name, role, active)
    VALUES (new_user_id, 'nandoesporte1@gmail.com', 'Nando Admin', 'admin', true);
    
    RAISE NOTICE 'Admin user created successfully with ID: %', new_user_id;
END $$;