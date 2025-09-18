import { ReactNode } from 'react';
import { useAdminPermissionsContext } from '@/hooks/useAdminPermissionsContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ children, fallback }: PermissionGuardProps) {
  const { isAdmin, isLoading } = useAdminPermissionsContext();
  
  if (isLoading) {
    return <div className="animate-pulse bg-muted h-20 rounded-md"></div>;
  }
  
  if (!isAdmin) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <Alert variant="destructive">
        <ShieldX className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar este recurso.
        </AlertDescription>
      </Alert>
    );
  }
  
  return <>{children}</>;
}