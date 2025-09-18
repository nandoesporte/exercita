import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export function useAdminRole() {
  const { user } = useAuth();
  
  const { data: roleData, isLoading } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return { isAdmin: false, isSuperAdmin: false };
      
      console.log("Checking admin role for user:", user.id);
      
      // Use RPC functions to check roles - simplified for physiotherapy app
      const adminCheck = await supabase.rpc('is_admin');
      
      if (adminCheck.error) {
        console.error("Error checking admin status:", adminCheck.error);
      }
      
      const isAdmin = Boolean(adminCheck.data);
      const isSuperAdmin = isAdmin; // In simplified system, admin = super admin
      
      console.log("Role check results:", { isAdmin, isSuperAdmin });
      
      return {
        isAdmin,
        isSuperAdmin
      };
    },
    enabled: !!user?.id,
    staleTime: 30000, // Cache for 30 seconds
  });
  
  return {
    isAdmin: roleData?.isAdmin || false,
    isSuperAdmin: roleData?.isSuperAdmin || false,
    isLoading,
  };
}