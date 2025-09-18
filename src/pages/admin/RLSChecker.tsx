import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RLSChecker = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Verificador de Segurança RLS</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade de segurança simplificada para fisioterapia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RLSChecker;