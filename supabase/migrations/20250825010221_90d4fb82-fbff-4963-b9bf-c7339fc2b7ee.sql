-- Limpar COMPLETAMENTE a tabela profiles mantendo apenas Fernando
DELETE FROM public.profiles WHERE id != 'a898ae66-1bd6-4835-a826-d77b1e0c8fbb';

-- Verificar se só restou Fernando
SELECT 'Perfis após limpeza final:' as info, COUNT(*) as total FROM public.profiles;
SELECT 'Detalhes do perfil restante:' as info, id, first_name, last_name, is_admin FROM public.profiles;