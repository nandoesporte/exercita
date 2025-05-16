
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';

const AppointmentManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Consultas</h1>
        <Button className="flex gap-2">
          <Calendar className="h-4 w-4" />
          Nova Consulta
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Consultas</CardTitle>
          <CardDescription>
            Gerencie as consultas e agendamentos da academia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta seção está em desenvolvimento. Em breve você poderá gerenciar todas as consultas e agendamentos aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentManagement;
