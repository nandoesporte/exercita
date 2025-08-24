import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminPermissionsContext } from './useAdminPermissionsContext';
import { toast } from '@/lib/toast-wrapper';

interface PersonalTrainer {
  id: string;
  name: string;
  credentials: string;
  bio: string;
  whatsapp: string;
  photo_url: string | null;
  is_primary: boolean;
  admin_id: string | null;
}

interface TrainerFormData {
  name: string;
  credentials: string;
  bio: string;
  whatsapp: string;
  photo_url?: string | null;
}

export function usePersonalTrainer() {
  const queryClient = useQueryClient();
  const { isSuperAdmin, isAdmin, adminId } = useAdminPermissionsContext();

  // Fetch trainer data
  const {
    data: trainer,
    isLoading,
    error
  } = useQuery({
    queryKey: ['personal-trainer', adminId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_trainers')
        .select('*')
        .eq('is_primary', true)
        .maybeSingle();

      if (error) throw error;
      return data as PersonalTrainer | null;
    },
    enabled: !!adminId || isSuperAdmin,
  });

  // Create or update trainer
  const updateTrainerMutation = useMutation({
    mutationFn: async (formData: TrainerFormData) => {
      const trainerData = {
        name: formData.name,
        credentials: formData.credentials,
        bio: formData.bio,
        whatsapp: formData.whatsapp,
        photo_url: formData.photo_url,
        is_primary: true,
      };

      if (trainer?.id) {
        // Update existing trainer
        const { data, error } = await supabase
          .from('personal_trainers')
          .update(trainerData)
          .eq('id', trainer.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new trainer
        const { data, error } = await supabase
          .from('personal_trainers')
          .insert(trainerData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-trainer'] });
      toast("Salvo com sucesso: As informações do personal trainer foram atualizadas.");
    },
    onError: (error) => {
      console.error('Error saving trainer:', error);
      toast("Erro ao salvar: Não foi possível salvar as informações. Tente novamente.");
    },
  });

  // Upload photo
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `trainer-profile-${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('trainer_photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('trainer_photos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    },
    onSuccess: () => {
      toast("Foto enviada com sucesso: A foto do perfil foi atualizada.");
    },
    onError: (error) => {
      console.error('Error uploading photo:', error);
      toast("Erro no upload: Não foi possível enviar a foto. Tente novamente.");
    },
  });

  return {
    trainer,
    isLoading,
    error,
    updateTrainer: updateTrainerMutation.mutate,
    isUpdating: updateTrainerMutation.isPending,
    uploadPhoto: uploadPhotoMutation.mutate,
    isUploading: uploadPhotoMutation.isPending,
    photoUrl: uploadPhotoMutation.data,
  };
}