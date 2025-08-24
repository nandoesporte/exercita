import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useAdminRole } from '@/hooks/useAdminRole';
import { toast } from 'sonner';

export function useSubscriptionGuard() {
  const { hasActiveSubscription, isLoadingSubscription } = useSubscriptionPlans();
  const { isSuperAdmin, isAdmin } = useAdminRole();
  
  const canPerformAction = () => {
    // Super Admin sempre pode realizar ações
    if (isSuperAdmin) return true;
    
    // Se não é admin, não pode realizar ações administrativas
    if (!isAdmin) return false;
    
    // Admin precisa ter assinatura ativa
    return hasActiveSubscription;
  };
  
  const checkSubscriptionAndAct = (action: () => void, message?: string) => {
    if (isLoadingSubscription) {
      toast.info('Verificando status da assinatura...');
      return;
    }
    
    if (!canPerformAction()) {
      const defaultMessage = 'Você precisa de uma assinatura ativa para realizar esta ação';
      toast.error(message || defaultMessage);
      return;
    }
    
    action();
  };
  
  return {
    canPerformAction,
    checkSubscriptionAndAct,
    hasActiveSubscription,
    isLoadingSubscription,
    isSuperAdmin,
    isAdmin
  };
}