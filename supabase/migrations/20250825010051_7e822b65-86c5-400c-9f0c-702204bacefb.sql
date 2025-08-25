-- O problema é que a tabela auth.users ainda tem os usuários Cleiton e Mayara
-- mas seus perfis foram removidos da tabela profiles
-- Vou modificar a função get_all_users para só retornar usuários que tenham perfil na tabela profiles

CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can view all users';
  END IF;

  -- Retornar apenas usuários que tenham perfil correspondente na tabela profiles
  RETURN (
    SELECT json_agg(user_data)
    FROM (
      SELECT json_build_object(
        'id', u.id,
        'email', u.email,
        'raw_user_meta_data', u.raw_user_meta_data,
        'created_at', u.created_at,
        'last_sign_in_at', u.last_sign_in_at,
        'banned_until', u.banned_until
      ) AS user_data
      FROM auth.users u
      INNER JOIN public.profiles p ON p.id = u.id -- INNER JOIN para só pegar usuários com perfil
      ORDER BY u.created_at DESC
    ) AS ordered_users
  );
END;
$$;