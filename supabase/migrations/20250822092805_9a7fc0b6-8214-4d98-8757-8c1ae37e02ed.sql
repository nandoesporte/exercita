-- Create a more robust handle_new_user function with error handling
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Try to insert the profile, but don't fail the user creation if it fails
  begin
    insert into public.profiles (
      id, 
      first_name, 
      last_name, 
      avatar_url
    )
    values (
      new.id,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      new.raw_user_meta_data->>'avatar_url'
    );
  exception when others then
    -- Log the error but don't prevent user creation
    raise log 'Failed to create profile for user %: %', new.id, sqlerrm;
  end;
  
  return new;
end;
$$;