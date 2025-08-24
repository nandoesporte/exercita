-- Atualizar perfis existentes sem admin_id para associá-los ao admin que os criou
-- Isso corrige o problema de usuários já registrados não aparecerem na lista

-- Primeiro, vamos verificar se existem perfis sem admin_id que deveriam estar associados a algum admin
-- Para isso, vamos associar usuários sem admin_id ao primeiro admin ativo encontrado como fallback
-- Em um cenário real, você poderia ter lógica mais específica baseada em quando foram criados

DO $$
DECLARE
    first_admin_id uuid;
BEGIN
    -- Buscar o primeiro admin ativo
    SELECT id INTO first_admin_id 
    FROM public.admins 
    WHERE status = 'active' AND is_active = true 
    ORDER BY created_at 
    LIMIT 1;
    
    -- Se encontrarmos um admin, atualizar perfis sem admin_id
    IF first_admin_id IS NOT NULL THEN
        UPDATE public.profiles 
        SET admin_id = first_admin_id,
            updated_at = now()
        WHERE admin_id IS NULL 
        AND is_admin = false;
        
        -- Log do resultado
        RAISE NOTICE 'Atualizados perfis órfãos para admin_id: %', first_admin_id;
    END IF;
END $$;