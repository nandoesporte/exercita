import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WorkoutDetail = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Protocolo Terapêutico</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Protocolo ID: {id}
          </p>
          <p className="mt-4">
            Esta funcionalidade está sendo adaptada para o contexto de fisioterapia.
            Em breve você poderá ver os detalhes completos dos protocolos terapêuticos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutDetail;