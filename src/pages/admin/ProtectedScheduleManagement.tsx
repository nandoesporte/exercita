import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProtectedScheduleManagement = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Horários</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema de horários simplificado para fisioterapia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProtectedScheduleManagement;