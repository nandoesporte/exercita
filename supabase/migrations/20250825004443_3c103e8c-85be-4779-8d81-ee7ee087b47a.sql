-- Primeiro, vamos garantir que apenas Fernando seja super admin
-- Mayara não deveria ter privilégios de admin
UPDATE public.profiles 
SET is_admin = false 
WHERE id = 'a189205a-b55f-4c3f-8bd5-b28a8df9f52b'; -- Mayara

-- Confirmar que Fernando é o único super admin
UPDATE public.profiles 
SET is_admin = true 
WHERE id = 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb'; -- Fernando

-- Vamos criar uma tabela para distinguir super admins de admins regulares
CREATE TABLE IF NOT EXISTS public.super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Policy para super admins
CREATE POLICY "Only super admins can manage super admins" 
ON public.super_admins 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.super_admins sa 
    WHERE sa.user_id = auth.uid()
  )
);

-- Inserir Fernando como super admin
INSERT INTO public.super_admins (user_id, granted_by) 
VALUES ('a898ae66-1bd6-4835-a826-d77b1e0c8fbb', 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb')
ON CONFLICT (user_id) DO NOTHING;

-- Criar função para verificar se é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.super_admins 
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Atualizar função toggle_user_admin_status para distinguir entre admin e super admin
CREATE OR REPLACE FUNCTION public.toggle_user_admin_status(user_id uuid, make_admin boolean)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    target_user_email text;
    current_status boolean;
    is_caller_super_admin boolean;
BEGIN
    -- Check if caller is at least admin
    IF NOT (SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid()) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Acesso negado: privilégios de administrador necessários'
        );
    END IF;

    -- Check if caller is super admin
    SELECT public.is_super_admin() INTO is_caller_super_admin;

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

    -- Prevent regular admins from promoting users to admin (only super admins can do this)
    IF make_admin AND NOT is_caller_super_admin THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Apenas Super Admins podem promover usuários a administradores'
        );
    END IF;

    -- Prevent removing super admin status
    IF NOT make_admin AND EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = user_id) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Não é possível remover privilégios de Super Admin'
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

    -- Update admin status (but not super admin status)
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