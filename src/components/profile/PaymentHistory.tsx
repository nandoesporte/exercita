
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

// Sample payment history data
const payments = [
  {
    id: '1',
    date: new Date(2023, 4, 15),
    amount: 99.90,
    status: 'completed',
    description: 'Mensalidade Maio 2023'
  },
  {
    id: '2',
    date: new Date(2023, 3, 15),
    amount: 99.90,
    status: 'completed',
    description: 'Mensalidade Abril 2023'
  },
  {
    id: '3',
    date: new Date(2023, 2, 15),
    amount: 99.90,
    status: 'completed',
    description: 'Mensalidade Março 2023'
  }
];

const PaymentHistory: React.FC = () => {
  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pago</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pagamentos</CardTitle>
        <CardDescription>Seus pagamentos recentes</CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="font-medium">{payment.description}</p>
                  <p className="text-sm text-gray-500">{formatDate(payment.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(payment.amount)}</p>
                  <div className="mt-1">{getStatusBadge(payment.status)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-gray-500">Nenhum pagamento encontrado</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
