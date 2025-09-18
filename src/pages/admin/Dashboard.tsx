import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel Administrativo - Fisioterapia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema de gestão adaptado para clínica de fisioterapia.
          </p>
          <p className="mt-4">
            Use o menu lateral para navegar pelas funcionalidades disponíveis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;