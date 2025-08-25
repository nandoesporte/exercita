-- Corrigir dados inconsistentes: Mayara não deveria ser admin
UPDATE public.profiles 
SET is_admin = false 
WHERE id = 'a189205a-b55f-4c3f-8bd5-b28a8df9f52b'; -- Mayara

-- Garantir que Fernando é o único super admin
UPDATE public.profiles 
SET is_admin = true 
WHERE id = 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb'; -- Fernando