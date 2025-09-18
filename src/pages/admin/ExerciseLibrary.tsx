import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ExerciseLibrary = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Exercícios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Biblioteca de exercícios terapêuticos para fisioterapia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseLibrary;