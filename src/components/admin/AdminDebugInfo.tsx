import React from 'react';
import { useAdminPermissions } from '@/contexts/admin/AdminPermissionsContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AdminDebugInfo: React.FC = () => {
  const { adminId, permissions, isSuperAdmin, isAdmin, isLoading, hasPermission } = useAdminPermissions();
  const { isAdmin: roleIsAdmin, isSuperAdmin: roleIsSuperAdmin, isLoading: roleLoading } = useAdminRole();

  React.useEffect(() => {
    console.log('AdminDebugInfo - Current state:', {
      adminId,
      permissions,
      isSuperAdmin,
      isAdmin,
      isLoading,
      roleIsAdmin,
      roleIsSuperAdmin,
      roleLoading
    });
  }, [adminId, permissions, isSuperAdmin, isAdmin, isLoading, roleIsAdmin, roleIsSuperAdmin, roleLoading]);

  return (
    <Card className="mb-4 border-2 border-orange-300">
      <CardHeader>
        <CardTitle>Debug: Admin Permissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div><strong>Admin ID:</strong> {adminId || 'null'}</div>
        <div><strong>Is Admin (context):</strong> {isAdmin ? 'true' : 'false'}</div>
        <div><strong>Is Super Admin (context):</strong> {isSuperAdmin ? 'true' : 'false'}</div>
        <div><strong>Is Loading (context):</strong> {isLoading ? 'true' : 'false'}</div>
        <div><strong>Is Admin (role):</strong> {roleIsAdmin ? 'true' : 'false'}</div>
        <div><strong>Is Super Admin (role):</strong> {roleIsSuperAdmin ? 'true' : 'false'}</div>
        <div><strong>Role Loading:</strong> {roleLoading ? 'true' : 'false'}</div>
        <div><strong>Permissions:</strong> {JSON.stringify(permissions)}</div>
        <div><strong>Can manage workouts:</strong> {hasPermission('manage_workouts') ? 'true' : 'false'}</div>
        <div><strong>Can manage categories:</strong> {hasPermission('manage_categories') ? 'true' : 'false'}</div>
      </CardContent>
    </Card>
  );
};