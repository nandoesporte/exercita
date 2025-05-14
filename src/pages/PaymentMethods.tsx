
import React from 'react';
import { CreditCard, Calendar, ChevronLeft, CreditCardIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const PaymentMethods = () => {
  // Sample data for demonstration purposes
  const subscription = {
    active: true,
    plan: 'Plano Premium',
    price: 'R$ 99,90',
    nextPayment: '15/06/2023',
    paymentMethod: 'Cartão de crédito terminado em 1234',
  };

  // Sample payment history
  const payments = [
    { id: 1, date: '15/05/2023', amount: 'R$ 99,90', status: 'Pago' },
    { id: 2, date: '15/04/2023', amount: 'R$ 99,90', status: 'Pago' },
    { id: 3, date: '15/03/2023', amount: 'R$ 99,90', status: 'Pago' },
  ];

  return (
    <div className="container max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/profile">
          <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Meus Pagamentos</h1>
      </div>

      {/* Current Subscription */}
      <Card className="mb-6 bg-fitness-darkGray">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-fitness-orange" />
            Assinatura Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Plano:</span>
              <span className="font-medium">{subscription.plan}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-medium">{subscription.price}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Próximo pagamento:</span>
              <span className="font-medium">{subscription.nextPayment}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Método de pagamento:</span>
              <span className="font-medium">{subscription.paymentMethod}</span>
            </div>
            <div className="pt-2">
              <div className="px-4 py-3 rounded-md bg-fitness-green/10 border border-fitness-green/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-fitness-green"></div>
                  <span className="text-sm font-medium text-fitness-green">Assinatura Ativa</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="bg-fitness-darkGray">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-fitness-orange" />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <React.Fragment key={payment.id}>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">{payment.date}</p>
                      <p className="text-sm text-muted-foreground">{subscription.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{payment.amount}</p>
                      <p className="text-sm text-fitness-green">{payment.status}</p>
                    </div>
                  </div>
                  {index < payments.length - 1 && <Separator className="bg-gray-700/30" />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CreditCardIcon className="mx-auto h-10 w-10 text-muted-foreground opacity-30 mb-2" />
              <p className="text-muted-foreground">Nenhum pagamento realizado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Support */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Problemas com seus pagamentos?
        </p>
        <Button variant="outline" className="border-fitness-orange text-fitness-orange hover:bg-fitness-orange/10">
          Entrar em contato com o suporte
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethods;
