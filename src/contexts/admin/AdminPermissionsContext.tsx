import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useAdminRole } from '@/hooks/useAdminRole';
import type { Database } from '@/integrations/supabase/types';

type AdminPermission = Database['public']['Enums']['admin_permission'];

interface AdminPermissionsContextType {
  permissions: AdminPermission[];
  hasPermission: (permission: AdminPermission) => boolean;
  isLoading: boolean;
  adminId: string | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

const AdminPermissionsContext = createContext<AdminPermissionsContextType | undefined>(undefined);

export function AdminPermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { isAdmin, isSuperAdmin, isLoading: roleLoading } = useAdminRole();
  const [adminId, setAdminId] = useState<string | null>(null);

  // Fetch current admin ID
  const { data: adminData } = useQuery({
    queryKey: ['current-admin-id', user?.id],
    queryFn: async () => {
      if (!user?.id || !isAdmin) return null;
      
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching admin ID:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id && isAdmin && !isSuperAdmin,
  });

  // Fetch admin permissions
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['admin-permissions', adminData?.id, isSuperAdmin],
    queryFn: async () => {
      if (isSuperAdmin) {
        // Return all possible permissions for Super Admin
        return [
          'manage_workouts', 
          'manage_exercises', 
          'manage_categories', 
          'manage_products', 
          'manage_store',
          'manage_gym_photos', 
          'manage_schedule', 
          'manage_appointments', 
          'manage_payment_methods'
        ] as AdminPermission[];
      }
      
      if (!adminData?.id) return [];
      
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('permission')
        .eq('admin_id', adminData.id);
        
      if (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }
      
      return data.map(p => p.permission);
    },
    enabled: (!!adminData?.id || isSuperAdmin) && isAdmin,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  useEffect(() => {
    if (adminData?.id) {
      setAdminId(adminData.id);
    } else if (isSuperAdmin) {
      setAdminId('super_admin');
    } else {
      setAdminId(null);
    }
  }, [adminData?.id, isSuperAdmin]);

  const hasPermission = (permission: AdminPermission): boolean => {
    // During loading, return false to prevent premature access
    if (roleLoading || permissionsLoading) return false;
    
    // Super admin always has all permissions
    if (isSuperAdmin) return true;
    
    // Regular admins need explicit permissions
    return permissions.includes(permission);
  };

  const value: AdminPermissionsContextType = {
    permissions,
    hasPermission,
    isLoading: roleLoading || permissionsLoading,
    adminId,
    isSuperAdmin,
    isAdmin,
  };

  return (
    <AdminPermissionsContext.Provider value={value}>
      {children}
    </AdminPermissionsContext.Provider>
  );
}

export function useAdminPermissions() {
  const context = useContext(AdminPermissionsContext);
  if (context === undefined) {
    throw new Error('useAdminPermissions must be used within an AdminPermissionsProvider');
  }
  return context;
}