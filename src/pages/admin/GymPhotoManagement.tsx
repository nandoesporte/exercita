
import React, { useState } from 'react';
import { useGymPhotos } from '@/hooks/useGymPhotos';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

const GymPhotoManagement = () => {
  const { 
    allPhotos, 
    isLoadingAll, 
    updateApprovalStatus,
    analyzePhotoWithAI,
    analyzing 
  } = useGymPhotos();
  
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter photos by status
  const pendingPhotos = allPhotos.filter(photo => photo.approved === null || photo.approved === false);
  const approvedPhotos = allPhotos.filter(photo => photo.approved === true);

  const handleApprove = (photoId) => {
    updateApprovalStatus({ photoId, approved: true });
    toast.success('Foto aprovada com sucesso');
  };

  const handleReject = (photoId) => {
    updateApprovalStatus({ photoId, approved: false });
    toast.error('Foto rejeitada');
  };

  const handleAnalyzeWithAI = async (photoId) => {
    await analyzePhotoWithAI(photoId);
    toast.success('Foto analisada com sucesso pela IA');
  };

  const viewPhotoDetails = (photo) => {
    setSelectedPhoto(photo);
    setDialogOpen(true);
  };

  if (isLoadingAll) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando fotos...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gerenciamento de Fotos de Academia</h1>
        </div>

        <Alert className="mb-6 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Analise as fotos dos usuários para detectar equipamentos e gerar treinos personalizados.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pendentes <Badge className="ml-2 bg-amber-500">{pendingPhotos.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Aprovadas <Badge className="ml-2 bg-green-500">{approvedPhotos.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingPhotos.length > 0 ? (
                pendingPhotos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">Foto #{photo.id.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        Enviada por: {photo.profiles?.first_name || 'Usuário'} {photo.profiles?.last_name || ''}
                      </CardDescription>
                    </CardHeader>
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={photo.photo_url}
                        alt="Gym photo"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => viewPhotoDetails(photo)}
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">
                        Enviada em: {new Date(photo.created_at).toLocaleDateString()}
                      </p>
                      {photo.description && (
                        <p className="mt-2 text-sm">{photo.description}</p>
                      )}
                      <div className="mt-2">
                        <Badge variant={photo.processed_by_ai ? "success" : "outline"} className="mr-2">
                          {photo.processed_by_ai ? 'Analisada pela IA' : 'Não analisada'}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleApprove(photo.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Aprovar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleReject(photo.id)}
                        className="flex-1"
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Rejeitar
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleAnalyzeWithAI(photo.id)}
                        disabled={analyzing || photo.processed_by_ai}
                        className="flex-1"
                      >
                        {analyzing ? (
                          <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Analisando</>
                        ) : (
                          <><Info className="mr-1 h-4 w-4" /> Analisar IA</>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">Não há fotos pendentes</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedPhotos.length > 0 ? (
                approvedPhotos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">Foto #{photo.id.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        Enviada por: {photo.profiles?.first_name || 'Usuário'} {photo.profiles?.last_name || ''}
                      </CardDescription>
                    </CardHeader>
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={photo.photo_url}
                        alt="Gym photo"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => viewPhotoDetails(photo)}
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">
                        Enviada em: {new Date(photo.created_at).toLocaleDateString()}
                      </p>
                      {photo.description && (
                        <p className="mt-2 text-sm">{photo.description}</p>
                      )}
                      <div className="mt-2">
                        <Badge variant={photo.processed_by_ai ? "success" : "outline"} className="mr-2">
                          {photo.processed_by_ai ? 'Analisada pela IA' : 'Não analisada'}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4">
                      {!photo.processed_by_ai && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleAnalyzeWithAI(photo.id)}
                          disabled={analyzing}
                          className="w-full"
                        >
                          {analyzing ? (
                            <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Analisando</>
                          ) : (
                            <><Info className="mr-1 h-4 w-4" /> Analisar com IA</>
                          )}
                        </Button>
                      )}
                      {photo.processed_by_ai && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => viewPhotoDetails(photo)}
                          className="w-full"
                        >
                          <Info className="mr-1 h-4 w-4" /> Ver Análise
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">Não há fotos aprovadas</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Photo Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedPhoto && (
              <>
                <DialogHeader>
                  <DialogTitle>Detalhes da Foto</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={selectedPhoto.photo_url}
                      alt="Gym photo"
                      className="w-full h-auto rounded-md"
                    />
                    <div className="mt-4">
                      <h3 className="font-medium">Informações:</h3>
                      <p className="text-sm mt-1">Usuário: {selectedPhoto.profiles?.first_name || 'Usuário'} {selectedPhoto.profiles?.last_name || ''}</p>
                      <p className="text-sm mt-1">Enviada em: {new Date(selectedPhoto.created_at).toLocaleDateString()}</p>
                      <p className="text-sm mt-1">Status: {selectedPhoto.approved ? 'Aprovada' : selectedPhoto.approved === false ? 'Rejeitada' : 'Pendente'}</p>
                      <p className="text-sm mt-1">Descrição: {selectedPhoto.description || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Análise da IA:</h3>
                    {selectedPhoto.processed_by_ai ? (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm">Análise concluída! Veja os detalhes abaixo:</p>
                        
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => analyzePhotoWithAI(selectedPhoto.id)}
                            disabled={analyzing}
                            className="mt-2"
                          >
                            Re-analisar com IA
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm">Esta foto ainda não foi analisada pela IA.</p>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleAnalyzeWithAI(selectedPhoto.id)}
                          disabled={analyzing}
                          className="mt-4"
                        >
                          {analyzing ? (
                            <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Analisando</>
                          ) : (
                            <><Info className="mr-1 h-4 w-4" /> Analisar com IA</>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <h3 className="font-medium mb-2">Ações:</h3>
                      <div className="flex space-x-2">
                        <Button 
                          variant={selectedPhoto.approved ? "default" : "outline"} 
                          size="sm" 
                          onClick={() => handleApprove(selectedPhoto.id)}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" /> Aprovar
                        </Button>
                        <Button 
                          variant={selectedPhoto.approved === false ? "default" : "outline"} 
                          size="sm" 
                          onClick={() => handleReject(selectedPhoto.id)}
                        >
                          <XCircle className="mr-1 h-4 w-4" /> Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default GymPhotoManagement;
