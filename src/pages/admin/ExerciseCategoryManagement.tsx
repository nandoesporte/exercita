import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ExerciseCategoryManagement = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Categorias de Exercícios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema de categorias de exercícios simplificado para fisioterapia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseCategoryManagement;