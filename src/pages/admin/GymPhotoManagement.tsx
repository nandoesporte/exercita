import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GymPhotoManagement = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Fotos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema de fotos simplificado para fisioterapia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GymPhotoManagement;