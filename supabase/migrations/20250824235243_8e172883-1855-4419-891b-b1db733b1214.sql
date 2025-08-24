-- Fix users with NULL admin_id by assigning them to the first available admin
UPDATE profiles 
SET admin_id = (
  SELECT id 
  FROM admins 
  WHERE status = 'active' 
  ORDER BY created_at 
  LIMIT 1
)
WHERE admin_id IS NULL AND is_admin = false;