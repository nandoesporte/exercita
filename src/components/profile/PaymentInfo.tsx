
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PixKeySection from '@/components/payment/PixKeySection';

interface PaymentInfoProps {
  pixKey: {
    id: string;
    key_type: 'cpf' | 'email' | 'phone' | 'random';
    key_value: string;
    recipient_name: string;
    is_primary: boolean;
  } | null;
  isLoading: boolean;
}

const PaymentInfo: React.FC<PaymentInfoProps> = ({ pixKey, isLoading }) => {
  const savedPixKey = pixKey?.key_value || '';
  const savedPixKeyType = pixKey?.key_type || 'cpf';
  
  // These setter functions won't actually update the data, but they're needed for the component props
  const setSavedPixKey = (value: string) => {
    // In a real implementation, this would update the user's PIX key
    console.log('Setting PIX key to:', value);
  };
  
  const setSavedPixKeyType = (value: string) => {
    // In a real implementation, this would update the user's PIX key type
    console.log('Setting PIX key type to:', value);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chave PIX</CardTitle>
        <CardDescription>Gerenciar suas chaves PIX para pagamentos</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-3/4 h-12" />
          </div>
        ) : pixKey ? (
          <PixKeySection
            savedPixKey={savedPixKey}
            setSavedPixKey={setSavedPixKey}
            savedPixKeyType={savedPixKeyType}
            setSavedPixKeyType={setSavedPixKeyType}
          />
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">Nenhuma chave PIX encontrada</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Adicionar chave PIX
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentInfo;
