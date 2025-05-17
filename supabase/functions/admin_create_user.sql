
-- This function allows admins to create new users
create or replace function public.admin_create_user(
  user_email text,
  user_password text,
  user_metadata jsonb DEFAULT '{}'::jsonb
)
returns json
language plpgsql
security definer
as $$
declare
  new_user json;
  new_user_id uuid;
begin
  -- Check if user is admin
  if not (select is_admin from public.profiles where id = auth.uid()) then
    raise exception 'Only administrators can create users';
  end if;

  -- Generate UUID for the user before insertion
  new_user_id := gen_random_uuid();
  
  -- Insert the user with the generated ID
  insert into auth.users 
    (id, email, raw_user_meta_data, email_confirmed_at)
  values 
    (new_user_id, user_email, user_metadata, now());
  
  -- Set the user's password explicitly with proper encryption
  update auth.users 
  set encrypted_password = crypt(user_password, gen_salt('bf'))
  where id = new_user_id;
  
  -- Return the created user data
  select json_build_object(
    'id', new_user_id,
    'email', user_email,
    'user_metadata', user_metadata
  ) into new_user;
  
  return new_user;
end;
$$;
