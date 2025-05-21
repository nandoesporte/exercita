
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { updateUserProfile } from '@/contexts/auth/profileUtils';

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
        console.log('Fetching profile for user:', user.id);
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
          .maybeSingle();
        
        if (error) {
          console.error('Erro ao buscar chave PIX:', error);
          return null;
        }
        
        if (!data) return null;
        
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
    staleTime: 1000 * 60, // Consider data stale after 1 minute
  });
  
  const updateProfile = useMutation({
    mutationFn: async (profileData: ProfileUpdate): Promise<Profile | null> => {
      if (!user) {
        console.error('Profile update aborted: No authenticated user');
        throw new Error('Usuário precisa estar logado');
      }
      
      console.log('Atualizando perfil com dados:', profileData);
      
      // Ensure all fields are properly formatted
      const cleanedProfileData = Object.entries(profileData).reduce((acc, [key, value]) => {
        // Skip null or undefined values to prevent overwriting with nulls
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      console.log('Dados limpos para atualização:', cleanedProfileData);
      
      // Use the utility function for profile updates
      const success = await updateUserProfile(user.id, cleanedProfileData);
      
      if (!success) {
        throw new Error('Erro ao atualizar perfil');
      }
      
      // Get the updated profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Erro ao obter perfil atualizado:', error);
        throw new Error(`Erro ao obter perfil atualizado: ${error.message}`);
      }
      
      console.log('Perfil atualizado com sucesso:', data);
      return data as Profile;
    },
    onSuccess: (updatedProfile) => {
      if (updatedProfile) {
        // Update cache immediately with new data
        queryClient.setQueryData(['profile', user?.id], updatedProfile);
        // Force refetch to ensure fresh data
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
        toast('Perfil atualizado com sucesso');
      }
    },
    onError: (error: Error) => {
      console.error('Erro na atualização do perfil:', error);
      toast(error.message || 'Falha ao atualizar o perfil');
    }
  });
  
  const uploadProfileImage = useMutation({
    mutationFn: async (file: File) => {
      if (!user) {
        console.error('Image upload aborted: No authenticated user');
        throw new Error('Usuário precisa estar logado');
      }
      
      // Create a unique filename that won't overwrite previous uploads
      const fileExt = file.name.split('.').pop();
      const uniqueId = uuidv4(); // Generate a unique ID for this upload
      const filePath = `${user.id}/${uniqueId}.${fileExt}`;
      
      console.log('Fazendo upload da imagem do perfil:', filePath);
      
      try {
        // Check if bucket exists and create it if needed
        const { data: bucketList } = await supabase.storage.listBuckets();
        const bucketExists = bucketList?.some(bucket => bucket.name === 'profile_images');
        
        if (!bucketExists) {
          console.log('Creating profile_images bucket');
          await supabase.storage.createBucket('profile_images', {
            public: true,
            fileSizeLimit: 10485760 // 10MB
          });
        }
      } catch (bucketError) {
        console.error('Error checking/creating bucket:', bucketError);
        // Continue with upload attempt even if bucket check fails
      }
      
      // Upload file to storage with caching disabled
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: 'no-cache, no-store, must-revalidate',
          upsert: true,
        });
      
      if (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Erro ao obter URL pública do avatar');
      }
      
      const avatarUrl = urlData.publicUrl;
      console.log('Avatar URL:', avatarUrl);
      
      // Update profile with new avatar URL using updateUserProfile utility
      const success = await updateUserProfile(user.id, { avatar_url: avatarUrl });
      
      if (!success) {
        throw new Error('Erro ao atualizar perfil com novo avatar');
      }
      
      // Get the updated profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Erro ao obter perfil atualizado:', profileError);
        throw new Error(`Erro ao obter perfil atualizado: ${profileError.message}`);
      }
      
      console.log('Perfil atualizado com novo avatar:', profileData);
      
      return { 
        avatarUrl, 
        updatedProfile: profileData 
      };
    },
    onSuccess: (result) => {
      // Update profile cache with new data
      if (result.updatedProfile) {
        queryClient.setQueryData(['profile', user?.id], result.updatedProfile);
      }
      
      // Force a refetch from server
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast('Foto de perfil atualizada com sucesso');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar foto de perfil:', error);
      toast(error.message || 'Falha ao atualizar foto de perfil');
    }
  });

  // Simple refresh method that forces immediate invalidation
  const refreshProfile = () => {
    console.log('Forcing profile refresh');
    queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['pixKey', 'primary', user?.id] });
  };
  
  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading || !user,
    error: profileQuery.error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
    uploadProfileImage: uploadProfileImage.mutate,
    isUploadingImage: uploadProfileImage.isPending,
    pixKey: pixKeyQuery.data,
    isLoadingPixKey: pixKeyQuery.isLoading || !user,
    refreshProfile,
  };
}
