import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PixKeySection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chaves PIX</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Funcionalidade de pagamento PIX simplificada para fisioterapia.
        </p>
      </CardContent>
    </Card>
  );
};

export default PixKeySection;