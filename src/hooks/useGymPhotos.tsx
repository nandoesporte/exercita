
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
// Removed Supabase imports - using MySQL now

export type GymPhoto = {
  id: string;
  photo_url: string;
  description: string | null;
  created_at: string;
  approved: boolean;
  user_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
};

export function useGymPhotos() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  // Placeholder - gym photos not yet implemented with MySQL
  return {
    photos: [],
    isLoading: false,
    uploading,
    uploadPhoto: async () => {
      toast.error('Upload de fotos será implementado em breve');
      return null;
    },
    deletePhoto: () => {
      toast.error('Exclusão de fotos será implementada em breve');
    },
    allPhotos: [],
    isLoadingAll: false,
    updateApprovalStatus: () => {
      toast.error('Aprovação de fotos será implementada em breve');
    }
  };
}
