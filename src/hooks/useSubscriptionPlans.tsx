import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  kiwify_product_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminSubscription = {
  id: string;
  admin_id: string;
  plan_id: string;
  status: 'pending' | 'active' | 'cancelled' | 'expired';
  start_date: string | null;
  end_date: string | null;
  kiwify_order_id: string | null;
  kiwify_customer_id: string | null;
  payment_url: string | null;
  created_at: string;
  updated_at: string;
  subscription_plans?: SubscriptionPlan;
};

export function useSubscriptionPlans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar todos os planos de assinatura (Super Admin)
  const { data: plans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
        
      if (error) {
        console.error('Error fetching subscription plans:', error);
        toast.error('Erro ao carregar planos');
        return [];
      }
      
      return data as SubscriptionPlan[];
    },
    enabled: !!user
  });

  // Buscar assinatura do admin atual
  const { data: currentSubscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['adminSubscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('admin_subscriptions')
        .select(`
          *,
          subscription_plans(*)
        `)
        .eq('admin_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching admin subscription:', error);
        return null;
      }
      
      return data as AdminSubscription;
    },
    enabled: !!user
  });

  // Criar novo plano (Super Admin)
  const { mutate: createPlan } = useMutation({
    mutationFn: async (planData: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(planData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast.success('Plano criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating plan:', error);
      toast.error('Erro ao criar plano');
    }
  });

  // Atualizar plano (Super Admin)
  const { mutate: updatePlan } = useMutation({
    mutationFn: async ({ id, ...planData }: Partial<SubscriptionPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(planData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast.success('Plano atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating plan:', error);
      toast.error('Erro ao atualizar plano');
    }
  });

  // Deletar plano (Super Admin)
  const { mutate: deletePlan } = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast.success('Plano removido com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting plan:', error);
      toast.error('Erro ao remover plano');
    }
  });

  // Iniciar processo de assinatura (gera URL de checkout Kiwify)
  const { mutate: subscribeToplan, isPending: isSubscribing } = useMutation({
    mutationFn: async (planId: string) => {
      // Chama a edge function para criar checkout na Kiwify
      const { data, error } = await supabase.functions.invoke('create-kiwify-checkout', {
        body: { planId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.checkout_url) {
        // Abre o checkout da Kiwify em nova aba
        window.open(data.checkout_url, '_blank');
      } else {
        toast.error('URL de checkout não encontrada');
      }
    },
    onError: (error) => {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao gerar checkout');
    }
  });

  // Verificar status da assinatura
  const { mutate: checkSubscriptionStatus } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-subscription-status');
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubscription'] });
      toast.success('Status da assinatura atualizado');
    },
    onError: (error) => {
      console.error('Error checking subscription status:', error);
      toast.error('Erro ao verificar status da assinatura');
    }
  });

  return {
    // Planos
    plans,
    isLoadingPlans,
    createPlan,
    updatePlan,
    deletePlan,
    
    // Assinatura atual
    currentSubscription,
    isLoadingSubscription,
    subscribeToplan,
    isSubscribing,
    checkSubscriptionStatus,
    
    // Helpers
    hasActiveSubscription: currentSubscription?.status === 'active' && 
                          currentSubscription?.end_date && 
                          new Date(currentSubscription.end_date) > new Date(),
  };
}