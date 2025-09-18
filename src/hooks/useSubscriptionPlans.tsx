import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-wrapper';

// Simplified subscription management for physiotherapy app
export function useSubscriptionPlans() {
  return {
    plans: [],
    isLoading: false,
    isLoadingPlans: false,
    createPlan: () => {},
    updatePlan: () => {},
    deletePlan: () => {},
    togglePlanActive: () => {},
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    currentSubscription: null,
    isLoadingSubscription: false,
    subscribeToplan: () => {},
    isSubscribing: false,
    checkSubscriptionStatus: () => {},
    hasActiveSubscription: false
  };
}