
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

  -- Create the user in auth.users
  new_user := supabase_auth.admin_create_user(
    user_email := user_email,
    password := user_password,
    email_confirm := true, -- Auto confirm email
    user_metadata := user_metadata
  );
  
  -- Extract the new user's ID
  new_user_id := (new_user->>'id')::uuid;
  
  -- Return the created user data
  return new_user;
end;
$$;
