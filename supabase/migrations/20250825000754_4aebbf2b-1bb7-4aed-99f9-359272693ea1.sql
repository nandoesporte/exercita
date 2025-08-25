-- Corrigir os dados dos usuários que foram criados incorretamente como admin
-- Apenas Fernando (nandoesporte1@gmail.com) deve ser admin
-- Cleiton e Mayara devem ser usuários comuns

UPDATE public.profiles 
SET is_admin = false 
WHERE id IN (
  'd484eacf-184f-4e88-8ee6-5e1a89e6887e', -- Cleiton
  'a189205a-b55f-4c3f-8bd5-b28a8df9f52b'  -- Mayara
);

-- Verificar se a função toggle_user_admin_status existe e funciona corretamente
CREATE OR REPLACE FUNCTION public.toggle_user_admin_status(user_id uuid, make_admin boolean)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Update user admin status
  UPDATE public.profiles 
  SET is_admin = make_admin 
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'User admin status updated successfully',
    'user_id', user_id,
    'is_admin', make_admin
  );
END;
$$;