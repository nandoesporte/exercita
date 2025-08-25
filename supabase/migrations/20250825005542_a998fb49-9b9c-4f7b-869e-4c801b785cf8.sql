-- Garantir que Fernando está na tabela admins também
INSERT INTO public.admins (user_id, name, email, status, is_active, created_by)
VALUES (
  'a898ae66-1bd6-4835-a826-d77b1e0c8fbb',
  'Fernando Martins',
  'nandoesporte1@gmail.com',
  'active',
  true,
  'a898ae66-1bd6-4835-a826-d77b1e0c8fbb'
)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  status = 'active',
  is_active = true;