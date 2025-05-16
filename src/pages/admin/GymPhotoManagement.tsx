
import React, { useState } from 'react';
import { useGymPhotos } from '@/hooks/useGymPhotos';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GymPhotoManagement = () => {
  const { allPhotos, isLoadingAll, updateApprovalStatus } = useGymPhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const pendingPhotos = allPhotos.filter(photo => !photo.approved);
  const approvedPhotos = allPhotos.filter(photo => photo.approved);
  
  const handleApprove = (photoId: string) => {
    updateApprovalStatus({ photoId, approved: true });
  };
  
  const handleReject = (photoId: string) => {
    if (confirm('Deseja rejeitar esta foto?')) {
      updateApprovalStatus({ photoId, approved: false });
    }
  };
  
  if (isLoadingAll) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-orange"></div>
      </div>
    );
  }

  return (
    <div className="container p-4">
      <h1 className="text-2xl font-bold text-white mb-2">Gerenciamento de Fotos</h1>
      <p className="text-gray-300 mb-6">
        Aprovar ou rejeitar fotos enviadas pelos usuários para análise do ambiente da academia.
      </p>
      
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">
            Todas ({allPhotos.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes ({pendingPhotos.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprovadas ({approvedPhotos.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <PhotoGrid
            photos={allPhotos}
            handleApprove={handleApprove}
            handleReject={handleReject}
            setSelectedPhoto={setSelectedPhoto}
            selectedPhoto={selectedPhoto}
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <PhotoGrid
            photos={pendingPhotos}
            handleApprove={handleApprove}
            handleReject={handleReject}
            setSelectedPhoto={setSelectedPhoto}
            selectedPhoto={selectedPhoto}
          />
        </TabsContent>
        
        <TabsContent value="approved">
          <PhotoGrid
            photos={approvedPhotos}
            handleApprove={handleApprove}
            handleReject={handleReject}
            setSelectedPhoto={setSelectedPhoto}
            selectedPhoto={selectedPhoto}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface PhotoGridProps {
  photos: any[];
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  setSelectedPhoto: (url: string | null) => void;
  selectedPhoto: string | null;
}

const PhotoGrid = ({ photos, handleApprove, handleReject, setSelectedPhoto, selectedPhoto }: PhotoGridProps) => {
  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-fitness-darkGray/40 rounded-lg">
        <p className="text-lg text-gray-300">Nenhuma foto encontrada nesta categoria</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo: any) => (
        <div key={photo.id} className="bg-fitness-darkGray rounded-lg overflow-hidden shadow-lg">
          <Dialog>
            <DialogTrigger asChild>
              <div 
                className="relative h-56 w-full cursor-pointer"
                onClick={() => setSelectedPhoto(photo.photo_url)}
              >
                <img
                  src={photo.photo_url}
                  alt="Gym Photo"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <span className="text-white text-sm">
                    {photo.profiles?.first_name} {photo.profiles?.last_name}
                  </span>
                </div>
                
                {photo.approved && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 text-xs rounded">
                    Aprovada
                  </div>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-fitness-darkGray border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Foto da academia</DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <img
                  src={selectedPhoto || ''}
                  alt="Gym photo in full size"
                  className="w-full object-contain max-h-[70vh]"
                />
                <div className="mt-4 space-y-2">
                  <p className="text-white">
                    <span className="font-medium">Usuário:</span>{' '}
                    {photo.profiles?.first_name} {photo.profiles?.last_name}
                  </p>
                  {photo.description && (
                    <p className="text-white">
                      <span className="font-medium">Descrição:</span> {photo.description}
                    </p>
                  )}
                  <p className="text-gray-300 text-sm">
                    Enviado em {format(new Date(photo.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(photo.id)}
                    className="gap-2"
                  >
                    <X size={18} /> Rejeitar
                  </Button>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 gap-2"
                    onClick={() => handleApprove(photo.id)}
                  >
                    <Check size={18} /> Aprovar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm">
                {format(new Date(photo.created_at), 'dd/MM/yyyy')}
              </span>
              <div className="flex gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setSelectedPhoto(photo.photo_url)}
                    >
                      <Eye size={18} className="text-gray-300" />
                    </Button>
                  </DialogTrigger>
                </Dialog>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-transparent"
                  onClick={() => handleReject(photo.id)}
                >
                  <X size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-transparent"
                  onClick={() => handleApprove(photo.id)}
                >
                  <Check size={18} />
                </Button>
              </div>
            </div>
            
            <p className="text-white text-sm">
              {photo.profiles?.first_name} {photo.profiles?.last_name}
            </p>
            
            {photo.description && (
              <p className="text-gray-300 text-sm mt-1 truncate">{photo.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GymPhotoManagement;
