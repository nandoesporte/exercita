
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Usuário precisa estar logado');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar perfil:', error);
        throw new Error(`Erro ao buscar perfil: ${error.message}`);
      }
      
      console.log('Perfil carregado:', data);
      return data as Profile;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 15 * 60 * 1000, // Keep cache for 15 minutes
  });
  
  const updateProfile = useMutation({
    mutationFn: async (profileData: ProfileUpdate): Promise<Profile | null> => {
      if (!user) throw new Error('Usuário precisa estar logado');
      
      console.log('Atualizando perfil com dados:', profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select();
      
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw new Error(`Erro ao atualizar perfil: ${error.message}`);
      }
      
      console.log('Perfil atualizado com sucesso:', data);
      
      // Verificar se há dados retornados
      if (!data || data.length === 0) {
        console.warn('Nenhum dado retornado após atualização do perfil');
        return null;
      }
      
      return data[0] as Profile;
    },
    onSuccess: (updatedProfile) => {
      if (updatedProfile) {
        // Update cache immediately with the new data
        queryClient.setQueryData(['profile', user?.id], updatedProfile);
      }
      
      // Then invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Perfil atualizado com sucesso');
    },
    onError: (error: Error) => {
      console.error('Erro na atualização do perfil:', error);
      toast.error(error.message || 'Falha ao atualizar o perfil');
    }
  });
  
  // Function for profile image upload
  const uploadProfileImage = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Usuário precisa estar logado');
      
      // Generate unique file path with user ID as prefix
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${uuidv4()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }
      
      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
      
      const avatarUrl = urlData.publicUrl;
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Erro ao atualizar perfil com novo avatar:', updateError);
        throw new Error(`Erro ao atualizar perfil com novo avatar: ${updateError.message}`);
      }
      
      return avatarUrl;
    },
    onSuccess: (avatarUrl) => {
      // Update the profile in cache with the new avatar URL
      queryClient.setQueryData(['profile', user?.id], (oldData: any) => {
        if (oldData) {
          return { ...oldData, avatar_url: avatarUrl };
        }
        return oldData;
      });
      
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Foto de perfil atualizada com sucesso');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar foto de perfil:', error);
      toast.error(error.message || 'Falha ao atualizar foto de perfil');
    }
  });
  
  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
    uploadProfileImage: uploadProfileImage.mutate,
    isUploadingImage: uploadProfileImage.isPending,
  };
}
