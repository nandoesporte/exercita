import { QueryClient } from '@tanstack/react-query';

export const clearAllCaches = (queryClient: QueryClient) => {
  // Limpar todos os caches relacionados a usuários
  queryClient.removeQueries({ queryKey: ['all-users'] });
  queryClient.removeQueries({ queryKey: ['users-by-admin'] });
  queryClient.removeQueries({ queryKey: ['admin-users'] });
  queryClient.removeQueries({ queryKey: ['current-admin-id'] });
  queryClient.removeQueries({ queryKey: ['admin-permissions'] });
  queryClient.removeQueries({ queryKey: ['admin-workout-categories'] });
  
  // Invalidar todas as queries para forçar refetch
  queryClient.invalidateQueries();
  
  // Limpar cache de memória
  queryClient.clear();
  
  console.log('Todos os caches foram limpos!');
};