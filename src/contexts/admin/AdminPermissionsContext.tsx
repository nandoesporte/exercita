import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/auth';
import { useAdminRole } from '@/hooks/useAdminRole';

interface AdminPermissionsContextType {
  adminId: string | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export const AdminPermissionsContext = createContext<AdminPermissionsContextType | undefined>(undefined);

export function AdminPermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { isAdmin, isSuperAdmin, isLoading: roleLoading } = useAdminRole();

  const value: AdminPermissionsContextType = {
    adminId: user?.id || null,
    isSuperAdmin,
    isAdmin,
    isLoading: roleLoading,
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