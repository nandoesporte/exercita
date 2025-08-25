-- Fix user admin status - Cleiton and Mayara should be regular users, only Fernando should be admin
UPDATE public.profiles 
SET is_admin = false 
WHERE id IN (
  'd484eacf-184f-4e88-8ee6-5e1a89e6887e', -- Cleiton
  'a189205a-b55f-4c3f-8bd5-b28a8df9f52b'  -- Mayara
);

-- Ensure Fernando is the only admin
UPDATE public.profiles 
SET is_admin = true 
WHERE id = 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb'; -- Fernando

-- Fix the toggle_user_admin_status function to use the correct parameter name
CREATE OR REPLACE FUNCTION public.toggle_user_admin_status(user_id uuid, make_admin boolean)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    target_user_email text;
    current_status boolean;
BEGIN
    -- Check if caller is admin
    IF NOT (SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid()) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Acesso negado: privilégios de administrador necessários'
        );
    END IF;

    -- Get current admin status and email
    SELECT COALESCE(p.is_admin, false), COALESCE(u.email, p.first_name || '@***')
    INTO current_status, target_user_email
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    WHERE p.id = user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuário não encontrado'
        );
    END IF;

    -- Prevent removing admin status from self
    IF user_id = auth.uid() AND NOT make_admin THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Você não pode remover seus próprios privilégios de administrador'
        );
    END IF;

    -- If already in desired state, return success but inform user
    IF current_status = make_admin THEN
        RETURN json_build_object(
            'success', true,
            'message', CASE 
                WHEN make_admin THEN 'Usuário já é administrador'
                ELSE 'Usuário já é usuário comum'
            END
        );
    END IF;

    -- Update admin status
    UPDATE public.profiles 
    SET 
        is_admin = make_admin,
        updated_at = now()
    WHERE id = user_id;

    -- Return success message
    RETURN json_build_object(
        'success', true,
        'message', CASE 
            WHEN make_admin THEN 'Usuário promovido a administrador com sucesso!'
            ELSE 'Privilégios de administrador removidos com sucesso!'
        END
    );
END;
$$;