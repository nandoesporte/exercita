import { PermissionGuard } from '@/components/admin/PermissionGuard';
import PaymentMethodManagement from './PaymentMethodManagement';

export default function ProtectedPaymentMethodManagement() {
  return (
      <PermissionGuard>
        <PaymentMethodManagement />
      </PermissionGuard>
  );
}