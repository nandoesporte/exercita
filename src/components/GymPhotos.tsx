
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Camera, Upload, Image } from 'lucide-react';
import GymPhotoUploader from './GymPhotoUploader';
import GymPhotosList from './GymPhotosList';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GymPhotos = () => {
  const [activeTab, setActiveTab] = useState('view');
  
  const handleUploadClick = () => {
    setActiveTab('upload');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fotos da Academia</h1>
      </div>
      
      <Alert className="mb-6">
        <Camera className="h-4 w-4" />
        <AlertDescription>
          Envie fotos da sua academia para receber treinos personalizados baseados nos equipamentos disponíveis.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">
            <Image className="mr-2 h-4 w-4" />
            Minhas Fotos
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" />
            Enviar Nova Foto
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Fotos</CardTitle>
              <CardDescription>
                Visualize e gerencie as fotos que você enviou
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GymPhotosList onUploadClick={handleUploadClick} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Nova Foto</CardTitle>
              <CardDescription>
                Envie uma foto da sua academia para ajudar a criar treinos personalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GymPhotoUploader />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GymPhotos;
