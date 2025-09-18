import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PaymentMethodManagement = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Métodos de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade simplificada para o contexto de fisioterapia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodManagement;