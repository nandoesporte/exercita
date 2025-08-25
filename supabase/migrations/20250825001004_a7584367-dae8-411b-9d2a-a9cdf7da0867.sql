-- Corrigir especificamente o usuário Cleiton que ainda está marcado como admin
UPDATE public.profiles 
SET is_admin = false 
WHERE id = 'd484eacf-184f-4e88-8ee6-5e1a89e6887e' -- Cleiton
AND first_name = 'Cleiton';