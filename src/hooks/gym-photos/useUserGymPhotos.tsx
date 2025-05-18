
import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useGymPhotosBase, GymPhoto } from './useGymPhotosBase';

export function useUserGymPhotos() {
  const { user, queryClient, supabase } = useGymPhotosBase();
  const [uploading, setUploading] = useState(false);

  // Get user's gym photos
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['gymPhotos', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_gym_photos')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        toast.error('Erro ao carregar fotos');
        console.error('Error fetching gym photos:', error);
        return [];
      }
      
      return data as GymPhoto[];
    },
    enabled: !!user
  });

  // Upload a new gym photo
  const uploadPhoto = useCallback(
    async (file: File, description?: string) => {
      if (!user) {
        toast.error('Você precisa estar logado para enviar fotos');
        return null;
      }
      
      try {
        setUploading(true);
        
        // Create a unique file name to avoid conflicts
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
        const filePath = `gym_photos/${fileName}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('gym_photos')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL
        const { data: publicURL } = supabase.storage
          .from('gym_photos')
          .getPublicUrl(filePath);
          
        // Insert record in database
        const { data: photoRecord, error: insertError } = await supabase
          .from('user_gym_photos')
          .insert({
            user_id: user.id,
            photo_url: publicURL.publicUrl,
            description: description || null
          })
          .select('*')
          .single();
          
        if (insertError) {
          throw insertError;
        }
        
        // Invalidate query to refetch photos
        queryClient.invalidateQueries({ queryKey: ['gymPhotos', user.id] });
        
        toast.success('Foto enviada com sucesso');
        return photoRecord as GymPhoto;
      } catch (error: any) {
        console.error('Error uploading photo:', error);
        toast.error(`Erro ao enviar foto: ${error.message}`);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [user, queryClient, supabase]
  );

  // Delete a gym photo
  const { mutate: deletePhoto } = useMutation({
    mutationFn: async (photoId: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data: photo } = await supabase
        .from('user_gym_photos')
        .select('photo_url')
        .eq('id', photoId)
        .single();
        
      if (!photo) throw new Error('Foto não encontrada');
      
      // Extract the path from the URL
      const urlParts = photo.photo_url.split('/');
      const filePathParts = urlParts.slice(urlParts.indexOf('gym_photos'));
      const filePath = filePathParts.join('/');
      
      // Delete from storage
      await supabase.storage
        .from('gym_photos')
        .remove([filePath]);
        
      // Delete from database
      const { error } = await supabase
        .from('user_gym_photos')
        .delete()
        .eq('id', photoId);
        
      if (error) throw error;
      
      return photoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gymPhotos', user?.id] });
      toast.success('Foto removida com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting photo:', error);
      toast.error('Erro ao remover foto');
    }
  });

  return {
    photos,
    isLoading,
    uploading,
    uploadPhoto,
    deletePhoto
  };
}
