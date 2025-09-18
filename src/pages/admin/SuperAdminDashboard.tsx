import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SuperAdminDashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel Super Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Dashboard administrativo simplificado para fisioterapia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;