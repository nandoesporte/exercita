import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export type GymPhoto = {
  id: string;
  photo_url: string;
  description: string | null;
  created_at: string;
  approved: boolean;
  user_id: string;
  profiles?: {
    nome: string;
  } | null;
};

export function useGymPhotos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  // Get user's gym photos - disabled since table doesn't exist
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['gymPhotos', user?.id],
    queryFn: async (): Promise<GymPhoto[]> => {
      console.log('Gym photos functionality disabled - table does not exist');
      return [];
    },
    enabled: !!user
  });

  // Upload a new gym photo - disabled
  const uploadPhoto = useCallback(
    async (file: File, description?: string): Promise<GymPhoto | null> => {
      console.log('Gym photos upload disabled - table does not exist');
      toast.error('Funcionalidade de fotos desabilitada');
      return null;
    },
    [user, queryClient]
  );

  // Delete a gym photo - disabled
  const { mutate: deletePhoto } = useMutation({
    mutationFn: async (photoId: string) => {
      console.log('Gym photos delete disabled - table does not exist');
      throw new Error('Gym photos table does not exist');
    },
    onSuccess: () => {
      toast.success('Funcionalidade desabilitada');
    },
    onError: () => {
      toast.error('Funcionalidade de fotos desabilitada');
    }
  });

  // Admin functions for viewing all photos - disabled
  const { data: allPhotos = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['adminGymPhotos'],
    queryFn: async (): Promise<GymPhoto[]> => {
      console.log('Admin gym photos functionality disabled - table does not exist');
      return [];
    },
    enabled: !!user
  });

  // Admin function to approve/reject a photo - disabled
  const { mutate: updateApprovalStatus } = useMutation({
    mutationFn: async ({ photoId, approved }: { photoId: string; approved: boolean }) => {
      console.log('Gym photos approval disabled - table does not exist');
      throw new Error('Gym photos table does not exist');
    },
    onSuccess: () => {
      toast.success('Funcionalidade desabilitada');
    },
    onError: () => {
      toast.error('Funcionalidade de fotos desabilitada');
    }
  });

  return {
    photos,
    isLoading,
    uploading,
    uploadPhoto,
    deletePhoto,
    // Admin functions
    allPhotos,
    isLoadingAll,
    updateApprovalStatus
  };
}