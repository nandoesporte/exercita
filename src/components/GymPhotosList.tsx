
import React from 'react';
import { useGymPhotos, GymPhoto } from '@/hooks/useGymPhotos';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import GymPhotoDetailView from './GymPhotoDetailView';

interface GymPhotosListProps {
  onUploadClick?: () => void;
}

const GymPhotosList = ({ onUploadClick }: GymPhotosListProps) => {
  const { photos, isLoading, deletePhoto } = useGymPhotos();
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = React.useState<GymPhoto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta foto?')) {
      return;
    }
    
    try {
      await deletePhoto(photoId);
      toast.success('Foto excluída com sucesso');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Erro ao excluir foto');
    }
  };

  const handleViewPhoto = (photo: GymPhoto) => {
    setSelectedPhoto(photo);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">Você ainda não enviou nenhuma foto da sua academia</p>
        <Button onClick={onUploadClick}>Enviar Foto</Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <div className="h-48 overflow-hidden relative">
              <img 
                src={photo.photo_url} 
                alt="Academia" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={
                  photo.approved === true ? "success" : 
                  photo.approved === false ? "destructive" : 
                  "outline"
                }>
                  {photo.approved === true ? "Aprovada" : 
                   photo.approved === false ? "Rejeitada" : 
                   "Pendente"}
                </Badge>
                {photo.processed_by_ai && (
                  <Badge variant="secondary" className="ml-1">
                    Analisada por IA
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">
                Enviada em: {new Date(photo.created_at).toLocaleDateString()}
              </p>
              {photo.description && (
                <p className="mt-2 text-sm">{photo.description}</p>
              )}
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewPhoto(photo)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeletePhoto(photo.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPhoto && (
            <GymPhotoDetailView photo={selectedPhoto} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GymPhotosList;
