import { PermissionGuard } from '@/components/admin/PermissionGuard';
import ProductManagement from './ProductManagement';

export default function ProtectedProductManagement() {
  return (
      <PermissionGuard>
        <ProductManagement />
      </PermissionGuard>
  );
}