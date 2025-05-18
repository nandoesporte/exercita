
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

interface PixKey {
  id: string;
  key_type: 'cpf' | 'email' | 'phone' | 'random';
  key_value: string;
  recipient_name: string;
  is_primary: boolean;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('Profile fetch skipped: No authenticated user');
        return null;
      }
      
      try {
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
      } catch (error) {
        console.error('Exception in profile fetch:', error);
        return null;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60, // Consider data stale after 1 minute
    gcTime: 1000 * 60 * 5, // Keep cache for 5 minutes
  });

  // Add function to fetch primary PIX key
  const pixKeyQuery = useQuery({
    queryKey: ['pixKey', 'primary', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('PIX key fetch skipped: No authenticated user');
        return null;
      }
      
      try {
        const { data, error } = await supabase
          .from('pix_keys')
          .select('*')
          .eq('is_primary', true)
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // no rows returned
            console.error('Erro ao buscar chave PIX:', error);
          }
          return null;
        }
        
        return {
          id: data.id,
          key_type: data.key_type as 'cpf' | 'email' | 'phone' | 'random',
          key_value: data.key_value,
          recipient_name: data.recipient_name,
          is_primary: data.is_primary || false,
        } as PixKey;
      } catch (error) {
        console.error('Exception in PIX key fetch:', error);
        return null;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
  });
  
  const updateProfile = useMutation({
    mutationFn: async (profileData: ProfileUpdate): Promise<Profile | null> => {
      if (!user) {
        console.error('Profile update aborted: No authenticated user');
        throw new Error('Usuário precisa estar logado');
      }
      
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
        // Force refetch to ensure fresh data from server
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
        toast.success("Perfil atualizado com sucesso");
      }
    },
    onError: (error: Error) => {
      console.error('Erro na atualização do perfil:', error);
      toast.error(error.message || 'Falha ao atualizar o perfil');
    }
  });
  
  // Function for profile image upload
  const uploadProfileImage = useMutation({
    mutationFn: async (file: File) => {
      if (!user) {
        console.error('Image upload aborted: No authenticated user');
        throw new Error('Usuário precisa estar logado');
      }
      
      // Generate unique file path with user ID as prefix
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${uuidv4()}.${fileExt}`;
      
      console.log('Fazendo upload da imagem do perfil:', filePath);
      
      // Upload file to storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }
      
      console.log('Upload realizado com sucesso:', uploadData);
      
      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
      
      const avatarUrl = urlData.publicUrl;
      
      console.log('URL do avatar:', avatarUrl);
      
      // Update profile with new avatar URL
      const { error: updateError, data: profileData } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)
        .select();
      
      if (updateError) {
        console.error('Erro ao atualizar perfil com novo avatar:', updateError);
        throw new Error(`Erro ao atualizar perfil com novo avatar: ${updateError.message}`);
      }
      
      console.log('Perfil atualizado com novo avatar:', profileData);
      
      return { avatarUrl, updatedProfile: profileData?.[0] };
    },
    onSuccess: (result) => {
      // Update the profile in cache with the new avatar URL and full profile data
      if (result.updatedProfile) {
        queryClient.setQueryData(['profile', user?.id], result.updatedProfile);
      } else {
        // Fall back to just updating the avatar_url if we don't have full profile data
        queryClient.setQueryData(['profile', user?.id], (oldData: any) => {
          if (oldData) {
            return { ...oldData, avatar_url: result.avatarUrl };
          }
          return oldData;
        });
      }
      
      // Force refetch to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success("Foto de perfil atualizada com sucesso");
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar foto de perfil:', error);
      toast.error(error.message || 'Falha ao atualizar foto de perfil');
    }
  });
  
  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading || !user, // Consider loading if no user yet
    error: profileQuery.error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
    uploadProfileImage: uploadProfileImage.mutate,
    isUploadingImage: uploadProfileImage.isPending,
    pixKey: pixKeyQuery.data,
    isLoadingPixKey: pixKeyQuery.isLoading || !user,
  };
}
