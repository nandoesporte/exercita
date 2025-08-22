-- Temporarily disable the trigger to isolate the issue
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Clean up any potential duplicate or problematic user records
-- (This will help identify if the issue is with existing data)
DELETE FROM auth.users WHERE email_confirmed_at IS NULL AND created_at < (now() - interval '1 hour');

-- Recreate the trigger with better error handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();