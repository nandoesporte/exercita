import { useContext } from 'react';
import { useAdminPermissions } from '@/contexts/admin/AdminPermissionsContext';
import { useAdminRole } from '@/hooks/useAdminRole';

export function useAdminPermissionsContext() {
  const { isSuperAdmin, isAdmin } = useAdminRole();
  
  try {
    // Try to use the context
    const context = useAdminPermissions();
    return {
      hasPermission: context.hasPermission,
      isLoading: context.isLoading,
      permissions: context.permissions,
      adminId: context.adminId,
      isSuperAdmin: context.isSuperAdmin,
      isAdmin: context.isAdmin,
    };
  } catch (error) {
    console.warn('AdminPermissions context not available, using fallback', error);
    
    // Fallback when context is not available
    return {
      hasPermission: (permission: string) => isSuperAdmin, // Super admins get all permissions as fallback
      isLoading: false,
      permissions: [],
      adminId: null,
      isSuperAdmin,
      isAdmin,
    };
  }
}