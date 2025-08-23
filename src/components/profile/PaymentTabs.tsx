
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CreditCard, Wallet } from 'lucide-react';
import PaymentInfo from './PaymentInfo';
import PaymentHistory from './PaymentHistory';
import MonthlyFeeSection from '@/components/payment/MonthlyFeeSection';

interface PaymentTabsProps {
  pixKey: {
    id: string;
    key_type: 'cpf' | 'email' | 'phone' | 'random';
    key_value: string;
    recipient_name: string;
    is_primary: boolean;
  } | null;
  isLoadingPixKey: boolean;
}

const PaymentTabs: React.FC<PaymentTabsProps> = ({ pixKey, isLoadingPixKey }) => {
  const [savedMonthlyFee, setSavedMonthlyFee] = useState('99.90');

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">Pagamentos</h3>
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 w-full">
          <TabsTrigger value="info" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Wallet size={16} />
            <span>Informações</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <CreditCard size={16} />
            <span>Histórico</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="space-y-4">
          <PaymentInfo pixKey={pixKey} isLoading={isLoadingPixKey} />
          <MonthlyFeeSection 
            savedMonthlyFee={savedMonthlyFee} 
            setSavedMonthlyFee={setSavedMonthlyFee} 
          />
        </TabsContent>
        <TabsContent value="history">
          <PaymentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentTabs;
