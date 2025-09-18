import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EditWorkoutExercises = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Exercícios do Protocolo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento para editar exercícios dos protocolos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditWorkoutExercises;