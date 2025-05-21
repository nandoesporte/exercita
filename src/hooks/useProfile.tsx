
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
        
        // No persistent URL modification here, just return the data
        console.log('Perfil carregado:', data);
        return data as Profile;
      } catch (error) {
        console.error('Exception in profile fetch:', error);
        return null;
      }
    },
    enabled: !!user,
    staleTime: 0, // Consider data always stale to ensure freshness
    gcTime: 1000 * 60 * 5, // Keep cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
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
    staleTime: 0, // Always fetch fresh data
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
      
      const { data, error } = await supabase
        .from('profiles')
        .update(cleanedProfileData)
        .eq('id', user.id)
        .select();
      
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw new Error(`Erro ao atualizar perfil: ${error.message}`);
      }
      
      console.log('Perfil atualizado com sucesso:', data);
      
      // Check if there's returned data
      if (!data || data.length === 0) {
        console.warn('Nenhum dado retornado após atualização do perfil');
        return null;
      }
      
      return data[0] as Profile;
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
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: 'no-cache, no-store, must-revalidate',
          upsert: true,
        });
      
      if (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }
      
      console.log('Upload realizado com sucesso:', uploadData);
      
      // Get public URL with a simple timestamp to avoid caching
      const { data: urlData } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Erro ao obter URL pública do avatar');
      }
      
      // Create a clean URL with a single timestamp parameter
      const baseUrl = urlData.publicUrl;
      const avatarUrl = `${baseUrl}?t=${Date.now()}`;
      
      console.log('URL do avatar com cache busting:', avatarUrl);
      
      // Update profile with new avatar URL
      const { error: updateError, data: profileData } = await supabase
        .from('profiles')
        .update({ avatar_url: baseUrl }) // Store clean URL without timestamp
        .eq('id', user.id)
        .select();
      
      if (updateError) {
        console.error('Erro ao atualizar perfil com novo avatar:', updateError);
        throw new Error(`Erro ao atualizar perfil com novo avatar: ${updateError.message}`);
      }
      
      console.log('Perfil atualizado com novo avatar:', profileData);
      
      return { 
        avatarUrl: baseUrl, // Return clean URL
        updatedProfile: profileData?.[0] 
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
