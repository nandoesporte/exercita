import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GymPhotos = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fotos do Ambiente</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Funcionalidade de fotos simplificada para fisioterapia.
        </p>
      </CardContent>
    </Card>
  );
};

export default GymPhotos;