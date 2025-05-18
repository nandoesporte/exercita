
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGymPhotosBase, GymPhoto } from './useGymPhotosBase';

export function useAdminGymPhotos() {
  const { user, queryClient, supabase } = useGymPhotosBase();

  // Admin functions for viewing all photos
  const { data: allPhotos = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['adminGymPhotos'],
    queryFn: async () => {
      if (!user) return [];
      
      // First fetch all photos
      const { data: photoData, error: photoError } = await supabase
        .from('user_gym_photos')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (photoError) {
        toast.error('Erro ao carregar fotos');
        console.error('Error fetching all gym photos:', photoError);
        return [];
      }
      
      // Then fetch all user profiles
      const userIds = photoData.map(photo => photo.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);
        
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }
      
      // Create a map of user profiles by ID
      const profilesMap = (profilesData || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {});
      
      // Combine the data
      const photosWithProfiles = photoData.map(photo => ({
        ...photo,
        profiles: profilesMap[photo.user_id] || null
      }));
      
      return photosWithProfiles;
    },
    enabled: !!user
  });

  // Admin function to approve/reject a photo
  const { mutate: updateApprovalStatus } = useMutation({
    mutationFn: async ({ photoId, approved }: { photoId: string; approved: boolean }) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('user_gym_photos')
        .update({ approved })
        .eq('id', photoId);
        
      if (error) throw error;
      
      return { photoId, approved };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGymPhotos'] });
      toast.success('Status da foto atualizado');
    },
    onError: (error) => {
      console.error('Error updating photo status:', error);
      toast.error('Erro ao atualizar status da foto');
    }
  });

  return {
    allPhotos,
    isLoadingAll,
    updateApprovalStatus
  };
}
