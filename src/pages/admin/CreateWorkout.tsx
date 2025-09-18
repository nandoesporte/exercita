import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CreateWorkout = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar Protocolo Terapêutico</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento para criar protocolos terapêuticos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWorkout;