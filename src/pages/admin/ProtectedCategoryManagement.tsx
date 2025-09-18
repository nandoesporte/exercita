import { PermissionGuard } from '@/components/admin/PermissionGuard';
import CategoryManagement from './CategoryManagement';

export default function ProtectedCategoryManagement() {
  return (
      <PermissionGuard>
        <CategoryManagement />
      </PermissionGuard>
  );
}