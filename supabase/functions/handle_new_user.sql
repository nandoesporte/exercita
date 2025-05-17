
-- This function creates a profile entry when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (
    id, 
    first_name, 
    last_name, 
    avatar_url,
    instance_id
  )
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url',
    new.instance_id -- Include the instance_id from the auth.users table
  );
  return new;
end;
$$;

-- Make sure we have a trigger set up
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
