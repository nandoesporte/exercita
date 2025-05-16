
import React, { useState, useRef } from 'react';
import { useGymPhotos } from '@/hooks/useGymPhotos';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, X, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GymPhotos = () => {
  const { user } = useAuth();
  const { 
    getUserGymPhotos, 
    getApprovedGymPhotos, 
    uploadGymPhoto, 
    deleteGymPhoto,
    isUploading 
  } = useGymPhotos();
  const { data: userPhotos, isLoading: isLoadingUserPhotos } = getUserGymPhotos();
  const { data: approvedPhotos, isLoading: isLoadingApprovedPhotos } = getApprovedGymPhotos();
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido', { 
        description: 'Por favor envie uma imagem JPG, PNG ou WEBP.' 
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande', { 
        description: 'O tamanho máximo permitido é 5MB.' 
      });
      return;
    }
    
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDialogOpen(true);
  };
  
  const handleUpload = async () => {
    if (!selectedImage) return;
    
    try {
      await uploadGymPhoto.mutateAsync({
        file: selectedImage,
        description: description.trim() || undefined
      });
      
      // Reset form
      setSelectedImage(null);
      setPreviewUrl(null);
      setDescription('');
      setDialogOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  const handleDelete = async (photoId: string) => {
    if (confirm('Tem certeza que deseja excluir esta foto?')) {
      await deleteGymPhoto.mutateAsync(photoId);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const renderPhotoGrid = (photos: any[] = [], isUser = false) => {
    if (photos.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {isUser 
              ? 'Você ainda não enviou nenhuma foto. Compartilhe fotos da sua academia para seu personal!'
              : 'Nenhuma foto aprovada disponível ainda.'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <img 
                src={photo.photo_url} 
                alt="Academia" 
                className="w-full h-full object-cover"
              />
              
              {isUser && (
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X size={16} />
                </button>
              )}
              
              {isUser && !photo.approved && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                  <AlertCircle size={12} />
                  <span>Aguardando aprovação</span>
                </div>
              )}
            </div>
            
            {photo.description && (
              <div className="p-3">
                <p className="text-sm">{photo.description}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container max-w-7xl pb-16">
      <h1 className="text-2xl font-bold mb-2">Fotos da Academia</h1>
      <p className="text-muted-foreground mb-6">
        Compartilhe fotos da sua academia com seu personal trainer para ajudar a montar seu treino.
      </p>
      
      <Alert className="mb-6 bg-fitness-darkGray border-amber-500">
        <Info className="h-4 w-4 text-amber-400" />
        <AlertDescription>
          Suas fotos serão revisadas pelo seu personal trainer para melhor entendimento do ambiente.
        </AlertDescription>
      </Alert>
      
      <div className="mb-8">
        <Button 
          onClick={triggerFileInput} 
          className="w-full sm:w-auto bg-fitness-orange hover:bg-fitness-orange/90"
          disabled={isUploading || !user}
        >
          {isUploading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
              Enviando...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-5 w-5" />
              Enviar Foto da Academia
            </>
          )}
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/jpeg,image/png,image/jpg,image/webp" 
          className="hidden" 
        />
        
        {!user && (
          <p className="mt-2 text-sm text-amber-500">
            Você precisa estar logado para enviar fotos.
          </p>
        )}
      </div>
      
      <Tabs defaultValue="gallery" className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="gallery">Fotos Aprovadas</TabsTrigger>
          <TabsTrigger value="my-photos">Minhas Fotos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gallery" className="p-1">
          {isLoadingApprovedPhotos ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-orange"></div>
            </div>
          ) : (
            renderPhotoGrid(approvedPhotos)
          )}
        </TabsContent>
        
        <TabsContent value="my-photos" className="p-1">
          {!user ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                Você precisa estar logado para ver suas fotos.
              </p>
              <Button asChild variant="outline">
                <a href="/login">Fazer Login</a>
              </Button>
            </div>
          ) : isLoadingUserPhotos ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-orange"></div>
            </div>
          ) : (
            renderPhotoGrid(userPhotos, true)
          )}
        </TabsContent>
      </Tabs>
      
      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Foto da Academia</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {previewUrl && (
              <div className="relative aspect-video mx-auto border rounded-md overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            <Textarea
              placeholder="Descreva o ambiente ou equipamentos disponíveis na foto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setDialogOpen(false);
              setSelectedImage(null);
              setPreviewUrl(null);
              setDescription('');
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading}
              className="bg-fitness-orange hover:bg-fitness-orange/90"
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GymPhotos;
