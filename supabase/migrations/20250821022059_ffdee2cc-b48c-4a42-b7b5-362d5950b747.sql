-- Fix search path for remaining functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;