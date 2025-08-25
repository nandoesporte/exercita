-- Limpar todas as tabelas mantendo apenas o Super Admin Fernando
-- IMPORTANTE: Fazer backup implícito verificando dados antes da limpeza

-- 1. Primeiro, verificar quem é o super admin atual
SELECT 'Super Admin atual:' as info, u.email, p.first_name, p.last_name 
FROM public.super_admins sa
JOIN auth.users u ON u.id = sa.user_id
JOIN public.profiles p ON p.id = sa.user_id;

-- 2. Limpar dados mantendo integridade referencial

-- Limpar histórico de workouts dos usuários
DELETE FROM public.user_workout_history 
WHERE user_id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb';

-- Limpar fotos da academia enviadas por usuários
DELETE FROM public.user_gym_photos 
WHERE user_id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb';

-- Limpar análises de fotos da academia
DELETE FROM public.gym_photo_analysis;

-- Limpar workouts baseados em equipamentos
DELETE FROM public.equipment_based_workouts 
WHERE user_id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb';

-- Limpar recomendações de workout
DELETE FROM public.workout_recommendations 
WHERE user_id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb';

-- Limpar agendamentos
DELETE FROM public.appointments 
WHERE user_id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb';

-- Limpar itens de pedidos
DELETE FROM public.order_items 
WHERE order_id IN (
    SELECT id FROM public.orders 
    WHERE user_id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb'
);

-- Limpar pedidos
DELETE FROM public.orders 
WHERE user_id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb';

-- Limper permissões de admin (exceto do super admin)
DELETE FROM public.admin_permissions 
WHERE admin_id IN (
    SELECT id FROM public.admins 
    WHERE user_id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb'
);

-- Limpar roles de usuários (exceto do super admin)
DELETE FROM public.user_roles 
WHERE user_id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb';

-- Limpar assinaturas de admin
DELETE FROM public.admin_subscriptions 
WHERE admin_id IN (
    SELECT id FROM public.admins 
    WHERE user_id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb'
);

-- Limpar logs de webhook
DELETE FROM public.kiwify_webhook_logs;

-- Limpar histórico de clonagem de workouts
DELETE FROM public.workout_clone_history;

-- Limpar admins (exceto o super admin)
DELETE FROM public.admins 
WHERE user_id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb';

-- Limpar perfis de usuários (exceto do super admin)
DELETE FROM public.profiles 
WHERE id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb';

-- Resetar sequências e contadores se necessário
-- (As tabelas usam UUID então não precisamos resetar sequences)

-- Verificar estado final
SELECT 'Usuários restantes:' as info, COUNT(*) as total FROM public.profiles;
SELECT 'Super Admins:' as info, COUNT(*) as total FROM public.super_admins;
SELECT 'Admins regulares:' as info, COUNT(*) as total FROM public.admins;