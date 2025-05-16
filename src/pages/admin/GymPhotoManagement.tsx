
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
    <div className="container p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
        Gerenciamento de Fotos
      </h1>
      <p className="text-lg text-gray-300 mb-8 max-w-2xl">
        Aprovar ou rejeitar fotos enviadas pelos usuários para análise do ambiente da academia.
      </p>
      
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all" className="text-base font-medium">
            Todas ({allPhotos.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-base font-medium">
            Pendentes ({pendingPhotos.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-base font-medium">
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
      <div className="text-center py-16 bg-fitness-darkGray/40 rounded-lg">
        <p className="text-xl text-gray-300 font-medium">Nenhuma foto encontrada nesta categoria</p>
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
                  <span className="text-white text-base font-medium">
                    {photo.profiles?.first_name} {photo.profiles?.last_name}
                  </span>
                </div>
                
                {photo.approved && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
                    Aprovada
                  </div>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-fitness-darkGray border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Foto da academia</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <img
                  src={selectedPhoto || ''}
                  alt="Gym photo in full size"
                  className="w-full object-contain max-h-[70vh] rounded-md"
                />
                <div className="mt-6 space-y-3">
                  <p className="text-white text-lg">
                    <span className="font-semibold">Usuário:</span>{' '}
                    {photo.profiles?.first_name} {photo.profiles?.last_name}
                  </p>
                  {photo.description && (
                    <p className="text-white text-lg">
                      <span className="font-semibold">Descrição:</span> {photo.description}
                    </p>
                  )}
                  <p className="text-gray-300 text-base">
                    Enviado em {format(new Date(photo.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                
                <div className="flex justify-end gap-3 mt-8">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(photo.id)}
                    className="gap-2 px-4 py-2 text-base"
                  >
                    <X size={20} /> Rejeitar
                  </Button>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 gap-2 px-4 py-2 text-base"
                    onClick={() => handleApprove(photo.id)}
                  >
                    <Check size={20} /> Aprovar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-300 text-sm font-medium">
                {format(new Date(photo.created_at), 'dd/MM/yyyy')}
              </span>
              <div className="flex gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => setSelectedPhoto(photo.photo_url)}
                    >
                      <Eye size={18} className="text-gray-300" />
                    </Button>
                  </DialogTrigger>
                </Dialog>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-red-500 hover:text-red-400 hover:bg-transparent"
                  onClick={() => handleReject(photo.id)}
                >
                  <X size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-green-500 hover:text-green-400 hover:bg-transparent"
                  onClick={() => handleApprove(photo.id)}
                >
                  <Check size={18} />
                </Button>
              </div>
            </div>
            
            <p className="text-white text-base font-medium">
              {photo.profiles?.first_name} {photo.profiles?.last_name}
            </p>
            
            {photo.description && (
              <p className="text-gray-300 text-sm mt-2 line-clamp-2">{photo.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GymPhotoManagement;
