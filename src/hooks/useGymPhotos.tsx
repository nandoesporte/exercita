
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export type GymPhoto = {
  id: string;
  user_id: string;
  photo_url: string;
  description: string | null;
  approved: boolean | null;
  created_at: string | null;
};

export const useGymPhotos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  
  // Get user's gym photos
  const getUserGymPhotos = () => {
    return useQuery({
      queryKey: ['user-gym-photos'],
      queryFn: async () => {
        if (!user) return [];
        
        const { data, error } = await supabase
          .from('user_gym_photos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching gym photos:', error);
          throw error;
        }
        
        return data as GymPhoto[];
      },
      enabled: !!user,
    });
  };
  
  // Get approved gym photos from all users
  const getApprovedGymPhotos = () => {
    return useQuery({
      queryKey: ['approved-gym-photos'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('user_gym_photos')
          .select('*')
          .eq('approved', true)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching approved gym photos:', error);
          throw error;
        }
        
        return data as GymPhoto[];
      },
    });
  };
  
  // Upload gym photo
  const uploadGymPhoto = useMutation({
    mutationFn: async ({ 
      file, 
      description 
    }: { 
      file: File; 
      description?: string;
    }) => {
      if (!user) throw new Error('You must be logged in to upload photos');
      
      setIsUploading(true);
      try {
        // 1. Upload file to storage
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${uuidv4()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('gym_photos')
          .upload(filePath, file);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // 2. Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('gym_photos')
          .getPublicUrl(filePath);
        
        const photoUrl = publicUrlData.publicUrl;
        
        // 3. Save record to the database
        const { data, error: dbError } = await supabase
          .from('user_gym_photos')
          .insert({
            user_id: user.id,
            photo_url: photoUrl,
            description: description || null,
          })
          .select('*')
          .single();
        
        if (dbError) {
          throw dbError;
        }
        
        return data as GymPhoto;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-gym-photos'] });
      toast.success('Foto enviada com sucesso!', {
        description: 'Sua foto será analisada e aprovada em breve.',
      });
    },
    onError: (error) => {
      toast.error('Erro ao enviar foto', {
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
      });
    },
  });
  
  // Delete gym photo
  const deleteGymPhoto = useMutation({
    mutationFn: async (photoId: string) => {
      if (!user) throw new Error('You must be logged in to delete photos');
      
      // 1. Get the photo to find the storage path
      const { data: photo, error: fetchError } = await supabase
        .from('user_gym_photos')
        .select('photo_url')
        .eq('id', photoId)
        .eq('user_id', user.id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // 2. Delete from database
      const { error: dbError } = await supabase
        .from('user_gym_photos')
        .delete()
        .eq('id', photoId);
      
      if (dbError) {
        throw dbError;
      }
      
      // 3. Try to delete the file from storage (if possible)
      try {
        const url = new URL(photo.photo_url);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const folderName = pathParts[pathParts.length - 2];
        const storagePath = `${folderName}/${fileName}`;
        
        await supabase.storage
          .from('gym_photos')
          .remove([storagePath]);
      } catch (error) {
        console.warn('Could not delete file from storage:', error);
        // Continue even if file deletion fails
      }
      
      return photoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-gym-photos'] });
      toast.success('Foto excluída com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao excluir foto', {
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
      });
    },
  });
  
  return {
    getUserGymPhotos,
    getApprovedGymPhotos,
    uploadGymPhoto,
    deleteGymPhoto,
    isUploading,
  };
};
